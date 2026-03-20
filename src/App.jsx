import React from 'react';
import LandingPage from './components/LandingPage';
import MenuPage from './components/MenuPage';
import AdminDashboard from './components/AdminDashboard';

const getRoute = () => {
  const path = window.location.pathname;
  if (path === '/menu') return 'menu';
  if (path === '/admin') return 'admin';
  return 'home';
};

const App = () => {
  const route = getRoute();
  if (route === 'menu') return <MenuPage />;
  if (route === 'admin') return <AdminDashboard />;
  return <LandingPage />;
};

export default App;