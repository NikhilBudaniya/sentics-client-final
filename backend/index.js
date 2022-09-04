const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors')
require("dotenv").config();
// for mqtt 
const mqtt = require('mqtt');
const mqtt_port = process.env.MQTT_PORT || 1883;
const mqtt_ip = process.env.MQTT_IP || '192.168.1.10';

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('Hello World!')
})

// mqtt connection
const options = {
    // Clean Session
    clean: true,
    connectTimeout: 4000,
}
const client = mqtt.connect(`mqtt://${mqtt_ip}:${mqtt_port}`, options);
let mqtt_buffer_human = "";
let mqtt_buffer_vehicle = "";

client.on('connect', function () {
    console.log("connected to mqtt");
    client.subscribe('position/human', function (err) {
        if (err) {
            console.log(err);
        }
    })
    client.subscribe('position/vehicle', function (err) {
        if (err) {
            console.log(err);
            console.log('Check the topic');
        }
    })
})

client.on('message', function (topic, payload, packet) {
    // payload is buffer
    if (topic == 'position/human') {
        mqtt_buffer_human = payload.toString()
    }
    if (topic == 'position/vehicle') {
        mqtt_buffer_vehicle = payload.toString()
    }
})

app.post('/api/live', (req, res) => {
    const source = req.body.source;
    const table = req.body.table;
    const resource = req.body.resource;

    if (table === "map") {
        const map = req.body.map;
        map_data = require(`./public/data/maps/${map}.json`)
        res.json({
            status: "success",
            map_data
        });
    }
    if (source === 'mqtt') {
        let data = {};

        if (mqtt_buffer_human !== "" && resource !== "vehicle") {
            data = [{
                "type": "human",
                "value": mqtt_buffer_human
            }]
            mqtt_buffer_human = "";
        }
        if (mqtt_buffer_vehicle !== "" && resource !== "human") {
            data = [{
                "type": "vehicle",
                "value": mqtt_buffer_vehicle
            }]
            mqtt_buffer_vehicle = "";
        }

        return res.json({ data });
    }
    res.status(400).json({ error: "invalid request parameters" });
})

app.listen(port, () => {
    console.log(`Nodejs backend listening on Port: ${port}`);
})