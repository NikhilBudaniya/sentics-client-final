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

function App() {
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
