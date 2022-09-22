import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux/es/exports';
import { set, remove } from '../state/reducers/authReducer';
import Home from './LiveData/LiveData';
import Header from './Header';
import LeftNav from './LeftNav';
import LiveData from './LiveData/LiveData';
import { Outlet } from 'react-router-dom';

// Home component for the live view
function Dashboard(props) {
    // sample redux action dispatch
    // dispatch ==> used to dispatch a action
    const dispatch = useDispatch();
    dispatch(set({
        value: "newauthtoken",
    }));

    // useSelector() is used to access any state from the store
    const auth = useSelector((store) => store.auth.value);
    const windowWidthRedux = useSelector((store) => store.WindowWidth.value);
    console.log(windowWidthRedux);

    // const Tabwidth =`${window.innerWidth - 50}px`;
    // const Deskwidth = `${window.innerWidth - 250}px`;
    

    useEffect(() => {
        // console.log(auth);
    }, [auth]);


    return (
        <div className="h-full w-full">
            <div className="h-full w-full"><Header /></div>
            <div className="flex navHeight overflow-hidden max-w-[100vw]">
                <div className="sm:min-w-[50px] xl:min-w-[250px] max-w-[20vw]"><LeftNav /></div>
                <div style={{ width: `${windowWidthRedux}px`, }} className={`overflow-hidden`}>
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default Dashboard