import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Tags, 
  BarChart3, 
  Settings,
  LogOut,
  Menu,
  Wallet,
  Crown,
  PiggyBank
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { PlanBadge } from '@/components/PlanBadge';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerClose,
} from '@/components/ui/drawer';
import { useState } from 'react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: ArrowLeftRight, label: 'Transações', path: '/transactions' },
  { icon: Tags, label: 'Categorias', path: '/categories' },
  { icon: PiggyBank, label: 'Orçamentos', path: '/budgets' },
  { icon: BarChart3, label: 'Relatórios', path: '/reports' },
  { icon: Crown, label: 'Assinatura', path: '/subscription' },
  { icon: Settings, label: 'Configurações', path: '/settings' },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { signOut } = useAuth();
  const { data: profile } = useProfile();

  const handleLogout = async () => {
    await signOut();
    toast.success('Logout realizado');
    navigate('/auth');
  };

  const handleNavClick = (path: string) => {
    setIsDrawerOpen(false);
    navigate(path);
  };

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'US';

  const NavigationContent = () => (
    <>
      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-4" data-tour="nav">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              className={cn(
                "flex items-center gap-3 px-4 py-4 rounded-xl font-medium transition-all duration-200 w-full text-left",
                "min-h-[52px] active:scale-[0.98] touch-manipulation",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground active:bg-accent/80"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span className="text-base">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );

  const UserSection = () => (
    <div className="p-4 border-t border-border">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-sm font-semibold text-primary">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium truncate">{profile?.full_name || 'Usuário'}</p>
            <PlanBadge />
          </div>
          <p className="text-xs text-muted-foreground truncate">{profile?.email || ''}</p>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="shrink-0 min-h-[44px] min-w-[44px]" 
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Header with Drawer */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-16 bg-card border-b border-border lg:hidden">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <Wallet className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg">FinançasPro</span>
        </div>
        
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="min-h-[44px] min-w-[44px] touch-manipulation"
            >
              <Menu className="w-6 h-6" />
            </Button>
          </DrawerTrigger>
          <DrawerContent className="max-h-[85vh]">
            {/* Drawer Logo */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-md">
                <Wallet className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-lg leading-tight">FinançasPro</h1>
                <p className="text-xs text-muted-foreground">Controle financeiro</p>
              </div>
            </div>
            
            <div className="overflow-y-auto">
              <NavigationContent />
            </div>
            
            <UserSection />
          </DrawerContent>
        </Drawer>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border flex-col">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-border">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-md">
            <Wallet className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">FinançasPro</h1>
            <p className="text-xs text-muted-foreground">Controle financeiro</p>
          </div>
        </div>

        {/* Desktop Navigation - using Link for better desktop UX */}
        <nav className="flex flex-col gap-1 p-4 flex-1" data-tour="nav">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Desktop User Section */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium truncate">{profile?.full_name || 'Usuário'}</p>
                <PlanBadge />
              </div>
              <p className="text-xs text-muted-foreground truncate">{profile?.email || ''}</p>
            </div>
            <Button variant="ghost" size="icon" className="shrink-0" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
