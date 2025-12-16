"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useConnectAccount,
  useExchangeCodeForTokens,
  useGetAccessibleCustomers,
} from "@/features/accounts";
import { ROUTES } from "@/shared/lib/constants";

type ConnectionStep = "exchanging" | "fetching_customers" | "connecting" | "error" | "success";

export function ConnectCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasProcessed = useRef(false);
  const [step, setStep] = useState<ConnectionStep>("exchanging");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const exchangeTokens = useExchangeCodeForTokens();
  const getAccessibleCustomers = useGetAccessibleCustomers();
  const connectAccount = useConnectAccount();

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

    // Step 1: Exchange code for tokens
    setStep("exchanging");
    exchangeTokens.mutate(
      { code, state, redirect_uri: redirectUri },
      {
        onSuccess: (tokenData) => {
          // Step 2: Fetch accessible customers
          setStep("fetching_customers");
          getAccessibleCustomers.mutate(tokenData.refresh_token, {
            onSuccess: (customerData) => {
              const customers = customerData.customers;

              if (customers.length === 0) {
                setStep("error");
                setErrorMessage(
                  "No Google Ads accounts found. Please ensure you have access to at least one Google Ads account.",
                );
                return;
              }

              // Step 3: Auto-connect the first customer
              // In the future, this could show a selection UI if multiple customers exist
              const customer = customers[0];
              setStep("connecting");
              connectAccount.mutate(
                {
                  customer_id: customer.customer_id,
                  refresh_token: tokenData.refresh_token,
                  login_customer_id: customer.is_manager ? customer.customer_id : undefined,
                },
                {
                  onSuccess: () => {
                    setStep("success");
                    router.replace(ROUTES.ACCOUNTS);
                  },
                  onError: (error) => {
                    setStep("error");
                    setErrorMessage(error.message || "Failed to connect account");
                  },
                },
              );
            },
            onError: (error) => {
              setStep("error");
              setErrorMessage(error.message || "Failed to fetch accessible accounts");
            },
          });
        },
        onError: (error) => {
          setStep("error");
          setErrorMessage(error.message || "Failed to exchange authorization code");
        },
      },
    );
  }, [searchParams, router, exchangeTokens, getAccessibleCustomers, connectAccount]);

  if (step === "error") {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Connection Failed</CardTitle>
            <CardDescription>
              {errorMessage ?? "Failed to connect your Google Ads account"}
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

  const stepMessages: Record<ConnectionStep, string> = {
    exchanging: "Exchanging authorization code...",
    fetching_customers: "Fetching accessible accounts...",
    connecting: "Connecting your account...",
    error: "",
    success: "Account connected!",
  };

  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        <p className="mt-4 text-muted-foreground">{stepMessages[step]}</p>
      </div>
    </div>
  );
}
