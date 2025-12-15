import type { Metadata } from "next";
import { Suspense } from "react";
import { ConnectCallbackContent } from "./_components/connect-callback-content";

export const metadata: Metadata = {
  title: "Connecting Account...",
  description: "Completing Google Ads account connection",
};

function LoadingFallback() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
        <p className="mt-4 text-muted-foreground">Connecting your account...</p>
      </div>
    </div>
  );
}

export default function ConnectCallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ConnectCallbackContent />
    </Suspense>
  );
}
