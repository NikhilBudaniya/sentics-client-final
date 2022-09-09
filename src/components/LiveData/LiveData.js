import axios from 'axios';
import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux/es/exports';
import { set } from '../../state/reducers/authReducer';
import Heatmap from '../utilities/Heatmap';
import ThreeD from './3-d/viewer/ThreeD';
import LiveCards from '../utilities/LiveCards';

// Home component for the live view
function LiveData(props) {
    // SAMPLE REDUX ACTION DISPATCH 
    // dispatch ==> used to dispatch a action
    const dispatch = useDispatch();
    dispatch(set({
        value: "newauthtoken",
    }));

    // useSelector() is used to access any state from the store
    const auth = useSelector((store) => store.auth.value);

    useEffect(() => {
        console.log(auth);
    }, [auth]);
    // ABOVE CODE IS ONLY USAGE DEMONSTRATION OF REDUX-TOOLKIT

    // use this live data instances for testing
    const [liveData, setLiveData] = useState([
        {
            type: 'human',
            value: '{"0":{"x": 8.714, "y": 12.637, "heading": 0.0},"2":{"x": 21.848, "y": 25.879, "heading": 0.184}}'
        },
        {
            type: 'vehicle',
            value: '{"0":{"x": 7.131, "y": 9.075, "heading": -0.443}}'
        },
    ]);


    const fetchLiveData = (resource = "") => {
        // pass resource = "vehicle" or "human" for specific data
        let host = process.env.REACT_APP_NODE_BACKEND_URL || 'http://134.169.114.202:5000';
        return new Promise((resolve, reject) => {
            // refer to backend/index.js for details about the endpoint
            axios({
                url: `${host}/api/live`,
                method: 'post',
                data: {
                    source: "mqtt",
                    table: "",
                    resource,
                }
            }).then((res) => {
                resolve(res.data);
            }).catch((err) => {
                console.log("promise error: ", err);
                reject(err);
            })
        })
    }

    const mapRef = useRef(null);
    const [mapType, setMapType] = useState('2D');
    // opening the map change dropdown
    const handleDropDown = () => {
        if (mapRef.current.style.display === "none")
            mapRef.current.style.display = "block";
        else
            mapRef.current.style.display = "none";
    }

    // changing map
    const handleMapChange = (type) => {
        setMapType(type);
    }


    return (
        <div className={`navHeight overflow-hidden`}>
            <div className="h-[10%] min-h-[70px] mb-5 sm:mb-0 relative sm:h-[15%] max-w-[100%] sm:max-h-[150px] sm:min-h-[130px]"><LiveCards /></div>
            <div className=" h-[90%] sm:h-[85%]">
                {mapType === "2D" ?
                    <Heatmap fetchLiveData={fetchLiveData} liveData={liveData} setLiveData={setLiveData} />
                    : (
                        <>
                            <div className="h-full flex justify-center items-center">
                                <p className="font-bold text-2xl">Coming Soon</p>
                            </div>
                            {/* <ThreeD /> */}
                        </>
                    )}
                {/* <div onClick={handleDropDown} className="absolute top-[155px] sm:top-[105px] right-[25px]">

                    <div className="relative inline-block text-left">
                        <div>
                            <button type="button" className="bg-[#EBEBEB]/50 flex items-center justify-center w-full rounded-md  px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-50 hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-gray-200" id="options-menu">
                                <p className="font-bold">
                                    {mapType}
                                </p>
                            </button>
                        </div>
                        <div ref={mapRef} style={{ display: 'none' }} className="origin-top-right absolute right-0 mt-2 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
                            <div className="py-1 " role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                <p className="block block px-4 py-2 text-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-100 dark:hover:text-white dark:hover:bg-gray-600" role="menuitem">
                                    <span onClick={() => handleMapChange("2D")} className="cursor-pointer flex flex-col">
                                        <span className="text-sm">
                                            2D
                                        </span>
                                    </span>
                                </p>
                                <p className="block block px-4 py-2 text-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-100 dark:hover:text-white dark:hover:bg-gray-600" role="menuitem">
                                    <span onClick={() => handleMapChange("3D")} className="cursor-pointer flex flex-col">
                                        <span className="text-sm">
                                            3D
                                        </span>
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>

                </div> */}

            </div>
            {/* <div className="h-[75%]"></div> */}
            {/* <Heatmap /> */}
        </div>
    )
}

export default LiveData 