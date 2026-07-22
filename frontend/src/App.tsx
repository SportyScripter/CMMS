import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { MainLayout } from './components/MainLayout';
import { UsersDashboard } from './pages/UsersDashboard';
import { CreateRolePage } from './pages/CreateRolePage';
import { RoleListPage } from './pages/RoleListPage';
import { UserListPage } from './pages/UserListPage';
import {CreateUserPage} from './pages/CreateUserPage';
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 font-medium animate-pulse">Wczytywanie aplikacji...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const Dashboard = () => <div><h1 className="text-2xl font-bold mb-4">Pulpit</h1><p className="text-gray-600">Witaj w systemie CMMS.</p></div>;
const Machines = () => <div><h1 className="text-2xl font-bold mb-4">Park Maszynowy</h1></div>;
const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      
      <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="machines" element={<Machines />} />
        <Route path="failures" element={<div><h1 className="text-2xl font-bold mb-4">Awarie</h1></div>} />
        <Route path="calendar" element={<div><h1 className="text-2xl font-bold mb-4">Kalendarz</h1></div>} />
        <Route path="inventory" element={<div><h1 className="text-2xl font-bold mb-4">Magazyn</h1></div>} />
        <Route path="messages" element={<div><h1 className="text-2xl font-bold mb-4">Wiadomości</h1></div>} />
        <Route path="users" element={<UsersDashboard />} />
        <Route path="users/roles/create" element={<CreateRolePage />} />
        <Route path="users/roles/list" element={<RoleListPage />} />
        <Route path="users/list" element={<UserListPage />} />
        <Route path="users/create" element={<CreateUserPage />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;