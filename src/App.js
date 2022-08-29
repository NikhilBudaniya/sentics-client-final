import './App.css';
import {
  Routes,
  Route,
} from "react-router-dom";
import Dashboard from './components/Dashboard';
import Analytics from './components/analytics/Analytics';
import LiveData from './components/LiveData/LiveData';

function App() {
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
