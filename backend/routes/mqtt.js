const express = require('express');
const router = express.Router();
require("dotenv").config();

const mqtt_port = process.env.MQTT_PORT || 1883;
const mqtt_ip = process.env.MQTT_IP || '192.168.1.10';


module.exports = router;