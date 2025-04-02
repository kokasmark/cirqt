import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from './Home.jsx';

createRoot(document.getElementById('root')).render(
  <Router basename='/cirqt'>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/editor/:projectId" element={<App />} />
        <Route path="*" element={<Navigate to="/editor" />} /> {/* Redirect unknown routes */}
      </Routes>
    </Router>

)
