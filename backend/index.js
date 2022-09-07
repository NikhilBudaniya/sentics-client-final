const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const address = '134.169.114.202' || '192.168.56.1';
const cors = require('cors')
require("dotenv").config();
// for mqtt 
const mqtt = require('mqtt');
const mqtt_port = process.env.MQTT_PORT || 1883;
const mqtt_ip = process.env.MQTT_IP || '192.168.1.10';

app.use(express.json());
app.use(cors({
    'allowedHeaders': ['Content-Type'],
    'origin': '*',
    'preflightContinue': true
}));

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
let mqtt_buffer_human = '';
let mqtt_buffer_vehicle = '';

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

    // this statement is added to send the building map via backend (not currently being used)
    if (table === "map") {
        const map = req.body.map;
        map_data = require(`./public/data/maps/${map}.json`)
        res.json({
            status: "success",
            map_data
        });
    }
    if (source === 'mqtt') {
        let data = [];

        if (resource === "")
            return res.json({ data });

        if (mqtt_buffer_human !== "" && resource !== "vehicle") {
            data = [...data, {
                "type": "human",
                "value": mqtt_buffer_human
            }]
            mqtt_buffer_human = "";
        }
        if (mqtt_buffer_vehicle !== "" && resource !== "human") {
            data = [...data, {
                "type": "vehicle",
                "value": mqtt_buffer_vehicle
            }]
            mqtt_buffer_vehicle = "";
        }

        // for testing purpose

        // if (resource === "human") {
        //     return res.json({
        //         data: [
        //             {
        //                 type: 'human',
        //                 value: '{"0":{"x": 0, "y": 0, "heading": 0.0},"2":{"x": 21.848, "y": 25.879, "heading": 0.184}}'
        //             },
        //         ]
        //     });
        // }
        // else if (resource === "vehicle") {
        //     return res.json({
        //         data: [
        //             {
        //                 type: 'vehicle',
        //                 value: '{"0":{"x": 15.131, "y": 50.075, "heading": -0.443}}'
        //             },
        //         ]
        //     });
        // }
        // else {
        //     return res.json({
        //         data: [
        //             {
        //                 type: 'human',
        //                 value: '{"0":{"x": 0, "y": 0, "heading": 0.0},"2":{"x": 21.848, "y": 25.879, "heading": 0.184}}'
        //             },
        //             {
        //                 type: 'vehicle',
        //                 value: '{"0":{"x": 15.131, "y": 50.075, "heading": -0.443}}'
        //             },
        //         ]
        //     });
        // }

        return res.json({ data })
    }
    res.status(400).json({ error: "invalid request parameters" });
})


app.listen(port,'134.169.114.202', () => {
    console.log(`Nodejs backend listening on Port: ${port}`);
}).on("error", (err) => {
    app.listen(port,'192.168.56.1', () => {
        console.log(`Nodejs backend listening on Port: ${port}`);
    })
})
