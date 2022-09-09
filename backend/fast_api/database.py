from model import FilteredNew
from pymongo import DESCENDING

# for same date https://www.mongodb.com/docs/manual/reference/operator/update/currentDate/
# possibilities https://pymongo.readthedocs.io/en/stable/tutorial.html


# MongoDB driver
import motor.motor_asyncio

ipAdress = 'localhost'
port = 27017
#username = 'sentics'
#password = 'sen*tics22'
username = 'probility'
password = 'ProServ'
dbName = 'positions'
collectionName_filtered = 'FilteredDataHuman'
collectionName_raw = 'rawData'
collectionName_userlog = 'userLog'

#uri = f'mongodb://{username}:{password}@{ipAdress}:{port}/{dbName}'
uri = f'mongodb://{ipAdress}:{port}/{dbName}'

client =  motor.motor_asyncio.AsyncIOMotorClient(uri)
# client = motor.motor_asyncio.AsyncIOMotorClient('mongodb+srv://sentics:sen*tics22@sentics.8xz8k.mongodb.net/?retryWrites=true&w=majority')

database = client[dbName]
# database = client.ToDoList
collection_filtered = database[collectionName_filtered]
collection_raw = database[collectionName_raw]
collection_userlog = database[collectionName_raw]

# filtered data
async def fetch_filtered_newest():
    finds = []
    cursor = collection_filtered.find({}).sort('timestamp', DESCENDING).limit(1)
    async for doc in cursor:
        finds.append(FilteredNew(**doc))
    return finds

async def fetch_filtered_since_timestamp(time):
    finds = []
    cursor = collection_filtered.find({})
    async for doc in cursor:
        f = FilteredNew(**doc)
        time = time.replace(tzinfo=None)
        if f.timestamp >= time:
            finds.append(f)
    return finds

async def fetch_filtered_amount(number):
    finds = []
    cursor = collection_filtered.find({}).sort('timestamp', DESCENDING).limit(number)
    async for doc in cursor:
        finds.append(FilteredNew(**doc))
    return finds

async def fetch_filtered_between_timestamps(time_0, time_1):
    finds = []
    cursor = collection_filtered.find({})
    async for doc in cursor:
        f = FilteredNew(**doc)
        time_0 = time_0.replace(tzinfo=None)
        time_1 = time_1.replace(tzinfo=None)
        if f.timestamp >= time_0 and f.timestamp <= time_1:
            finds.append(f)
    return finds

async def create_filtered(filtered):
    document = filtered
    result = await collection_filtered.insert_one(document)
    return document


# raw data
async def fetch_raw_since_timestamp_all(time):
    finds = []
    cursor = collection_raw.find({})
    async for doc in cursor:
        f = FilteredNew(**doc)
        time = time.replace(tzinfo=None)
        if f.timestamp >= time:
            finds.append(f)
    return finds

async def fetch_raw_amount_all(number):
    finds = []
    cursor = collection_raw.find({}).sort('timestamp', DESCENDING).limit(number)
    async for doc in cursor:
        finds.append(FilteredNew(**doc))
    return finds

async def fetch_raw_between_timestamps_all(time_0, time_1):
    finds = []
    cursor = collection_raw.find({})
    async for doc in cursor:
        f = FilteredNew(**doc)
        time_0 = time_0.replace(tzinfo=None)
        time_1 = time_1.replace(tzinfo=None)
        if f.timestamp >= time_0 and f.timestamp <= time_1:
            finds.append(f)
    return finds

async def fetch_raw_since_timestamp_specific(time, sensor_id):
    finds = []
    cursor = collection_raw.find({'sensor_id': sensor_id})
    async for doc in cursor:
        f = FilteredNew(**doc)
        time = time.replace(tzinfo=None)
        if f.timestamp >= time:
            finds.append(f)
    return finds

async def fetch_raw_amount_specific(number, sensor_id):
    finds = []
    cursor = collection_raw.find({'sensor_id': sensor_id}).sort('timestamp', DESCENDING).limit(number)
    async for doc in cursor:
        finds.append(FilteredNew(**doc))
    return finds

async def fetch_raw_between_timestamps_specific(time_0, time_1, sensor_id):
    finds = []
    cursor = collection_raw.find({'sensor_id': sensor_id})
    async for doc in cursor:
        f = FilteredNew(**doc)
        time_0 = time_0.replace(tzinfo=None)
        time_1 = time_1.replace(tzinfo=None)
        if f.timestamp >= time_0 and f.timestamp <= time_1:
            finds.append(f)
    return finds

async def create_raw(raw):
    document = raw
    result = await collection_raw.insert_one(document)
    return document


# user log
async def fetch_log_since_timestamp_all(time):
    pass

async def fetch_log_amount_all(time):
    pass

async def fetch_log_between_timestamps_all(time_0, time_1):
    pass

async def create_log(timestamp, user_id, action):
    pass
