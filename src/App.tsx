import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import RoomPage from './pages/RoomPage';
import AdminPanel from './pages/AdminPanel';
import PWAInstallProvider from './components/PWAInstallProvider';
import { GlobalToast } from './components/GlobalToast';

export default function App() {
  return (
    <PWAInstallProvider>
      <GlobalToast />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/room/:roomId" element={<RoomPage />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </BrowserRouter>
    </PWAInstallProvider>
  );
}
