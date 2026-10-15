import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AuthService, AdminUser } from '@/lib/auth';
import { X } from 'lucide-react';

export default function AdminLayout({ children }: { children?: React.ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    async function check() {
      if (isLoginPage) {
        setIsCheckingAuth(false);
        return;
      }

      const session = await AuthService.getSession();
      if (!session) {
        navigate('/admin/login');
      } else {
        setUser(session);
        setIsCheckingAuth(false);
      }
    }
    check();
  }, [pathname, isLoginPage, navigate]);

  if (isLoginPage) {
    return <>{children}</>;
  }



  return (
    <div className="min-h-screen bg-[#F5F8FC] flex">
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:block h-screen sticky top-0">
        <AdminSidebar />
      </div>

      {/* Mobile Drawer Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-10 w-72 h-full flex flex-col bg-[#071B30]">
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <AdminSidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Admin Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          onToggleSidebar={() => setMobileSidebarOpen(true)}
          adminEmail={user?.email}
          adminName={user?.fullName}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto relative">
          {isCheckingAuth && (
            <div className="absolute inset-0 bg-[#F7F9FC]/95 z-20 flex items-center justify-center min-h-[300px]">
              <div className="flex flex-col items-center gap-2.5">
                <div className="w-8 h-8 border-3 border-[#082B50] border-t-[#F5B936] rounded-full animate-spin" />
                <span className="text-xs font-semibold text-slate-500">Authenticating...</span>
              </div>
            </div>
          )}
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
}
