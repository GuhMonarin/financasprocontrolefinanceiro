import { useCallback, useEffect, useState } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

function detectStandalone() {
  if (typeof window === 'undefined') return false;
  const media = window.matchMedia('(display-mode: standalone)');
  if (media.matches) return true;
  const ios = navigator as Navigator & { standalone?: boolean };
  return ios.standalone === true;
}

function detectIOS() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const isIphoneIpadIpod = /iPad|iPhone|iPod/.test(ua);
  const isIpadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  return isIphoneIpadIpod || isIpadOS;
}

/**
 * Tracks whether the app can be installed on the home screen and, when the
 * browser offers it, exposes a one-tap install action.
 */
export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    setInstalled(detectStandalone());
    setIsIOS(detectIOS());

    const handlePrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    const media = window.matchMedia('(display-mode: standalone)');
    const handleModeChange = () => setInstalled(media.matches);

    window.addEventListener('beforeinstallprompt', handlePrompt);
    window.addEventListener('appinstalled', handleInstalled);
    media.addEventListener('change', handleModeChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt);
      window.removeEventListener('appinstalled', handleInstalled);
      media.removeEventListener('change', handleModeChange);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    return choice.outcome === 'accepted';
  }, [deferredPrompt]);

  return {
    canInstall: deferredPrompt !== null,
    installed,
    isIOS,
    promptInstall,
  };
}
