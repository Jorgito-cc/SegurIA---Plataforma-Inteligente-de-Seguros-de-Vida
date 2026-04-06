import { Outlet } from 'react-router-dom';
import Sidebar from '../components/sidebar/Sidebar';

export default function DashboardLayout() {
  return (
    <div className='min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-cyan-50'>
      <div className='flex min-h-screen'>
        <Sidebar />

        <main className='flex-1 p-3 sm:p-4 md:p-6'>
          <div className='h-full min-h-[calc(100vh-1.5rem)] rounded-2xl bg-white/80 border border-blue-100 shadow-xl p-4 sm:p-5 md:p-6'>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}