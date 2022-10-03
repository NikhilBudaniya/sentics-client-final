import math
from influxdb_client import Point
from influxdb_client.client.write_api import SYNCHRONOUS

class InfluxDBSaver:
    def __init__(self, client, bucket):
        self.client = client
        self.bucket = bucket
        self.write_api = client.write_api(write_options=SYNCHRONOUS)

    def _calculate_min_dists(self, objects):
        min_dist_by_kind = {}

        for o in objects:
            for o2 in objects:
                if o == o2:
                    continue
                dist = math.sqrt((o["x"] - o2["x"]) ** 2 + (o["y"] - o2["y"]) ** 2)
                
                kinds = "-".join(sorted([o["kind"], o2["kind"]]))
                min_dist = min_dist_by_kind.get(kinds, math.inf)
                min_dist_by_kind[kinds] = min(dist, min_dist)

        return min_dist_by_kind

    def _calculate_count(self, objects):
        count_by_kind = {}

        for o in objects:
            kind = o["kind"]
            count = count_by_kind.get(kind, 0)
            count_by_kind[kind] = count + 1

        return count_by_kind

    def save(self, trackers):
        objects = sum([tracker.get_if_current() for tracker in trackers], [])

        min_dists = self._calculate_min_dists(objects)
        points = [
            Point.measurement("distance")
                .field("min_distance", dist)
                .tag("link_type", kind)
            for kind, dist in min_dists.items()
        ]

        counts = self._calculate_count(objects)
        point = Point.measurement("count")
        for kind, count in counts.items():
            point.field("count_" + kind, count)

        self.write_api.write(self.bucket, record=[*points, point])