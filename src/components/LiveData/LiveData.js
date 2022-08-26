import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux/es/exports';
import { set, remove } from '../../state/reducers/authReducer';
import Heatmap from '../utilities/Heatmap';
import DataCards from '../utilities/DataCards';
import ThreeD from './3-d/viewer/ThreeD';

// Home component for the live view
function LiveData() {
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


    return (
        <div className=" flex flex-col navHeight">
            {/* <DataCards /> */}
            <div className="h-[25%]"><DataCards /></div>
            <div className="h-[75%]"><Heatmap /></div>
            {/* <div className="h-[75%]"><ThreeD /></div> */}
            {/* <Heatmap /> */}
        </div>
    )
}

export default LiveData 