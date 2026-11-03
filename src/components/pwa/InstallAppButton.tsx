import { useState } from 'react';
import { Download, Share, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { usePwaInstall } from '@/hooks/usePwaInstall';
import { toast } from 'sonner';

/**
 * "Instalar app" action for the sidebar. Uses the browser's own install prompt
 * when available (Android/Chrome) and shows the manual steps on iPhone/iPad.
 */
export function InstallAppButton({ className }: { className?: string }) {
  const { canInstall, installed, isIOS, promptInstall } = usePwaInstall();
  const [open, setOpen] = useState(false);

  if (installed) return null;

  if (canInstall) {
    return (
      <Button
        variant="outline"
        className={className}
        onClick={async () => {
          const accepted = await promptInstall();
          if (accepted) toast.success('Finanças Pro foi adicionado à sua tela inicial!');
        }}
      >
        <Download className="w-4 h-4 mr-2" />
        Instalar app
      </Button>
    );
  }

  if (!isIOS) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          <Download className="w-4 h-4 mr-2" />
          Instalar app
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-primary" />
            Adicionar à Tela de Início
          </DialogTitle>
          <DialogDescription>
            No iPhone ou iPad, instale o Finanças Pro pelo Safari.
          </DialogDescription>
        </DialogHeader>

        <ol className="space-y-3 text-sm">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              1
            </span>
            <span>Abra o Finanças Pro no <strong>Safari</strong>.</span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              2
            </span>
            <span className="flex items-center gap-1">
              Toque em <Share className="w-4 h-4" /> <strong>Compartilhar</strong>.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              3
            </span>
            <span>
              Escolha <strong>Adicionar à Tela de Início</strong> e confirme em
              <strong> Adicionar</strong>.
            </span>
          </li>
        </ol>

        <p className="text-xs text-muted-foreground">
          O app abre em tela cheia, sem a barra do navegador, e você entra com a
          sua conta normalmente.
        </p>
      </DialogContent>
    </Dialog>
  );
}
