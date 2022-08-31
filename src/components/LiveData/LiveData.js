import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux/es/exports';
import { set } from '../../state/reducers/authReducer';
import Heatmap from '../utilities/Heatmap';
import LiveCards from '../utilities/LiveCards';

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


    return (
        <div className={`navHeight overflow-hidden`}>
            <div className="h-[15%] max-w-[100%] min-h-[100px]"><LiveCards /></div>
            <div className="h-[85%]"><Heatmap /></div>
            {/* <div className="h-[75%]"><ThreeD /></div> */}
            {/* <Heatmap /> */}
        </div>
    )
}

export default LiveData 