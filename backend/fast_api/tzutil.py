import pytz

# MongoDB does not support time zones
# https://pymongo.readthedocs.io/en/stable/examples/datetimes.html

def mongo_to_tz(timestamp):
    return pytz.timezone('Europe/Berlin').localize(timestamp)

def tz_to_mongo(timestamp):
    return timestamp.astimezone(pytz.timezone('Europe/Berlin')).replace(tzinfo=None)