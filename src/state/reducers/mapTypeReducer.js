import { createSlice } from "@reduxjs/toolkit";

// initial state is must to initialize for any state
const initialState = {
    value: "2D"
};

export const mapTypeSlice = createSlice({
    name: 'mapType',
    initialState,
    // reducers are the actions we can take with respect to the state
    // an action is what we dispatch using useDispatch hook
    reducers: {
        setMapType: (state, action) => {
            state.value = action.payload
        }
    },
})

// export the reducer actions and reducer slice
export const { setMapType } = mapTypeSlice.actions
export default mapTypeSlice.reducer