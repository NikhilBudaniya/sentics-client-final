import { combineReducers } from "redux";
import authReducer from "./authReducer";
import heatmapResourceReducer from "./heatmapResourceReducer";
import mapTypeReducer from "./mapTypeReducer";
import systemStatus from "./systemStatus";
import threedReducer from "./threedReducer";
import WindowWidthReducer from "./WindowWidthReducer";

// all the reducers are given a key inside combineReducers
const reducers = combineReducers({
    auth: authReducer,
    systemStatus: systemStatus,
    heatmapResource: heatmapResourceReducer,
    WindowWidth: WindowWidthReducer,
    mapType: mapTypeReducer,
    threedVars: threedReducer,
});

export default reducers;