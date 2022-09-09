import motor.motor_asyncio
import asyncio
from datetime import datetime
from mqtt import MqttSender

# mongodb config
ipAdress = 'localhost'
port = 27017
uri = f'mongodb://{ipAdress}:{port}'

# mongodb client
client = motor.motor_asyncio.AsyncIOMotorClient(uri)

# databases
database = client['positions']
collection_filtered_human = database['FilteredDataHuman']
collection_filtered_vehicle = database['FilteredDataVehicle']

# mqtt config
mqtt_broker = "localhost"
mqtt_port = 1883

mqtt_sender_vehicle = MqttSender(
    mqtt_broker, mqtt_port, "position", "vehicle")
mqtt_sender_human = MqttSender(
    mqtt_broker, mqtt_port, "position", "human")

def serialize_data(doc):
    payload = {}
    for index, instance in doc["instances"].items():
        v = {}
        v["x"] = instance["pos_x"]
        v["y"] = instance["pos_y"]
        payload[index] = v
    return payload

async def replay(collection, client):
    cursor = collection.find() # safe to assume natural order (insertion order) https://stackoverflow.com/a/11599283
    first_doc = await cursor.next()
    last_timestamp = first_doc["timestamp"]
    async for doc in cursor:
        timestamp = doc["timestamp"]
        seconds_diff = (timestamp - last_timestamp).total_seconds()
        await asyncio.sleep(max(0, seconds_diff))
        last_timestamp = timestamp

        payload = serialize_data(doc)
        client.send(payload)

loop = asyncio.new_event_loop()
loop.create_task(replay(collection_filtered_human, mqtt_sender_human))
loop.create_task(replay(collection_filtered_vehicle, mqtt_sender_vehicle))
loop.run_forever()