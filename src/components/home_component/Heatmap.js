import React, { useEffect } from 'react';
import h337 from "heatmap.js";

function Heatmap() {
    var config = {
        container: document.querySelector('.heatmap'),
        radius: 10,
        maxOpacity: .5,
        minOpacity: 0,
        blur: .75
    };

    var dataPoint = {
        x: 5, // x coordinate of the datapoint, a number
        y: 5, // y coordinate of the datapoint, a number
        value: 0 // the value at datapoint(x, y)
    };

    var data = {
        max: 100,
        min: 0,
        data: [
            dataPoint,
            {
                x: 507,
                y: 500,
                value: 20
            },
            {
                x: 500,
                y: 538,
                value: 60
            },
            {
                x: 467,
                y: 555,
                value: 80
            }
        ]
    };

    var heatmapInstance;

    useEffect(() => {
        heatmapInstance = h337.create({
            container: document.querySelector('.heatmap')
        });

        heatmapInstance.setData(data);
    }, []);

    const handleAddData = () => {
        let h = 320;
        let w = 384;
        let data = {
            x: Math.random() * h, // x coordinate of the datapoint, a number
            y: Math.random() * w, // y coordinate of the datapoint, a number
            value: Math.random() * 100 // the value at datapoint(x, y)
        };
        heatmapInstance.addData(data);
        console.log(data);
    }

    return (<>
        <div className="w-full flex justify-center">
            <div className="heatmap bg-red-200 h-80 w-96">
                Heatmap
            </div>
        </div>
        <button className="border-2 border-slate-400 rounded-xl my-5" onClick={handleAddData}>Add Data</button>
    </>
    )
}

export default Heatmap