import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux/es/exports';
import { set, remove } from '../state/reducers/authReducer';
import Home from './LiveData/LiveData';
import Header from './Header';
import LeftNav from './LeftNav';
import LiveData from './LiveData/LiveData';

// Home component for the live view
function Dashboard() {
    // sample redux action dispatch
    // dispatch ==> used to dispatch a action
    const dispatch = useDispatch();
    dispatch(set({
        value: "newauthtoken",
    }));

    // useSelector() is used to access any state from the store
    const auth = useSelector((store) => store.auth.value);

    useEffect(() => {
        // console.log(auth);
    }, [auth]);


    return (
        // <div className="h-full w-full">
        //     <div className="grid grid-flow-rowgrid-cols-12 gap-0">
        //         <div className="row-span-1 col-span-12 h-full w-full"><Header /></div>
        //         <div className="row-span-1 col-span-2 h-full w-full max-w-xs"><LeftNav /></div>
        //         <div className="row-span-1 col-span-10 h-full w-full"><LiveData /></div>
        //     </div>
        // </div>
        <div className="h-full w-full">
            <div className="h-full w-full"><Header /></div>
            <div className="flex">
                <div className="xl:min-w-[250px] max-w-[20vw]"><LeftNav /></div>
                <div className="w-full"><LiveData /></div>
            </div>
        </div>
    )
}

export default Dashboard