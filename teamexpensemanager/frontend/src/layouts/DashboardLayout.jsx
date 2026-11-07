import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="app-container">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      <div className="main-content">
        <Navbar 
          onMenuToggle={() => setIsSidebarOpen(true)}
          onOpenNewExpense={() => navigate('/expenses', { state: { openCreateModal: true } })}
        />

        <main className="page-wrapper">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
