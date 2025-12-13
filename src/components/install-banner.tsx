"use client";

import { usePWA } from "./pwa-provider";
import { X, Download, Share } from "lucide-react";
import { Button } from "./ui/button";

export function InstallBanner() {
  const { 
    showInstallBanner, 
    isIOS, 
    isInstalled, 
    isStandalone,
    triggerInstall, 
    dismissInstallBanner 
  } = usePWA();

  // Don't show if already installed or in standalone mode
  if (isInstalled || isStandalone || !showInstallBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 animate-in slide-in-from-bottom duration-300">
      <div className="mx-auto max-w-md">
        <div className="relative flex items-center gap-3 rounded-xl bg-card border border-border shadow-lg p-3 backdrop-blur-sm">
          {/* App Icon */}
          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-green-500"
            >
              <circle cx="12" cy="10" r="6" />
              <path d="M12 7v6M12 13l3-3" />
              <rect x="6" y="18" width="12" height="2" rx="1" />
            </svg>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              Install Echo Test
            </p>
            <p className="text-xs text-muted-foreground">
              {isIOS 
                ? "Tap Share then \"Add to Home Screen\"" 
                : "Add to your home screen for quick access"
              }
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {isIOS ? (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                onClick={dismissInstallBanner}
              >
                <Share className="h-4 w-4 text-green-500" />
                <span className="sr-only">Share instructions</span>
              </Button>
            ) : (
              <Button
                size="sm"
                className="h-8 px-3 bg-green-600 hover:bg-green-700 text-white"
                onClick={triggerInstall}
              >
                <Download className="h-4 w-4 mr-1" />
                Install
              </Button>
            )}
            
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              onClick={dismissInstallBanner}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Dismiss</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
