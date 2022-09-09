from datetime import datetime, tzinfo, timedelta
from pydoc_data.topics import topics
import motor.motor_asyncio
from random import randint
from queue import Queue
import numpy as np
import math
import json

from mqtt import MqttListener
from model import *

# general config
MAX_TIMEDELTA = 0.1
MIN_DISTANCE = 1.5

# mongodb config
ipAdress = 'localhost'
port = 27017
username = 'probility'
password = 'ProServ'
dbName = 'positions'
collectionName_active_units = 'ActiveUnits'
collectionName_vehicle_speed = 'VehicleSpeed'
collectionName_distances = 'Distances'
collectionName_risk_score = 'RiskScore'
collectionName_risk_situation = 'RiskSituation'
uri = f'mongodb://{ipAdress}:{port}/{dbName}'

# mongodb client
client = motor.motor_asyncio.AsyncIOMotorClient(uri)

# databases
database = client[dbName]
collection_active_units = database[collectionName_active_units]
collection_vehicle_speed = database[collectionName_vehicle_speed]
collection_distances = database[collectionName_distances]
collection_risk_score = database[collectionName_risk_score]
collection_risk_situation = database[collectionName_risk_situation]

# mqtt config
mqtt_broker = "192.168.1.10"
mqtt_port = 1883
mqtt_topic_filtered_vehicles = "position/vehicle"
mqtt_topic_filtered_humans = "position/human"

# queue
q_filtered = Queue()

# receive mqtt-data
def mqtt_recv(client, userdata, msg):
    global q_filtered
    # parse input
    timestamp = datetime.now().replace(tzinfo=None)
    topic = msg.topic
    value = json.loads(msg.payload.decode('utf-8'))
    # print(value)
    q_filtered.put([timestamp, topic, value])

# create mqtt listener
mqtt_listener_filtered = MqttListener(
    mqtt_broker, mqtt_port, mqtt_topic_filtered_humans, mqtt_recv)
mqtt_listener_filtered = MqttListener(
    mqtt_broker, mqtt_port, mqtt_topic_filtered_vehicles, mqtt_recv)


last_human = [datetime.now().replace(tzinfo=None)]
last_vehicle = [datetime.now().replace(tzinfo=None)]

# bundle human und 
def bundle_data(element):
    global last_human, last_vehicle
    current_time = datetime.now().replace(tzinfo=None)
    humans = []
    vehicles = []
    if "human" in element[1]:
        last_human = element
        humans.append(element[2])    
        if last_vehicle[0] + timedelta(seconds=MAX_TIMEDELTA) >= current_time:
            vehicles.append(element[2])
    if "vehicle" in element[1]:
        last_vehicle = element
        vehicles.append(element[2])
        if last_human[0] + timedelta(seconds=MAX_TIMEDELTA) >= current_time:
            humans.append(element[2])
    return current_time, humans, vehicles

# get data from current values
def get_ActiveUnits(current_time, humans, vehicles):
    am_humans, am_vehicles = 0, 0
    if len(humans) > 0:
        am_humans = len(humans[0])
    if len(vehicles) > 0:
        am_vehicles = len(vehicles[0])
    return ActiveUnit(
        timestamp=current_time,
        humans=am_humans,
        vehicles=am_vehicles
    ) 

def get_VehicleSpeed(current_time, vehicles):
    speeds = []
    if len(vehicles) > 0:
        for vehicle in vehicles[0]:
            speeds.append(vehicles[0][vehicle]['x'])
        return VehicleSpeed(
            timestamp=current_time,
            max=max(speeds),
            min=min(speeds),
            avg=sum(speeds) / len(speeds)
        )
    else: 
        return None

def distance_to(x0, y0, x1, y1):
    return math.sqrt((x1-x0)**2+(y1-y0)**2)

def get_Distances(current_time, humans, vehicles):
    if len(humans) > 0 and len(vehicles):
        distances_min = []
        distances_avg = []
        risk_positions = []
        for v in vehicles[0]:
            vehicle = vehicles[0][v]
            distances_vehicles = []
            for h in humans[0]:
                human = humans[0][h]
                d = distance_to(vehicle['x'], vehicle['y'], human['x'], human['y'])
                if not d == 0.0:
                    distances_vehicles.append(d)
                    if d < MIN_DISTANCE:
                        risk_positions.append([human['x'], human['y']])
                distances_avg.append(distances_vehicles)
            if len(distances_min) > 0:
                distances_min.append(min(distances_vehicles))

        if len(distances_min) > 0 and len(distances_avg) > 0:
            distance = Distance(
                timestamp=current_time,
                min=min(distances_min),
                avg=sum(distances_avg)/len(distances_avg)
            )
            risk_situations = []
            for risk in risk_positions:
                risk_situations.append(RiskSituation(
                    timestamp=current_time,
                    pos_x=risk[0],
                    pos_y=risk[1],
                ))
            return distance, risk_situations
    return None, None

def get_RiskScore(current_time, vehicle_speed, distance):
    return RiskScore(
        timestamp=current_time,
        score=round(vehicle_speed.max / distance.min, 2)
    )


# MongoDB add functions
async def add_active_units(active_units: ActiveUnit):
    document = active_units
    return await collection_active_units.insert_one(document.dict())

async def add_vehicle_speed(vehicle_speed: VehicleSpeed):
    document = vehicle_speed
    return await collection_vehicle_speed.insert_one(document.dict())

async def add_distance(distance: Distance):
    document = distance
    return await collection_distances.insert_one(document.dict())

async def add_risk_score(risk_score: RiskScore):
    document = risk_score
    return await collection_risk_score.insert_one(document.dict())

async def add_risk_situation(risk_situation: RiskSituation):
    document = risk_situation
    return await collection_risk_situation.insert_one(document.dict())


# main loop
running = True
while running:
    while not q_filtered.empty():
        element = q_filtered.get()
        current_time, humans, vehicles = bundle_data(element)
        active_units = get_ActiveUnits(current_time, humans, vehicles)
        vehicle_speed = get_VehicleSpeed(current_time, vehicles)
        distance, risk_situations = get_Distances(current_time, humans, vehicles)
        if distance and vehicle_speed:
            risk_score = get_RiskScore(current_time, vehicle_speed, distance)
        else:
            risk_score = None

        # upload data to mongodb
        loop = client.get_io_loop()
        if active_units:
            loop.run_until_complete(add_active_units(active_units))
        if vehicle_speed:
            loop.run_until_complete(add_vehicle_speed(vehicle_speed))
        if distance:
            loop.run_until_complete(add_distance(distance))
        if risk_score:
            loop.run_until_complete(add_risk_score(risk_score))
        if risk_situations: 
            if len(risk_situations) > 0:
                for risk in risk_situations:
                    loop.run_until_complete(add_risk_situation(risk))

