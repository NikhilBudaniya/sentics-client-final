import os
from SafetyScore import SafetyScore
from Speed import Speed
from Count import Count
from Distance import Distance
from fastapi import FastAPI, Query
from fastapi.responses import Response, StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import json
from influxdb_client import InfluxDBClient
from mqtt import MqttListener
from pymongo import MongoClient

from InfluxDBSaver import InfluxDBSaver
from CurrentPositionTracker import CurrentPositionTracker

mqtt_broker = os.environ.get("MQTT_HOST") or "localhost"
mqtt_port = 1883
mqtt_topic_filtered_vehicles = "position/vehicle"
mqtt_topic_filtered_humans = "position/human"

mongo_uri = "mongodb://localhost:27017"
mongo_client = MongoClient(mongo_uri)
mongo_collection = mongo_client["positions"]["FilteredDataHuman"]

ohlf_width = 82
ohlf_height = 26

# influxclient = InfluxDBClient(url="http://localhost:8086",
#                               token="eg5DyhbQhtZ4Bo3-uC-vwxSjWGXnHb3eh3_rSarnSoB2g0f5Sk_8kg92hTQwJVgaeHdwCBlztcbfQswZVaewHg==", org="sentics")
# saver = InfluxDBSaver(influxclient, "sentics")

humans_position_tracker = CurrentPositionTracker(
    "human", ohlf_width, ohlf_height)
vehicles_position_tracker = CurrentPositionTracker(
    "vehicle", ohlf_width, ohlf_height)


def mqtt_receive(client, userdata, msg):
    timestamp = datetime.now().replace(tzinfo=None)
    topic = msg.topic
    payload = json.loads(msg.payload.decode("utf-8"))
    if "human" in topic:
        humans_position_tracker.on_receive(timestamp, payload)
    if "vehicle" in topic:
        vehicles_position_tracker.on_receive(timestamp, payload)
    saver.save([humans_position_tracker, vehicles_position_tracker])


MqttListener(mqtt_broker, mqtt_port, "position/vehicle", mqtt_receive)
MqttListener(mqtt_broker, mqtt_port, "position/human", mqtt_receive)


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def get_root():
    data = """
    {
        "status": "ok",
        "text": "Hello World!"
    }
    """
    return Response(content=data, media_type="application/json")


@app.get("/api/environment")
async def get_environment():
    # image sources:
    # https://www.flaticon.com/free-icon/construction-worker_3588614#
    # https://www.flaticon.com/free-icon/forklift_4320180
    # https://www.flaticon.com/free-icon/explode_7445281#
    data = """
    {{
        "map": {{
            "widthMeters": {width},
            "heightMeters": {height},
            "image": "/image/ohlf.png"
        }},
        "objects": [
            {{
                "kind": "vehicle",
                "radiusMeters": 3,
                "icon": "/image/forklift.png"
            }},
            {{
                "kind": "human",
                "radiusMeters": 1,
                "icon": "/image/construction-worker.png"
            }}
        ]
    }}
    """.format(width=ohlf_width, height=ohlf_height)
    return Response(content=data, media_type="application/json")


@app.get("/api/live")
async def get_live_positions():
    data = {}
    data["positions"] = humans_position_tracker.get_if_current(
    ) + vehicles_position_tracker.get_if_current()
    return data


safety_score = SafetyScore(ohlf_width, ohlf_height, "./media/ohlf.png")


@app.get("/api/statistics/safety-score-over-time")
async def get_safety_score_over_time(response: Response, areas: str, from_date: datetime = Query(None, alias="from"), to_date: datetime = Query(None, alias="to")):
    response.headers["Cache-Control"] = "public, max-age=600"
    return await safety_score.handle_graph_request(areas, from_date, to_date)


@app.get("/api/graphs/safety-score-kde")
async def get_safety_score_kde(response: Response, areas: str, threshold: float, colorScheme: str, bw: float, transparency: float, excludeHumans: bool, excludeVehicles: bool, from_date: datetime = Query(None, alias="from"), to_date: datetime = Query(None, alias="to")):
    response.headers["Cache-Control"] = "public, max-age=600"
    return await safety_score.handle_map_request(areas, threshold, colorScheme, bw, transparency, excludeHumans, excludeVehicles, from_date, to_date)


speed = Speed(ohlf_width, ohlf_height, "./media/ohlf.png")


@app.get("/api/statistics/activity-over-time")
async def get_activity_over_time(response: Response, areas: str, from_date: datetime = Query(None, alias="from"), to_date: datetime = Query(None, alias="to")):
    response.headers["Cache-Control"] = "public, max-age=600"
    return await speed.handle_graph_request(areas, from_date, to_date)


@app.get("/api/graphs/activity-kde")
async def get_speed_kde(response: Response, areas: str, threshold: float, colorScheme, bw: float, transparency: float, excludeHumans: bool, excludeVehicles: bool, from_date: datetime = Query(None, alias="from"), to_date: datetime = Query(None, alias="to")):
    response.headers["Cache-Control"] = "public, max-age=600"
    return await speed.handle_map_request(areas, threshold, colorScheme, bw, transparency, excludeHumans, excludeVehicles, from_date, to_date)


@app.get("/api/replay")
async def get_replay_positions(response: Response, from_date: datetime = Query(None, alias="from"), to_date: datetime = Query(None, alias="to")):
    response.headers["Cache-Control"] = "public, max-age=600"
    return await speed.generate_replay(from_date, to_date)


@app.get("/api/spaghetti")
async def get_spaghetti(response: Response, areas: str, linewidth: int, excludeHumans: bool, excludeVehicles: bool, from_date: datetime = Query(None, alias="from"), to_date: datetime = Query(None, alias="to")):
    response.headers["Cache-Control"] = "public, max-age=600"
    return StreamingResponse(await safety_score.generate_spaghetti(areas, linewidth, excludeHumans, excludeVehicles, from_date, to_date), media_type="image/png")


count = Count(ohlf_width, ohlf_height, "./media/ohlf.png")


@app.get("/api/statistics/count-over-time")
async def get_count_over_time(response: Response, areas: str, from_date: datetime = Query(None, alias="from"), to_date: datetime = Query(None, alias="to")):
    response.headers["Cache-Control"] = "public, max-age=600"
    return await count.handle_graph_request(areas, from_date, to_date)


@app.get("/api/graphs/count-kde")
async def get_count_kde(response: Response, areas: str, threshold: float, colorScheme: str, bw: float, transparency: float, excludeHumans: bool, excludeVehicles: bool, from_date: datetime = Query(None, alias="from"), to_date: datetime = Query(None, alias="to")):
    response.headers["Cache-Control"] = "public, max-age=600"
    return await count.handle_map_request(areas, threshold, colorScheme, bw, transparency, excludeHumans, excludeVehicles, from_date, to_date)


distance = Distance(ohlf_width, ohlf_height, "./media/ohlf.png")


@app.get("/api/statistics/distance-over-time")
async def get_distance_over_time(response: Response, areas: str, from_date: datetime = Query(None, alias="from"), to_date: datetime = Query(None, alias="to")):
    response.headers["Cache-Control"] = "public, max-age=600"
    return await distance.handle_graph_request(areas, from_date, to_date)


@app.get("/api/graphs/distance-kde")
async def get_distance_kde(response: Response, threshold: float, areas: str, colorScheme: str, bw: float, transparency: float, excludeHumans: bool, excludeVehicles: bool, from_date: datetime = Query(None, alias="from"), to_date: datetime = Query(None, alias="to")):
    response.headers["Cache-Control"] = "public, max-age=600"
    return await distance.handle_map_request(areas, threshold, colorScheme, bw, transparency, excludeHumans, excludeVehicles, from_date, to_date)


app.mount("/image", StaticFiles(directory="media"), name="image")
