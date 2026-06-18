import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Apple, Chrome, Monitor, Smartphone, Share2, PlusSquare, ExternalLink, CheckCircle, Smartphone as PhoneIcon } from 'lucide-react';

interface PWAInstallContextType {
  isInstallable: boolean;
  isInstalled: boolean;
  isInIframe: boolean;
  promptInstall: () => void;
}

const PWAInstallContext = createContext<PWAInstallContextType | undefined>(undefined);

export function usePWAInstall() {
  const context = useContext(PWAInstallContext);
  if (!context) {
    throw new Error('usePWAInstall must be used within a PWAInstallProvider');
  }
  return context;
}

export default function PWAInstallProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    // 1. Detect if inside an iframe
    const inIframe = window.self !== window.top;
    setIsInIframe(inIframe);

    // 2. Register Service Worker to meet PWA requirements
    if ('serviceWorker' in navigator && !inIframe) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((reg) => {
            console.log('Sonata SW registered successfully:', reg);
          })
          .catch((err) => {
            console.error('Sonata SW registration failed:', err);
          });
      });
    }

    // 3. Detect if already installed / running in standalone mode
    const checkIsInstalled = () => {
      const isStandalone = 
        window.matchMedia('(display-mode: standalone)').matches || 
        (navigator as any).standalone || 
        document.referrer.includes('android-app://');
      setIsInstalled(!!isStandalone);
    };
    checkIsInstalled();

    // 4. Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the default browser prompt banner
      e.preventDefault();
      // Store the event so it can be prompted later
      setDeferredPrompt(e);
      setIsInstallable(true);
      console.log('beforeinstallprompt event fired & captured');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Also check if display-mode matches standalone later
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsInstalled(e.matches);
    };
    
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaChange);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMediaChange);
      }
    };
  }, []);

  const promptInstall = () => {
    if (deferredPrompt) {
      // If we have the native deferred prompt, use it
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the PWA install prompt');
          setInstallSuccess(true);
          setIsInstalled(true);
          setDeferredPrompt(null);
          setIsInstallable(false);
          setTimeout(() => setInstallSuccess(false), 4000);
        } else {
          console.log('User dismissed the PWA install prompt');
        }
      });
    } else {
      // No native prompt available (could be iOS, an iframe, or browser without prompt support)
      // Show our gorgeous guide modal instead
      setShowModal(true);
    }
  };

  const openInNewTab = () => {
    window.open(window.location.href, '_blank');
  };

  return (
    <PWAInstallContext.Provider value={{ isInstallable, isInstalled, isInIframe, promptInstall }}>
      {children}

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col z-10 max-h-[90vh]"
            >
              <div className="p-6 bg-gradient-to-br from-[#ff0000] to-[#cc0000] text-white relative shrink-0">
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-inner">
                    <span className="text-[#ff0000] font-black tracking-tighter text-lg">S</span>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg tracking-tight">Install Sonata App</h3>
                    <p className="text-white/80 text-xs">Run Sonata on your home screen for the best karaoke performance</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {isInIframe ? (
                  /* IFRAME STATE */
                  <div className="space-y-4">
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-3 text-amber-850">
                      <span className="text-xl">⚠️</span>
                      <div className="text-sm">
                        <p className="font-bold">Currently in Preview Frame</p>
                        <p className="text-xs text-amber-705 mt-0.5 leading-relaxed">
                          Browser security prevents PWA installation inside third-party frames/sandboxes. Please open Sonata in a dedicated browser tab to install it.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={openInNewTab}
                      className="w-full py-3 bg-[#ff0000] hover:bg-[#cc0000] text-white rounded-xl font-bold text-sm tracking-wide uppercase transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open Sonata in New Tab
                    </button>
                  </div>
                ) : (
                  /* PLATFORM INSTRUCTIONS */
                  <div className="space-y-5">
                    {/* General explanation */}
                    <p className="text-xs text-gray-500 leading-relaxed text-center">
                      Sonata is a Progressive Web App (PWA). You can install it on your device without downloading it from the App Store or Google Play Store.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* iOS Instructions */}
                      <div className="p-4 border border-gray-150 rounded-2xl bg-slate-50 space-y-3">
                        <div className="flex items-center gap-2 text-slate-800">
                          <Apple className="w-5 h-5" />
                          <span className="font-extrabold text-xs uppercase tracking-wider">iOS (iPhone / iPad)</span>
                        </div>
                        <ol className="list-decimal pl-4 text-xs text-gray-600 space-y-1.5 leading-relaxed">
                          <li>Open Sonata using the <strong className="text-slate-800">Safari</strong> browser.</li>
                          <li>Tap the <strong className="text-slate-800">Share</strong> button <Share2 className="inline w-3.5 h-3.5 text-blue-500 mx-0.5" />.</li>
                          <li>Scroll down and select <strong className="text-slate-800">Add to Home Screen</strong> <PlusSquare className="inline w-3.5 h-3.5 text-slate-700 mx-0.5" />.</li>
                          <li>Confirm by clicking <strong className="text-slate-800">Add</strong> in the top-right.</li>
                        </ol>
                      </div>

                      {/* Android / Desktop Instructions */}
                      <div className="p-4 border border-gray-150 rounded-2xl bg-blue-50/50 space-y-3">
                        <div className="flex items-center gap-2 text-blue-800">
                          <Chrome className="w-5 h-5" />
                          <span className="font-extrabold text-xs uppercase tracking-wider">Chrome / Edge / Android</span>
                        </div>
                        <ol className="list-decimal pl-4 text-xs text-gray-600 space-y-1.5 leading-relaxed">
                          <li>Tap the browser <strong className="text-blue-800">Menu (3 dots)</strong>.</li>
                          <li>Look for <strong className="text-blue-800">"Install App"</strong> or <strong className="text-blue-800">"Add to Home screen"</strong>.</li>
                          <li>Alternatively, look for the install icon <Monitor className="inline w-3.5 h-3.5 text-blue-800 mx-0.5" /> in the address bar.</li>
                          <li>Confirm the installation prompt.</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end shrink-0">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Global Toast when successfully installed on screen */}
        {installSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 z-[9999] bg-green-550 border border-green-600 text-white rounded-2xl shadow-2xl p-4 px-6 flex items-center gap-3 backdrop-blur-md"
          >
            <CheckCircle className="w-6 h-6 text-green-200 shrink-0" />
            <div>
              <p className="font-extrabold text-sm">Installation Started!</p>
              <p className="text-xs text-green-100 leading-tight">Sonata is being added to your home screen.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PWAInstallContext.Provider>
  );
}
