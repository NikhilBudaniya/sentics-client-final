import React, { useEffect, useRef, useState } from 'react';
import h337 from "heatmap.js";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { BiRotateRight, BiRotateLeft } from 'react-icons/bi';
import useWindowDimensions from '../common/useWindowDimensions';

function Heatmap() {
    // const { height, width } = useWindowDimensions();
    const width = window.innerWidth;
    const [rotate, setRotate] = useState(0);

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
    }, [rotate]);

    const handleAddData = () => {
        let h = 20*width/100;
        let w = 60*width/100;

        // let h = 307;
        // let w = 921;

        // let h = 320;
        // let w = 384;

        let h1 = 100; //h = y-axis
        let w1 = 100; //w = x-axis

        let data = {
            x: Math.random() * w, // x coordinate of the datapoint, a number
            y: Math.random() * h, // y coordinate of the datapoint, a number
            // value: Math.random() * 100 // the value at datapoint(x, y)
            // x: w,
            // y: h,
            value: 100
        };
        console.log(data);
        heatmapInstance.addData(data);
    }

    const handleRotate = (type) => {
        if (type === "right") {
            if (rotate === 0 || rotate === 90 || rotate === 180)
                setRotate((prev) => { return (prev + 90) });
            else
                setRotate(0);
        }
        else {
            if (rotate === 0 || rotate === 90 || rotate === 180 || rotate === 270) {
                if (rotate === 0)
                    setRotate(270);
                else
                    setRotate((prev) => { return (prev - 90) });
            }
            else
                setRotate(0);
        }
    }

    return (
        <>
            <div className="w-full h-full bg-blue-400 p-5 flex flex-col items-center">

                <div className="w-full bg-red-100 flex justify-center items-center">
                    <div className="flex flex-col justify-center items-center">

                        <TransformWrapper
                            minScale={0.2}
                            limitToBounds={false}
                        >
                            {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
                                <React.Fragment>
                                    <div className="backStage">
                                        <TransformComponent >
                                            <div className={`heatmap heatmapcss ${rotate === 90 ? 'right' : rotate === 180 ? 'upsideDown' : rotate === 270 ? 'left' : ''}`}>

                                            </div>
                                        </TransformComponent>
                                    </div>
                                    <div className="flex justify-evenly my-5 w-full">
                                        <button onClick={() => zoomIn()} type="button" className="flex justify-center w-10 py-2 px-4  bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 focus:ring-offset-indigo-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg ">
                                            +
                                        </button>
                                        <button onClick={() => zoomOut()} type="button" className="flex justify-center w-10 py-2 px-4  bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 focus:ring-offset-indigo-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg ">
                                            -
                                        </button>
                                        <button onClick={() => {resetTransform(); setRotate(0);}} type="button" className="flex justify-center w-20 py-2 px-4  bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 focus:ring-offset-indigo-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg ">
                                            reset
                                        </button>
                                        <button onClick={() => handleRotate("left")} type="button" className="w-20 py-2 px-4 flex justify-center bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 focus:ring-offset-indigo-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg ">
                                            <BiRotateLeft size="20px" />
                                        </button>
                                        <button onClick={() => handleRotate("right")} type="button" className="w-20 py-2 px-4 flex justify-center bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 focus:ring-offset-indigo-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg ">
                                            <BiRotateRight size="20px" />
                                        </button>
                                    </div>
                                </React.Fragment>
                            )}
                        </TransformWrapper>
                    </div>
                </div>
                <button className="border-2 border-lime-600 bg-lime-400 p-2 rounded-xl my-5" onClick={handleAddData}>Add Data</button>

            </div>
        </>
    )
}

export default Heatmap