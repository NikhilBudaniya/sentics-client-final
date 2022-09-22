import math
import random
from Metric import Metric
from cmap import cmap_with_alpha
from database import database
from tzutil import mongo_to_tz, tz_to_mongo
import seaborn as sns
import pandas as pd
from datetime import timedelta

# assume zero when there is no activity for the given period
MIN_DELTA_MS = 1000.0 / 4 * 1.5


class Speed(Metric):
    # post-process sensor data, yielding events with speed, distance and smoothed positions
    async def _iterate_speed(self, from_date, to_date, kind, group=True):
        previous_objects = []

        from_date = tz_to_mongo(from_date)
        to_date = tz_to_mongo(to_date)

        pipeline = []

        pipeline.append({
            "$match": {
                "timestamp": {
                    "$gte": from_date,
                    "$lte": to_date
                }
            },
        })

        if group:
            pipeline.append({
                "$group": {
                    "_id": {
                        "timestamp": {
                            "$dateTrunc": {
                                "date": "$timestamp",
                                "unit": "second"
                            }
                        }
                    },
                    "timestamp": {
                        "$last": "$timestamp"
                    },
                    "instances": {
                        "$last": "$instances"
                    }
                }
            })

        pipeline.append({
            "$sort": {
                "timestamp": 1
            }
        })

        last_timestamp = None
        async for doc in database["FilteredDataHuman" if kind == "human" else "FilteredDataVehicle"].aggregate(pipeline, allowDiskUse=True):
            timestamp = mongo_to_tz(doc["timestamp"])
            delta_milliseconds = (
                timestamp - last_timestamp).total_seconds() * 1000 if last_timestamp else MIN_DELTA_MS
            
            if delta_milliseconds == 0:
                continue

            # database stores only events with activity,
            # so yield "zero" for seconds with no data
            if group and last_timestamp is not None:
                for step in range(int(delta_milliseconds / 1000)):
                    yield last_timestamp + timedelta(seconds=step), []
            if not group and last_timestamp is not None:
                for step in range(int(delta_milliseconds / MIN_DELTA_MS)):
                    yield last_timestamp + timedelta(milliseconds=step * MIN_DELTA_MS), []

            last_timestamp = timestamp
            objects = []

            for instance in doc["instances"].values():
                o = {}
                o["kind"] = kind
                o["timestamp"] = timestamp
                o["x"] = instance["pos_x"]
                o["y"] = instance["pos_y"]
                o["id"] = random.randint(1, 99999)
                o["dx"] = 0
                o["dy"] = 0
                o["speed"] = 0
                o["distance"] = 0

                # find closest object from last frame
                for last_object in previous_objects:
                    time_delta = (
                        timestamp - last_object["timestamp"]).total_seconds()
                    px = last_object["x"] + last_object["dx"] * time_delta
                    py = last_object["y"] + last_object["dy"] * time_delta
                    distance_to_projected = math.sqrt(
                        (px - o["x"]) ** 2 + (py - o["y"]) ** 2)

                    if distance_to_projected < 5:
                        o["id"] = last_object["id"]

                        # exponential smoothing for position
                        alpha_position = 1.0 if last_object["speed"] == 0 else 0.1
                        o["x"] = (1 - alpha_position) * \
                            px + alpha_position * o["x"]
                        o["y"] = (1 - alpha_position) * \
                            py + alpha_position * o["y"]

                        # exponential smoothing for velocity
                        alpha_delta = 1.0 if last_object["speed"] == 0 else 0.05
                        dist_x = o["x"] - last_object["x"]
                        dist_y = o["y"] - last_object["y"]
                        dx = dist_x / time_delta
                        dy = dist_y / time_delta
                        o["dx"] = (1 - alpha_delta) * \
                            last_object["dx"] + alpha_delta * dx
                        o["dy"] = (1 - alpha_delta) * \
                            last_object["dy"] + alpha_delta * dy

                        o["speed"] = math.sqrt(
                            o["dx"] ** 2 + o["dy"] ** 2) * 3.6  # m/s to km/h

                        o["distance"] = math.sqrt(dist_x ** 2 + dist_y ** 2)

                        # remove object so ID doesn't get assigned again
                        previous_objects = [
                            o for o in previous_objects if o["id"] != last_object["id"]]
                        break

                objects.append(o)

            previous_objects = objects

            if len(objects) > 0:
                yield timestamp, objects

    async def _create_trace(self, areas, from_date, to_date, kind, name):
        trace = {}
        trace["name"] = name
        trace["x"] = []
        trace["y"] = []
        trace["mode"] = "lines"
        trace["type"] = "scatter"

        async for timestamp, objects in self._iterate_speed(from_date, to_date, kind):
            includes = 0
            for o in objects:
                include = False
                for area in areas:
                    if area["x0"] <= o["x"] <= area["x1"] and area["y0"] <= o["y"] <= area["y1"]:
                        include = True
                        break
                if len(areas) == 0 or include:
                    trace["x"].append(timestamp)
                    trace["y"].append(o["speed"])
                    includes += 1

            if includes == 0:
                trace["x"].append(timestamp)
                trace["y"].append(None)

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
                for o in objects:
                    if o["speed"] >= threshold:
                        docs.append(o)

        if not exclude_vehicles:
            async for _, objects in self._iterate_speed(from_date, to_date, "vehicle"):
                for o in objects:
                    if o["speed"] >= threshold:
                        docs.append(o)

        if len(docs) == 0:
            return None

        df = pd.DataFrame.from_records(docs)
        if len(docs) > 20000:
            df = df.sample(n=20000)  # improve performance by sampling

        ax = sns.kdeplot(x=df["y"], y=df["x"], weights=df["speed"], fill=True, cmap=cmap_with_alpha(
            color_scheme, 1 - transparency), bw_adjust=bw, levels=100, gridsize=100)

        return ax

    async def _generate_replay_for(self, from_date, to_date, kind):
        steps = {}

        async for _, objects in self._iterate_speed(from_date, to_date, kind, False):
            # each database row saves the positions of all objects at this timestamp
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

                key = int(timestamp.timestamp() * 1000)
                if key not in steps:
                    steps[key] = []
                steps[key].append(d)

        return steps

    async def generate_replay(self, from_date, to_date):
        steps = {}
        steps["human"] = await self._generate_replay_for(from_date, to_date, "human")
        steps["vehicle"] = await self._generate_replay_for(from_date, to_date, "vehicle")
        return steps
