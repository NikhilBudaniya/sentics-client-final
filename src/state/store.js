import { configureStore } from "@reduxjs/toolkit";
import combinedReducers from "./reducers/combinedReducers";

// all the reducers are imported from combinedReducers file
const store = configureStore({
    reducer: combinedReducers
});


export default store;