import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Sales from './pages/Sales';
import Inventory from './pages/Inventory';
import Complaints from './pages/Complaints';
import Products from './pages/Products';
import ManagePlazas from './pages/ManagePlazas';
import ManageMachines from './pages/ManageMachines';
import ManageSupplies from './pages/ManageSupplies';
import Reports from './pages/Reports';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="sales" element={<Sales />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="complaints" element={<Complaints />} />
            <Route path="products" element={<ProtectedRoute role="admin"><Products /></ProtectedRoute>} />
            <Route path="plazas" element={<ProtectedRoute role="admin"><ManagePlazas /></ProtectedRoute>} />
            <Route path="machines" element={<ProtectedRoute role="admin"><ManageMachines /></ProtectedRoute>} />
            <Route path="supplies" element={<ProtectedRoute role="admin"><ManageSupplies /></ProtectedRoute>} />
            <Route path="reports" element={<ProtectedRoute role="admin"><Reports /></ProtectedRoute>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
