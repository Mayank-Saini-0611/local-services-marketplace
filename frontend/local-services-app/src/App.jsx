import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-950 to-indigo-950 text-white">
            <h1 className="text-4xl">404 — Page Not Found</h1>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;