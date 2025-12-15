"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCompleteConnectAccount } from "@/features/accounts";
import { ROUTES } from "@/shared/lib/constants";

export function ConnectCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mutate: completeConnect, isError, error } = useCompleteConnectAccount();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;

    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      router.replace(`${ROUTES.ACCOUNTS}?error=${encodeURIComponent(errorParam)}`);
      return;
    }

    if (!code || !state) {
      router.replace(ROUTES.ACCOUNTS);
      return;
    }

    hasProcessed.current = true;
    const redirectUri = `${window.location.origin}/accounts/connect/callback`;
    completeConnect({ code, state, redirect_uri: redirectUri });
  }, [searchParams, completeConnect, router]);

  if (isError) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Connection Failed</CardTitle>
            <CardDescription>
              {error?.message ?? "Failed to connect your Google Ads account"}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href={ROUTES.ACCOUNTS} className="text-sm text-primary hover:underline">
              Return to accounts
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        <p className="mt-4 text-muted-foreground">Connecting your account...</p>
      </div>
    </div>
  );
}
