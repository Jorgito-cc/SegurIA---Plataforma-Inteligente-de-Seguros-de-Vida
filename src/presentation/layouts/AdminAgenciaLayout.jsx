import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar/Sidebar";
import { useAuth } from "../../application/context/AuthContext";

export default function AdminAgenciaLayout() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-white to-fuchsia-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 flex flex-col p-4 md:p-6 overflow-auto">
          <div className="h-full rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-indigo-100/70 dark:border-slate-800/70 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.25)] p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
