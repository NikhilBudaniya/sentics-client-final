import io
from Speed import Speed
from calculate_safety_score import calculate_safety_score
from cmap import cmap_with_alpha
import seaborn as sns
import pandas as pd
from PIL import Image, ImageDraw


class SafetyScore(Speed):
    async def _iterate_safety(self, from_date, to_date):
        vehicle_positions_by_second = {}

        async for timestamp, objects in self._iterate_speed(from_date, to_date, "human"):
            positions = []

            for o in objects:
                positions.append(o)

            if len(positions) > 0:
                vehicle_positions_by_second[timestamp] = positions

        async for timestamp, objects in self._iterate_speed(from_date, to_date, "vehicle"):
            points = calculate_safety_score(
                timestamp, vehicle_positions_by_second.get(timestamp, []), objects)
            yield timestamp, points

    async def generate_graph(self, areas, from_date, to_date):
        trace = {}
        trace["name"] = "Safety Score"
        trace["x"] = []
        trace["y"] = []
        trace["mode"] = "lines"
        trace["type"] = "scatter"

        async for timestamp, points in self._iterate_safety(from_date, to_date):
            includes = 0
            for p in points:
                include = False
                for area in areas:
                    if area["x0"] <= p["x"] <= area["x1"] and area["y0"] <= p["y"] <= area["y1"]:
                        include = True
                        break
                if len(areas) == 0 or include:
                    trace["x"].append(timestamp)
                    trace["y"].append(p["graph_y"])
                    includes += 1

            if includes == 0:
                trace["x"].append(timestamp)
                trace["y"].append(None)

        return [trace]

    async def generate_map(self, threshold, color_scheme, bw, transparency, exclude_humans, exclude_vehicles, from_date, to_date):
        docs = []

        async for _, objects in self._iterate_safety(from_date, to_date):
            for o in objects:
                if o["graph_y"] >= threshold:
                    docs.append(o)

        if len(docs) == 0:
            return None

        df = pd.DataFrame.from_records(docs)
        if len(docs) > 20000:
            df = df.sample(n=20000)  # improve performance by sampling

        ax = sns.kdeplot(x=df["y"], y=df["x"], weights=df["kde_weight"], fill=True, cmap=cmap_with_alpha(
            color_scheme, 1 - transparency), bw_adjust=bw, levels=100, gridsize=100)

        return ax

    async def _generate_spaghetti_for(self, steps, from_date, to_date, kind):
        async for _, objects in self._iterate_speed(from_date, to_date, kind, False):
            for o in objects:
                d = {}
                timestamp = o["timestamp"]
                d["timestamp"] = timestamp
                d["id"] = o["id"]
                d["kind"] = o["kind"]

                # transpose coordinates
                # so that (x=0, y=0) is top left and (x=width, y=0) top right
                d["x"] = self.map_width - o["y"]
                d["y"] = self.map_height - o["x"]
                d["dx"] = -o["dy"]
                d["dy"] = -o["dx"]

                if timestamp not in steps:
                    steps[timestamp] = []
                steps[timestamp].append(d)

    async def _generate_spaghetti_for(self, draw, from_date, to_date, kind, scale_x, scale_y, linewidth, color_palette):
        colors = sns.color_palette(color_palette)

        last_objects = {}
        async for _, objects in self._iterate_speed(from_date, to_date, kind, False):
            new_last_objects = {}
            for o in objects:
                # transpose coordinates
                # so that (x=0, y=0) is top left and (x=width, y=0) top right
                x = self.map_width - o["y"]
                y = self.map_height - o["x"]

                color = tuple([int(c * 255)
                              for c in colors[o["id"] % len(colors)]])
                if o["id"] in last_objects:
                    from_object = last_objects[o["id"]]
                    draw.line(((from_object[0] * scale_x), (from_object[1] * scale_y),
                              (x * scale_x), (y * scale_y)), fill=color, width=linewidth)
                new_last_objects[o["id"]] = (x, y)
            last_objects = new_last_objects

    def _draw_areas(self, draw, areas, scale_x, scale_y):
        for area in areas:
            draw.rectangle(((self.map_width - area["x0"]) * scale_x, (self.map_height - area["y0"]) * scale_y, (self.map_width - area["x1"]) * scale_x,
                            (self.map_height - area["y1"]) * scale_y), outline="red", width=3)

    async def generate_spaghetti(self, areas, linewidth, exclude_humans, exclude_vehicles, from_date, to_date):
        with Image.open(self.map_path) as background:
            im = Image.new("RGB", background.size, (255, 255, 255))
            im.paste(background, mask=background.split()[3])
            draw = ImageDraw.Draw(im, "RGBA")
            scale_x = im.width / self.map_width
            scale_y = im.height / self.map_height

            if not exclude_humans:
                await self._generate_spaghetti_for(draw, from_date, to_date, "human", scale_x, scale_y, linewidth, "crest")
            if not exclude_vehicles:
                await self._generate_spaghetti_for(draw, from_date, to_date, "vehicle", scale_x, scale_y, linewidth, "flare")

            self._draw_areas(draw, self._parse_areas(areas), scale_x, scale_y)

            # save im as buffer
            buf = io.BytesIO()
            im.save(buf, format="PNG")
            buf.seek(0)

            return buf
