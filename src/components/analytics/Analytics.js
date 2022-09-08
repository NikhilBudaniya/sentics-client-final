import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { MetricKdeMap } from './MetricKdeMap';
import ohlfUrl from "../assets/images/ohlf.png";
import { useReducer } from 'react';
import MetricSelector from './MetricSelector';
import { SpaghettiMap } from './SpaghettiMap';

export const ParamsDispatch = React.createContext(null);

// History view component
function Analytics() {

  const init = () => {
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    return {
      metric: {
        value: "safety-score",
        label: "Safety Score",
        aggregations: ["none", "avg", "min", "max"],
      },
      aggregation: {
        value: "avg",
        label: "Durchschnitt",
      },
      range: { value: oneHourAgo, label: "1 Stunde" },
      from: oneHourAgo,
      to: new Date(),
      excludeHumans: false,
      excludeVehicles: false,
      threshold: 0,
      mapUrl: ohlfUrl,
      mapDefaultUrl: ohlfUrl,
      areas: [],
      kde: {
        bandwidth: 0.1,
        transparency: 0.3,
        colorScheme: "Spectral",
        colorSchemeReversed: true,
      },
      spaghetti: {
        linewidth: 5,
      },
      replay: {
        timestamp: undefined,
      },
    };
  };

  const [params, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case "RESET":
        return init();
      case "SET_METRIC":
        return { ...state, metric: action.payload };
      case "SET_AGGREGATION":
        return { ...state, aggregation: action.payload };
      case "SET_RANGE":
        return { ...state, range: action.payload };
      case "SET_TIMESPAN":
        return { ...state, from: action.payload.from, to: action.payload.to };
      case "SET_TIMESPAN_FROM":
        const to = new Date(action.payload);
        to.setHours(to.getHours() + 1);
        return { ...state, from: action.payload, to };
      case "SET_TIMESPAN_TO":
        return { ...state, to: action.payload };
      case "SET_KDE_BANDWIDTH":
        return { ...state, kde: { ...state.kde, bandwidth: action.payload } };
      case "SET_KDE_TRANSPARENCY":
        return {
          ...state,
          kde: { ...state.kde, transparency: action.payload },
        };
      case "SET_KDE_COLORSCHEME":
        return {
          ...state,
          kde: { ...state.kde, colorScheme: action.payload },
        };
      case "SET_KDE_COLORSCHEME_REVERSED":
        return {
          ...state,
          kde: { ...state.kde, colorSchemeReversed: action.payload },
        };
      case "SET_EXCLUDES":
        return {
          ...state,
          excludeHumans: action.payload.excludeHumans,
          excludeVehicles: action.payload.excludeVehicles,
        };
      case "SET_EXCLUDE_HUMANS":
        return { ...state, excludeHumans: action.payload };
      case "SET_THRESHOLD":
        return { ...state, threshold: action.payload };
      case "SET_EXCLUDE_VEHICLES":
        return { ...state, excludeVehicles: action.payload };
      case "SET_AREAS":
        return { ...state, areas: action.payload };
      case "SET_MAP_URL":
        return { ...state, mapUrl: action.payload };
      case "SET_SPAGHETTI_LINEWIDTH":
        return {
          ...state,
          spaghetti: { ...state.spaghetti, linewidth: action.payload },
        };
      case "SET_REPLAY_TIMESTAMP":
        return {
          ...state,
          replay: { ...state.replay, timestamp: action.payload },
        };
      default:
        throw new Error("Invalid action type " + action.type);
    }
  }, init());

  const { pathname } = useLocation();

  return (
    
    <ParamsDispatch.Provider value={{ params, dispatch }}>
    <div className="w-full h-100 overflow-scroll">

        <div className="mx-4 my-1 bg-red-200">
          <MetricSelector />
        </div>

        <div className="border-2 mx-4 my-1 w-full">
          <nav className="flex justify-start items-center p-2">
            <Link to="/analytics" className="block mt-4 lg:mt-0 mr-10 text-blue-900 hover:text-indigo-600">
              Home
            </Link>
            <Link to="/analytics/replay" className="block mt-4 lg:mt-0 mr-10 text-blue-900 hover:text-indigo-600">
              Team
            </Link>
            <Link to="/analytics/spaghetti" className="block mt-4 lg:mt-0 text-blue-900 hover:text-indigo-600">
              Galery
            </Link>
          </nav>
        </div>

        <div>
          <Routes>
            <Route path="/" element={<MetricKdeMap />}></Route>
            <Route path="/spaghetti" element={<SpaghettiMap />}></Route>
          </Routes>
        </div>

    </div>
      </ParamsDispatch.Provider>

  )
}

export default Analytics