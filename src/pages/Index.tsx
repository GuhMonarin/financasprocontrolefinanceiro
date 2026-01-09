import { useAuth } from '@/contexts/AuthContext';
import Landing from './Landing';
import Dashboard from './Dashboard';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Se não está logado, mostra a landing page
  if (!user) {
    return <Landing />;
  }

  // Se está logado, mostra o dashboard
  return <Dashboard />;
};

export default Index;
