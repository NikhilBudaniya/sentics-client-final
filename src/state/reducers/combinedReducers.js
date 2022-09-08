import { combineReducers } from "redux";
import authReducer from "./authReducer";
import heatmapResourceReducer from "./heatmapResourceReducer";
import systemStatus from "./systemStatus";
import WindowWidthReducer from "./WindowWidthReducer";

// all the reducers are given a key inside combineReducers
const reducers = combineReducers({
    auth: authReducer,
    systemStatus: systemStatus,
    heatmapResource: heatmapResourceReducer,
    WindowWidth: WindowWidthReducer,
});

export default reducers;