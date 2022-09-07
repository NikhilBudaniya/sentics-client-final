import { createSlice } from "@reduxjs/toolkit";

// initial state is must to initialize for any state
const initialState = {
    value: "both"
};

export const heatmapResourceSlice = createSlice({
    name: 'heatmapResource',
    initialState,
    // reducers are the actions we can take with respect to the state
    // an action is what we dispatch using useDispatch hook
    reducers: {
        setHeatmapResource: (state, action) => {
            state.value = action.payload.value
        }
    },
})

// export the reducer actions and reducer slice
export const { setHeatmapResource } = heatmapResourceSlice.actions
export default heatmapResourceSlice.reducer