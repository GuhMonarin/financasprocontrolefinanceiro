import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { User, Bell, Shield, Palette, LogOut } from 'lucide-react';
import { toast } from 'sonner';

const Settings = () => {
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);

  const handleSave = () => {
    toast.success('Configurações salvas!');
  };

  return (
    <MainLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h2 className="text-2xl font-bold">Configurações</h2>
          <p className="text-muted-foreground">Gerencie suas preferências</p>
        </div>

        {/* Profile Section */}
        <Card className="p-6 card-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Perfil</h3>
              <p className="text-sm text-muted-foreground">Informações da sua conta</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" defaultValue="João Paulo" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" defaultValue="joao@email.com" />
              </div>
            </div>
            <Button onClick={handleSave}>Salvar Alterações</Button>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="p-6 card-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Notificações</h3>
              <p className="text-sm text-muted-foreground">Configure seus alertas</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notificações push</p>
                <p className="text-sm text-muted-foreground">Receba alertas sobre suas transações</p>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Resumo por e-mail</p>
                <p className="text-sm text-muted-foreground">Relatório semanal das suas finanças</p>
              </div>
              <Switch checked={emailUpdates} onCheckedChange={setEmailUpdates} />
            </div>
          </div>
        </Card>

        {/* Security */}
        <Card className="p-6 card-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Segurança</h3>
              <p className="text-sm text-muted-foreground">Proteja sua conta</p>
            </div>
          </div>

          <div className="space-y-4">
            <Button variant="outline" className="w-full sm:w-auto">
              Alterar Senha
            </Button>
          </div>
        </Card>

        {/* Logout */}
        <Card className="p-6 card-shadow border-destructive/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Sair da Conta</h3>
              <p className="text-sm text-muted-foreground">Encerrar sessão atual</p>
            </div>
            <Button variant="destructive" className="gap-2">
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Settings;
