import React from 'react';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import AdminDashboard from './components/AdminDashboard';
import MenuPage from './components/MenuPage';
import SuperAdminDashboard from './components/SuperAdminDashboard';

const getRoute = () => {
  const path = window.location.pathname;
  if (path === '/login') return 'login';
  if (path === '/signup') return 'signup';
  if (path === '/admin') return 'admin';
  if (path === '/superadmin') return 'superadmin';
  if (path.startsWith('/menu/')) return 'menu';
  return 'home';
};

const App = () => {
  const route = getRoute();
  if (route === 'login') return <LoginPage />;
  if (route === 'signup') return <SignupPage />;
  if (route === 'admin') return <AdminDashboard />;
  if (route === 'superadmin') return <SuperAdminDashboard />;
  if (route === 'menu') return <MenuPage />;
  return <LandingPage />;
};

export default App;