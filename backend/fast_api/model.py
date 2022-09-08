from pydantic import BaseModel
from datetime import datetime


class Filtered(BaseModel):
    timestamp: datetime
    object_id: int
    instance_id: int
    pos_x: float
    pos_y: float
    vel_x: float
    vel_y: float
    confidence: float
    sensors: list

class FilteredNew(BaseModel):
    timestamp: datetime
    instances: dict

class Raw(BaseModel):
    timestamp: datetime
    sensor_id: int
    object_id: int
    instance_id: int
    pos_x: float
    pos_y: float
    vel_x: float
    vel_y: float
    confidence: float

class ActiveUnit(BaseModel):
    timestamp: datetime
    humans: int
    vehicles: int

class VehicleSpeed(BaseModel):
    timestamp: datetime
    max: float
    min: float
    avg: float

class Distance(BaseModel):
    timestamp: datetime
    min: float
    avg: float

class RiskScore(BaseModel):
    timestamp: datetime
    score: float

class RiskSituation(BaseModel):
    timestamp: datetime
    pos_x: float
    pos_y: float