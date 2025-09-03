// src/app/components/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Navigation</h2>
      </div>
      <nav className="sidebar-nav">
        <Link 
          href="/dashboard" 
          className={pathname === '/dashboard' ? 'active' : ''}
        >
          📊 Overview
        </Link>
        <Link 
          href="/dashboard/calendar" 
          className={pathname === '/dashboard/calendar' ? 'active' : ''}
        >
          📅 Calendar
        </Link>
      </nav>
    </aside>
  );
}