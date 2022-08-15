import { createSlice } from "@reduxjs/toolkit";

// initial state is must to initialize for any state
const initialState = {
    value: ""
};

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    // reducers are the actions we can take with respect to the state
    // an action is what we dispatch using useDispatch hook
    reducers: {
        set: (state, action) => {
            state.value = action.payload.value
        },
        remove: (state) => {
            state.value = ""
        },
    },
})

// export the reducer actions and reducer slice
export const { set, remove } = authSlice.actions
export default authSlice.reducer