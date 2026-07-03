import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Garage from './pages/Garage';
import VehicleDetail from './pages/VehicleDetail';
import AddService from './pages/AddService';
import AddVehicle from './pages/AddVehicle';
import HistoryService from './pages/HistoryService';
import AccountInfo from './pages/AccountInfo';
import ChangeAccountInfo from './pages/ChangeAccountInfo';
import ChangePassword from './pages/ChangePassword';

// Protected Route Wrapper
const PrivateRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p>Memuat data...</p></div>;
  }
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/garage" element={<PrivateRoute><Garage /></PrivateRoute>} />
          <Route path="/vehicle/:id" element={<PrivateRoute><VehicleDetail /></PrivateRoute>} />
          <Route path="/add-service" element={<PrivateRoute><AddService /></PrivateRoute>} />
          <Route path="/add-vehicle" element={<PrivateRoute><AddVehicle /></PrivateRoute>} />
          <Route path="/history" element={<PrivateRoute><HistoryService /></PrivateRoute>} />
          <Route path="/account-info" element={<PrivateRoute><AccountInfo /></PrivateRoute>} />
          <Route path="/change-account-info" element={<PrivateRoute><ChangeAccountInfo /></PrivateRoute>} />
          <Route path="/change-password" element={<PrivateRoute><ChangePassword /></PrivateRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
