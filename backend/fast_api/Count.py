from Speed import Speed
from cmap import cmap_with_alpha
import seaborn as sns
import pandas as pd

class Count(Speed):
    async def _create_trace(self, areas, from_date, to_date, kind, name):
        trace = {}
        trace["name"] = name
        trace["x"] = []
        trace["y"] = []
        trace["mode"] = "lines"
        trace["type"] = "scatter"

        async for timestamp, objects in self._iterate_speed(from_date, to_date, kind):
            ids = []
            for o in objects:
                include = False
                for area in areas:
                    if area["x0"] <= o["x"] <= area["x1"] and area["y0"] <= o["y"] <= area["y1"]:
                        include = True
                        break
                if len(areas) == 0 or include:
                    ids.append(o["id"])

            trace["x"].append(timestamp)
            trace["y"].append(len(ids))

        return trace

    async def generate_graph(self, areas, from_date, to_date):
        return [
            await self._create_trace(areas, from_date, to_date, "human", "Menschen"),
            await self._create_trace(areas, from_date, to_date, "vehicle", "Fahrzeuge")
        ]

    async def generate_map(self, threshold, color_scheme, bw, transparency, exclude_humans, exclude_vehicles, from_date, to_date):
        docs = []

        if not exclude_humans:
            async for _, objects in self._iterate_speed(from_date, to_date, "human"):
                if len(objects) >= threshold:
                    for o in objects:
                        docs.append(o)

        if not exclude_vehicles:
            async for _, objects in self._iterate_speed(from_date, to_date, "vehicle"):
                if len(objects) >= threshold:
                    for o in objects:
                        docs.append(o)

        if len(docs) == 0:
            return None

        df = pd.DataFrame.from_records(docs)
        if len(docs) > 20000:
            df = df.sample(n=20000) # improve performance by sampling

        ax = sns.kdeplot(x=df["y"], y=df["x"], fill=True, cmap=cmap_with_alpha(color_scheme, 1 - transparency), bw_adjust=bw, levels=100, gridsize=100)

        return ax
