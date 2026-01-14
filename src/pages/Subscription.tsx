import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Crown,
  Check,
  Loader2,
  CreditCard,
  Settings,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { STRIPE_PRICES, formatPrice, PLAN_PRICES } from '@/lib/stripe';
import { toast } from 'sonner';
import { MainLayout } from '@/components/layout/MainLayout';

const Subscription = () => {
  const navigate = useNavigate();
  const { 
    isPremium, 
    plan, 
    subscriptionEnd, 
    cancelAtPeriodEnd,
    loading,
    createCheckout,
    openCustomerPortal,
    checkSubscription
  } = useSubscription();
  
  const [isAnnual, setIsAnnual] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleUpgrade = async () => {
    setIsCheckingOut(true);
    try {
      const priceId = isAnnual ? STRIPE_PRICES.annual : STRIPE_PRICES.monthly;
      const url = await createCheckout(priceId);
      
      if (url) {
        window.open(url, '_blank');
      } else {
        toast.error('Erro ao iniciar checkout');
      }
    } catch (error) {
      toast.error('Erro ao processar upgrade');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      await openCustomerPortal();
    } catch (error) {
      toast.error('Erro ao abrir portal de gerenciamento');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const plans = [
    {
      name: 'Free',
      description: 'Para começar a organizar suas finanças',
      monthlyPrice: 0,
      annualPrice: 0,
      features: [
        'Até 50 transações por mês',
        '3 categorias personalizadas',
        'Relatório mensal básico',
        'Suporte por email'
      ],
      highlighted: false,
      current: plan === 'Free'
    },
    {
      name: 'Premium',
      description: 'Para quem quer o controle total das finanças',
      monthlyPrice: PLAN_PRICES.monthly,
      annualPrice: PLAN_PRICES.annual * 12 / 12, // Annual prorated
      features: [
        'Transações ilimitadas',
        'Categorias ilimitadas',
        'Relatórios avançados e gráficos',
        'Transações recorrentes e parceladas',
        'Exportação de dados',
        'Suporte prioritário',
        'Acesso a novos recursos'
      ],
      highlighted: true,
      current: plan === 'Premium'
    }
  ];

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Assinatura</h1>
            <p className="text-muted-foreground">Gerencie seu plano e pagamentos</p>
          </div>
        </div>

        {/* Current Plan Status */}
        {isPremium && (
          <Card className="border-primary bg-primary/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-primary" />
                  <CardTitle>Plano Premium Ativo</CardTitle>
                </div>
                <Badge className="bg-primary">Ativo</Badge>
              </div>
              <CardDescription>
                {cancelAtPeriodEnd ? (
                  <>Sua assinatura será cancelada em {formatDate(subscriptionEnd)}</>
                ) : (
                  <>Próxima cobrança em {formatDate(subscriptionEnd)}</>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button onClick={handleManageSubscription} variant="outline" className="gap-2">
                  <CreditCard className="w-4 h-4" />
                  Gerenciar Pagamento
                </Button>
                <Button onClick={handleManageSubscription} variant="outline" className="gap-2">
                  <Settings className="w-4 h-4" />
                  Alterar Plano
                </Button>
                <Button onClick={checkSubscription} variant="ghost" size="sm">
                  Atualizar Status
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Plan Selection */}
        {!isPremium && (
          <>
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Escolha seu plano</h2>
              <div className="flex items-center justify-center gap-4">
                <span className={`text-sm ${!isAnnual ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                  Mensal
                </span>
                <Switch 
                  checked={isAnnual} 
                  onCheckedChange={setIsAnnual}
                />
                <span className={`text-sm ${isAnnual ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                  Anual
                </span>
                {isAnnual && (
                  <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                    Economize 40%
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {plans.map((planItem) => (
                <Card 
                  key={planItem.name} 
                  className={`relative ${
                    planItem.highlighted 
                      ? 'border-primary shadow-lg' 
                      : 'border'
                  } ${planItem.current ? 'ring-2 ring-primary' : ''}`}
                >
                  {planItem.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary">Mais Popular</Badge>
                    </div>
                  )}
                  {planItem.current && (
                    <div className="absolute -top-3 right-4">
                      <Badge variant="outline">Seu Plano</Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-xl flex items-center justify-center gap-2">
                      {planItem.name === 'Premium' && <Crown className="w-5 h-5 text-primary" />}
                      {planItem.name}
                    </CardTitle>
                    <CardDescription>{planItem.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="mb-6">
                      <span className="text-3xl font-bold">
                        {formatPrice(isAnnual ? planItem.annualPrice : planItem.monthlyPrice)}
                      </span>
                      <span className="text-muted-foreground">/mês</span>
                      {isAnnual && planItem.annualPrice > 0 && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatPrice(PLAN_PRICES.annual)} cobrado anualmente
                        </p>
                      )}
                    </div>
                    
                    <ul className="space-y-2 text-left mb-6">
                      {planItem.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {planItem.name === 'Premium' && !planItem.current && (
                      <Button 
                        className="w-full bg-primary hover:bg-primary/90"
                        onClick={handleUpgrade}
                        disabled={isCheckingOut}
                      >
                        {isCheckingOut ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processando...
                          </>
                        ) : (
                          <>
                            <Crown className="w-4 h-4 mr-2" />
                            Assinar Premium
                          </>
                        )}
                      </Button>
                    )}
                    {planItem.current && (
                      <Button variant="outline" className="w-full" disabled>
                        Plano Atual
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Features comparison for Premium users */}
        {isPremium && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Seus Benefícios Premium</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid md:grid-cols-2 gap-3">
                {plans[1].features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default Subscription;
