import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux/es/exports';
import { set, remove } from '../state/reducers/authReducer';
import CenterSection from './home_component/CenterSection';
import Header from './home_component/Header';
import Heatmap from './home_component/Heatmap';
import LeftNav from './home_component/LeftNav';
import TopNav from './home_component/TopNav';

// Home component for the live view
function Home() {
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
            <Header />
            <div className="flex flex-column p-2 h-full">
                <div className="bg-red-200">
                    <LeftNav />
                </div>
                <div className="w-full h-full">
                    <CenterSection />
                </div>
            </div>
        </div>
    )
}

export default Home