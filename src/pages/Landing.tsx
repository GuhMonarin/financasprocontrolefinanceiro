import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Wallet, 
  TrendingUp, 
  PieChart, 
  Shield, 
  Smartphone, 
  Zap,
  Check,
  ChevronRight,
  Moon,
  Sun
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useTheme } from 'next-themes';

const Landing = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const { theme, setTheme } = useTheme();

  const features = [
    {
      icon: <Wallet className="w-6 h-6" />,
      title: 'Controle Total',
      description: 'Gerencie todas suas receitas e despesas em um só lugar'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Relatórios Inteligentes',
      description: 'Visualize gráficos e análises detalhadas das suas finanças'
    },
    {
      icon: <PieChart className="w-6 h-6" />,
      title: 'Categorização Automática',
      description: 'Organize seus gastos por categorias personalizáveis'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Segurança Garantida',
      description: 'Seus dados protegidos com criptografia de ponta'
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: 'Acesso em Qualquer Lugar',
      description: 'Use no celular, tablet ou computador quando quiser'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Rápido e Intuitivo',
      description: 'Interface simples que qualquer pessoa consegue usar'
    }
  ];

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
      cta: 'Começar Grátis'
    },
    {
      name: 'Premium',
      description: 'Para quem quer o controle total das finanças',
      monthlyPrice: 19.90,
      annualPrice: 190.80,
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
      cta: 'Assinar Premium'
    }
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Finanças Pro</span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Link to="/auth">
              <Button variant="outline">Entrar</Button>
            </Link>
            <Link to="/auth">
              <Button className="gradient-primary">Criar Conta</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-6">
            ✨ Novo: Transações parceladas e recorrentes
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 animate-fade-in">
            Organize suas finanças
            <br />
            <span className="text-primary">de forma inteligente</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-in">
            O Finanças Pro é a ferramenta completa para você ter controle total do seu dinheiro. 
            Acompanhe receitas, despesas e alcance seus objetivos financeiros.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
            <Link to="/auth">
              <Button size="lg" className="gradient-primary text-lg px-8 gap-2">
                Começar Agora <ChevronRight className="w-5 h-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8">
              Ver Demonstração
            </Button>
          </div>
          
          {/* Hero Image Placeholder */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none h-20 bottom-0 top-auto" />
            <div className="bg-card rounded-2xl shadow-2xl border overflow-hidden max-w-5xl mx-auto">
              <div className="bg-muted/50 p-4 flex items-center gap-2 border-b">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-warning/60" />
                  <div className="w-3 h-3 rounded-full bg-success/60" />
                </div>
                <div className="flex-1 text-center text-sm text-muted-foreground">
                  app.financaspro.com.br
                </div>
              </div>
              <div className="p-8 bg-gradient-to-br from-card to-muted/30">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-background rounded-xl p-4 text-left">
                    <p className="text-sm text-muted-foreground">Saldo Atual</p>
                    <p className="text-2xl font-bold text-primary">R$ 12.450,00</p>
                  </div>
                  <div className="bg-background rounded-xl p-4 text-left">
                    <p className="text-sm text-muted-foreground">Receitas</p>
                    <p className="text-2xl font-bold text-success">R$ 8.500,00</p>
                  </div>
                  <div className="bg-background rounded-xl p-4 text-left">
                    <p className="text-sm text-muted-foreground">Despesas</p>
                    <p className="text-2xl font-bold text-destructive">R$ 3.200,00</p>
                  </div>
                </div>
                <div className="h-40 bg-background rounded-xl flex items-center justify-center">
                  <div className="flex items-end gap-2 h-24">
                    {[40, 65, 45, 80, 55, 70, 90].map((h, i) => (
                      <div 
                        key={i} 
                        className="w-8 rounded-t-lg gradient-primary opacity-80"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Tudo que você precisa para suas finanças
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Recursos pensados para simplificar sua vida financeira
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Planos que cabem no seu bolso
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Escolha o plano ideal para você e comece a organizar suas finanças hoje
            </p>
            
            {/* Billing Toggle */}
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
                <Badge variant="secondary" className="bg-success/10 text-success">
                  Economize 20%
                </Badge>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative ${
                  plan.highlighted 
                    ? 'border-primary shadow-xl scale-105' 
                    : 'border shadow-md'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="gradient-primary">Mais Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="mb-6">
                    <span className="text-4xl font-bold">
                      {formatPrice(isAnnual ? plan.annualPrice / 12 : plan.monthlyPrice)}
                    </span>
                    <span className="text-muted-foreground">/mês</span>
                    {isAnnual && plan.annualPrice > 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatPrice(plan.annualPrice)} cobrado anualmente
                      </p>
                    )}
                  </div>
                  
                  <ul className="space-y-3 text-left mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-success shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link to="/auth" className="block">
                    <Button 
                      className={`w-full ${plan.highlighted ? 'gradient-primary' : ''}`}
                      variant={plan.highlighted ? 'default' : 'outline'}
                      size="lg"
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Pronto para transformar suas finanças?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Junte-se a milhares de pessoas que já estão no controle do seu dinheiro
          </p>
          <Link to="/auth">
            <Button size="lg" className="gradient-primary text-lg px-8 gap-2">
              Criar Conta Grátis <ChevronRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Wallet className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">Finanças Pro</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 Finanças Pro. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
