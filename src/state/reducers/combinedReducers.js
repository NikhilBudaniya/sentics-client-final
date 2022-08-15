import { combineReducers } from "redux";
import authReducer from "./authReducer";

// all the reducers are given a key inside combineReducers
const reducers = combineReducers({
    auth: authReducer
});

export default reducers;