import React, { useState } from 'react'
import { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { setHeatmapResource } from '../../state/reducers/heatmapResourceReducer';
import { updateThreedDataVehicle, updateThreedShowHumans, updateThreedShowVehicles } from '../../state/reducers/threedReducer';
import ToggleSwith from '../utilities/utilComponents/ToggleSwith'

function ResourceBtns() {
    let dispatch = useDispatch();
    let location = useLocation();
    let mapType = useSelector((store) => store.mapType.value);
    const [checkHuman, setCheckHuman] = useState(true);
    const [checkVehicle, setCheckVehicle] = useState(true);
    let show_vehicles = useSelector((store) => store.threedVars.value.showVehicles);
    let show_humans = useSelector((store) => store.threedVars.value.showHumans);
    var person_cubes = useSelector((store) => store.threedVars.value.person_cubes);
    var vehicle_cubes = useSelector((store) => store.threedVars.value.vehicle_cubes);


    const checked = useRef({
        human: true,
        vehicle: true,
    });

    const handleClick2d = (type) => {
        if (type === "human") {
            // for 3d map
            dispatch(updateThreedShowHumans(!show_humans));
            //  NOTE: the implementation of toggling entities is different in 2d and 3d maps
            // in 2d maps, the api NODEjs api is used which is optimized on backend for the same
            // in 3d maps, the Python api is used which doesn't provide filtering on the backend
            // toggling vechicles

            // for 2d map
            checked.current = {
                ...checked.current, human: !checked.current.human
            }
        }
        else {
            // for 3d map
            dispatch(updateThreedShowVehicles(!show_vehicles));
            // for (var i = 0; i < vehicle_cubes.length; i++) {
            //     vehicle_cubes[i].visible = false;
            // }
            // dispatch(updateThreedDataVehicle(vehicle_cubes));
            // for 2d map
            checked.current = {
                ...checked.current, vehicle: !checked.current.vehicle
            }
        }

        // setting resource type
        if (!checked.current.human && !checked.current.vehicle)
            dispatch(setHeatmapResource({ value: "" }));
        else if (checked.current.human && checked.current.vehicle)
            dispatch(setHeatmapResource({ value: 'both' }));
        else if (checked.current.human && !checked.current.vehicle)
            dispatch(setHeatmapResource({ value: "human" }));
        else if (checked.current.vehicle && !checked.current.human)
            dispatch(setHeatmapResource({ value: "vehicle" }));
    }


    return (
        <div>
            <li className='pl-5 my-5 border-0 font-semibold flex items-center'>
                <div>
                    Show Humans : &ensp;
                </div>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input disabled={location.pathname.includes("/analytics")} type="checkbox" checked={checkHuman} onChange={() => {
                        handleClick2d("human");
                        setCheckHuman((prevState) => !prevState);
                    }} name="toggle" id="Blue" className={`${location.pathname.includes("/analytics") ? "opacity-50" : ""} checked:bg-blue-500 outline-none focus:outline-none right-4 checked:right-0 duration-200 ease-in-out border-2 absolute block w-6 h-6 rounded-full bg-white appearance-none cursor-pointer`} />
                    <label style={{ pointerEvents: 'none' }} htmlFor="Blue" className="block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer">
                    </label>
                </div>
            </li>
            <li className='pl-5 my-5 border-0 font-semibold flex items-center'>
                <div>
                    Show Vehicles : &ensp;
                </div>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input disabled={location.pathname.includes("/analytics")} type="checkbox" checked={checkVehicle} onChange={() => {
                        handleClick2d("vehicle");
                        setCheckVehicle((prevState) => !prevState);
                    }} name="toggle" id="Blue" className={`${location.pathname.includes("/analytics") ? "opacity-50" : ""} checked:bg-blue-500 outline-none focus:outline-none right-4 checked:right-0 duration-200 ease-in-out border-2 absolute block w-6 h-6 rounded-full bg-white appearance-none cursor-pointer`} />
                    <label style={{ pointerEvents: 'none' }} htmlFor="Blue" className="block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer">
                    </label>
                </div>
            </li>
        </div>
    )
}

export default ResourceBtns