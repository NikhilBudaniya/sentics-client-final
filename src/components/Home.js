import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux/es/exports';
import { set, remove } from '../state/reducers/authReducer';

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
        <div className="text-3xl font-bold text-center">
            Tailwind is Ready
        </div>
    )
}

export default Home