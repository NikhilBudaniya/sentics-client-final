import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux/es/exports';
import { set, remove } from '../../state/reducers/authReducer'; 
import Heatmap from '../utilities/Heatmap';
import TopNav from '../utilities/DataCards';

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
        <div className="h-full w-full">
            <div className="">
                <div className="bg-yellow-200">
                    <TopNav />
                </div>
                <div className="p-5">
                    <Heatmap />
                </div>
            </div>
        </div>
    )
}

export default LiveData 