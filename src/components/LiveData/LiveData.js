import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux/es/exports';
import { set, remove } from '../../state/reducers/authReducer';
import Heatmap from '../utilities/Heatmap';
import DataCards from '../utilities/DataCards';
import ThreeD from './3-d/viewer/ThreeD';
import axios from 'axios';
import { InfluxDB, Point } from '@influxdata/influxdb-client';

// Home component for the live view
function LiveData(props) {
    // sample redux action dispatch
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

    const [liveData, setLiveData] = useState();
    const url = process.env.INFLUX_URL || ''
    const token = process.env.INFLUX_TOKEN
    const org = process.env.INFLUX_ORG || ''
    const fetchLiveData = () => {
        axios({
            url: `${process.env.REACT_APP_BACKEND_URL}/api/live`,
            method: 'get',
        }).then((res) => {
            console.log("response: ", res);
        }).catch((err) => {
            console.log("error: ", err);
        })
    }


    return (
        <div className={`navHeight overflow-hidden`}>
            {/* <DataCards /> */}
            <div className="h-[30%] max-w-[100%] min-h-[150px]"><DataCards /></div>
            <div className="h-[70%]"><Heatmap /></div>
            {/* <div className="h-[75%]"><ThreeD /></div> */}
            {/* <Heatmap /> */}
        </div>
    )
}

export default LiveData 