import { createSlice } from "@reduxjs/toolkit";

// initial state is must to initialize for any state
const initialState = {
    value: window.innerWidth
};

export const WindowWidthSlice = createSlice({
    name: 'WindowWidth',
    initialState,
    // reducers are the actions we can take with respect to the state
    // an action is what we dispatch using useDispatch hook
    reducers: {
        WindowWidth: (state, action) => {
            state.value = action.payload.value
        }
    },
})

// export the reducer actions and reducer slice
export const { WindowWidth } = WindowWidthSlice.actions
export default WindowWidthSlice.reducer