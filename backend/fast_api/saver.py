from datetime import datetime
import motor.motor_asyncio
from queue import Queue
import json

from mqtt import MqttListener
from model import FilteredNew
import os

# mongodb config
ipAdress = 'localhost'
port = 27017
username = 'probility'
password = 'ProServ'
dbName = 'positions'
uri = f'mongodb://{ipAdress}:{port}/{dbName}'

# mongodb client
client = motor.motor_asyncio.AsyncIOMotorClient(uri)

# databases
database = client[dbName]
collection_filtered_human = database['FilteredDataHuman']
collection_filtered_vehicle = database['FilteredDataVehicle']

# mqtt config
mqtt_broker = os.environ.get("MQTT_HOST") or "localhost"
mqtt_port = 1883


# add filtered data to mongodb
async def add_filtered_human(filtered: FilteredNew):
    document = filtered
    result = await collection_filtered_human.insert_one(document.dict())
    print(f'added {document}')

async def add_filtered_vehicle(filtered: FilteredNew):
    document = filtered
    result = await collection_filtered_vehicle.insert_one(document.dict())
    print(f'added {document}')

# queue
q_filtered = Queue()

last_timestamp_human = datetime.now().replace(tzinfo=None)
def mqtt_recv_human(client, userdata, msg):
    global q_filtered
    global last_timestamp_human
    timestamp = datetime.now().replace(tzinfo=None)
    # throttle to 4 FPS, discard all other events
    if (timestamp - last_timestamp_human).total_seconds() < 0.25:
        return
    last_timestamp_human = timestamp
    topic = msg.topic
    value = json.loads(msg.payload.decode('utf-8'))
    q_filtered.put([timestamp, topic, value])


last_timestamp_vehicle = datetime.now().replace(tzinfo=None)
def mqtt_recv_vehicle(client, userdata, msg):
    global q_filtered
    global last_timestamp_vehicle
    timestamp = datetime.now().replace(tzinfo=None)
    # throttle to 4 FPS, discard all other events
    if (timestamp - last_timestamp_vehicle).total_seconds() < 0.25:
        return
    last_timestamp_vehicle = timestamp
    topic = msg.topic
    value = json.loads(msg.payload.decode('utf-8'))
    q_filtered.put([timestamp, topic, value])


# create mqtt listener
MqttListener(mqtt_broker, mqtt_port, "position/human", mqtt_recv_human)
MqttListener(mqtt_broker, mqtt_port, "position/vehicle", mqtt_recv_vehicle)

# parse data to mongodb format
def parse_data(element):
    instances = {}
    for instance in element[2]:
        instances[instance] = {
            "pos_x": element[2][instance]['x'],
            "pos_y": element[2][instance]['y'],
            "vel_x": 0,
            "vel_y": 0,
            "confidence": 0,
            "sensors": []
        }
    filtered = FilteredNew(
        timestamp=element[0],
        instances=instances
    )
    return element[1], filtered

async def create_indices():
    collection_filtered_human.create_index('timestamp')
    collection_filtered_vehicle.create_index('timestamp')

loop = client.get_io_loop()
loop.run_until_complete(create_indices())

# main loop
running = True
while running:
    while not q_filtered.empty():
        element = q_filtered.get()
        topic, filtered = parse_data(element)
        if "human" in topic:
            loop.run_until_complete(add_filtered_human(filtered))
        elif "vehicle" in topic:
            loop.run_until_complete(add_filtered_vehicle(filtered))
