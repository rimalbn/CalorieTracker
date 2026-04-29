import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import WeightTracker from './pages/WeightTracker';
import Plan from './pages/Plan';

export default function App() {
  return (
    <BrowserRouter>
      <div
        style={{
          maxWidth: 480,
          margin: '0 auto',
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg)',
          position: 'relative',
        }}
      >
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 72 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/history" element={<History />} />
            <Route path="/weight" element={<WeightTracker />} />
            <Route path="/plan" element={<Plan />} />
          </Routes>
        </div>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}
