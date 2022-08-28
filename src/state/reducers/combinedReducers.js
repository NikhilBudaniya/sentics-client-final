import { combineReducers } from "redux";
import authReducer from "./authReducer";
import systemStatus from "./systemStatus";

// all the reducers are given a key inside combineReducers
const reducers = combineReducers({
    auth: authReducer,
    systemStatus: systemStatus
});

export default reducers;