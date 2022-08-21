import './App.css';
import {
  Routes,
  Route,
} from "react-router-dom";
import Dashboard from './components/Dashboard';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      {/* <Route path="/analytics" element={<Dashboard />} /> */}
    </Routes>
  );
}

export default App;
