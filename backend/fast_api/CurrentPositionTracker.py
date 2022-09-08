import math
import random
from datetime import datetime

class CurrentPositionTracker:
    objects = []
    timestamp = None

    def __init__(self, kind, map_width, map_height):
        self.kind = kind
        self.map_width = map_width
        self.map_height = map_height

    def _parse_payload(self, payload, timestamp):
        previous_objects = self.objects
        objects = []
        for instance in payload:
            o = {}
            o["kind"] = self.kind
            o["timestamp"] = timestamp
            # transpose coordinates
            # so that (x=0, y=0) is top left and (x=width, y=0) top right
            o["x"] = self.map_width - payload[instance]["y"]
            o["y"] = self.map_height - payload[instance]["x"]

            # find closest object from last frame
            for last_object in previous_objects:
                time_delta = (timestamp - last_object["timestamp"]).total_seconds()
                px = last_object["x"] + last_object["dx"] * time_delta
                py = last_object["y"] + last_object["dy"] * time_delta
                distance_to_projected = math.sqrt((px - o["x"]) ** 2 + (py - o["y"]) ** 2)

                if distance_to_projected < 2:
                    o["id"] = last_object["id"]

                    # exponential smoothing for position
                    alpha_position = 1.0 if last_object["dx"] == 0 and last_object["dy"] == 0 else 0.1
                    o["x"] = (1 - alpha_position) * px + alpha_position * o["x"]
                    o["y"] = (1 - alpha_position) * py + alpha_position * o["y"]

                    # exponential smoothing for velocity
                    alpha_delta = 1.0 if last_object["dx"] == 0 and last_object["dy"] == 0 else 0.05
                    dx = (o["x"] - last_object["x"]) / time_delta
                    dy = (o["y"] - last_object["y"]) / time_delta
                    o["dx"] = (1 - alpha_delta) * last_object["dx"] + alpha_delta * dx
                    o["dy"] = (1 - alpha_delta) * last_object["dy"] + alpha_delta * dy

                    # remove object so ID doesn't get assigned again
                    previous_objects = [o for o in previous_objects if o["id"] != last_object["id"]]
                    break
            else:
                o["id"] = random.randint(1, 99999)
                o["dx"] = 0
                o["dy"] = 0

            objects.append(o)

        return objects
    
    def on_receive(self, timestamp, payload):
        self.objects = self._parse_payload(payload, timestamp)
        self.timestamp = timestamp
    
    def get_if_current(self):
        if self.timestamp is not None and (datetime.now() - self.timestamp).total_seconds() <= 0.5:
            return self.objects
        return []
