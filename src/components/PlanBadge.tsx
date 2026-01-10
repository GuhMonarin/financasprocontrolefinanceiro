import { usePlan } from '@/contexts/PlanContext';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export function PlanBadge() {
  const { userPlan, loading } = usePlan();

  if (loading) {
    return <Skeleton className="h-5 w-16" />;
  }

  if (!userPlan) {
    return null;
  }

  const badgeVariant = userPlan.name === 'Premium' ? 'default' : 'secondary';
  const badgeText = userPlan.name === 'Premium' ? '⭐ Premium' : 'Free';

  return (
    <Badge variant={badgeVariant} className="text-xs">
      {badgeText}
    </Badge>
  );
}
