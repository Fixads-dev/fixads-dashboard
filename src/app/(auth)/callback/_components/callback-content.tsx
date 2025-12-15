"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCompleteGoogleOAuth } from "@/features/auth";
import { ROUTES } from "@/shared/lib/constants";

export function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mutate: completeOAuth, isError, error } = useCompleteGoogleOAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double processing in React Strict Mode
    if (hasProcessed.current) return;

    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      router.replace(`${ROUTES.LOGIN}?error=${encodeURIComponent(errorParam)}`);
      return;
    }

    if (!code || !state) {
      router.replace(ROUTES.LOGIN);
      return;
    }

    hasProcessed.current = true;
    const redirectUri = `${window.location.origin}/callback`;
    completeOAuth({ code, state, redirect_uri: redirectUri });
  }, [searchParams, completeOAuth, router]);

  if (isError) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle>Authentication Failed</CardTitle>
          <CardDescription>{error?.message ?? "An error occurred during sign in"}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <a href={ROUTES.LOGIN} className="text-sm text-primary hover:underline">
            Try again
          </a>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="text-center">
        <CardTitle>Authenticating</CardTitle>
        <CardDescription>Please wait while we complete your sign in...</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </CardContent>
    </Card>
  );
}
