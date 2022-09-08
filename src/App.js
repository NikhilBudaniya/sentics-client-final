import './App.css';
import {
  Routes,
  Route,
} from "react-router-dom";
import Dashboard from './components/Dashboard';
import Analytics from './components/analytics/Analytics';
import LiveData from './components/LiveData/LiveData';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      networkMode: "always", // fetch data even when there is no internet connection
      refetchOnWindowFocus: false,
    },
  },
});
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
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/" element={<Dashboard />}>
          <Route path="" element={<LiveData />} />
          <Route path="/analytics/*" element={<Analytics />} />
        </Route>
      </Routes>
    </QueryClientProvider>
  );
}

export default App;
