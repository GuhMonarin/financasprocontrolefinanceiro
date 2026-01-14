import { useSubscription } from '@/contexts/SubscriptionContext';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Crown } from 'lucide-react';
import { Link } from 'react-router-dom';

export function PlanBadge() {
  const { plan, loading, isPremium } = useSubscription();

  if (loading) {
    return <Skeleton className="h-5 w-16" />;
  }

  return (
    <Link to="/subscription">
      <Badge 
        variant={isPremium ? 'default' : 'secondary'} 
        className={`text-xs cursor-pointer hover:opacity-80 transition-opacity ${
          isPremium ? 'bg-gradient-to-r from-amber-500 to-orange-500' : ''
        }`}
      >
        {isPremium ? (
          <>
            <Crown className="w-3 h-3 mr-1" />
            Premium
          </>
        ) : (
          'Free'
        )}
      </Badge>
    </Link>
  );
}
