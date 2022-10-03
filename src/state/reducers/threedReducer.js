import { createSlice } from "@reduxjs/toolkit";

// initial state is must to initialize for any state
const initialState = {
    value: {
        person_cubes: [],
        vehicle_cubes: [],
        showVehicles: true,
        showHumans: true,
    }
};

export const threedSlice = createSlice({
    name: 'mapType',
    initialState,
    reducers: {
        updateThreedDataHuman: (state, action) => {
            state.value.person_cubes = [...action.payload];
        },
        updateThreedDataVehicle: (state, action) => {
            state.value.vehicle_cubes = [...action.payload];
        },
        updateThreedShowVehicles: (state, action) => {
            state.value.showVehicles = action.payload
        },
        updateThreedShowHumans: (state, action) => {
            state.value.showHumans = action.payload
        }
    },
})

// export the reducer actions and reducer slice
export const { updateThreedDataHuman, updateThreedDataVehicle, updateThreedShowVehicles, updateThreedShowHumans } = threedSlice.actions
export default threedSlice.reducer