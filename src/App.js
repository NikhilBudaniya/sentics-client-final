import './App.css';
import {
  Routes,
  Route,
} from "react-router-dom";
import Dashboard from './components/Dashboard';
import Analytics from './components/analytics/Analytics';
import LiveData from './components/LiveData/LiveData';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { WindowWidth } from './state/reducers/WindowWidthReducer';

function App() {

  
  const dispatch = useDispatch();
  
  window.addEventListener('resize',()=>{
      let windowInnerWidth = window.innerWidth;
      if (windowInnerWidth > 1280) {
        dispatch(WindowWidth({ value: windowInnerWidth - 250 }))
      } else if (windowInnerWidth > 640) {
        dispatch(WindowWidth({ value: windowInnerWidth - 50 }))
      } else {
        dispatch(WindowWidth({ value: windowInnerWidth }))
      }
    })

  return (
    <Routes>
      <Route path="/" element={<Dashboard />}>
        <Route path="" element={<LiveData />} />
        <Route path="/analytics" element={<Analytics />} />
      </Route>
    </Routes>
  );
}

export default App;
