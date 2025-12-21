"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type AccessibleCustomer,
  useConnectAccount,
  useExchangeCodeForTokens,
  useGetAccessibleCustomers,
} from "@/features/accounts";
import { ROUTES } from "@/shared/lib/constants";
import { AccountSelection } from "./account-selection";

type ConnectionStep =
  | "exchanging"
  | "fetching_customers"
  | "selecting"
  | "connecting"
  | "error"
  | "success";

export function ConnectCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasProcessed = useRef(false);
  const [step, setStep] = useState<ConnectionStep>("exchanging");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [customers, setCustomers] = useState<AccessibleCustomer[]>([]);
  const [refreshToken, setRefreshToken] = useState<string>("");
  const [connectingCount, setConnectingCount] = useState({ current: 0, total: 0 });

  const exchangeTokens = useExchangeCodeForTokens();
  const getAccessibleCustomers = useGetAccessibleCustomers();
  const connectAccount = useConnectAccount();

  // Use refs for mutation functions to avoid stale closures in useEffect
  const exchangeTokensRef = useRef(exchangeTokens);
  const getAccessibleCustomersRef = useRef(getAccessibleCustomers);
  const connectAccountRef = useRef(connectAccount);

  // Keep refs updated
  exchangeTokensRef.current = exchangeTokens;
  getAccessibleCustomersRef.current = getAccessibleCustomers;
  connectAccountRef.current = connectAccount;

  // Memoized process function to handle the OAuth flow
  const processOAuthCallback = useCallback(
    (code: string, state: string) => {
      const redirectUri = `${window.location.origin}/accounts/connect/callback`;

      // Step 1: Exchange code for tokens
      setStep("exchanging");
      exchangeTokensRef.current.mutate(
        { code, state, redirect_uri: redirectUri },
        {
          onSuccess: (tokenData) => {
            setRefreshToken(tokenData.refresh_token);

            // Step 2: Fetch accessible customers
            setStep("fetching_customers");
            getAccessibleCustomersRef.current.mutate(tokenData.refresh_token, {
              onSuccess: (customerData) => {
                const fetchedCustomers = customerData.customers;

                if (fetchedCustomers.length === 0) {
                  setStep("error");
                  setErrorMessage(
                    "No Google Ads accounts found. Please ensure you have access to at least one Google Ads account.",
                  );
                  return;
                }

                // If only one regular account, auto-connect it
                const regularAccounts = fetchedCustomers.filter((c) => !c.is_manager);
                if (regularAccounts.length === 1 && fetchedCustomers.length === 1) {
                  // Single account, auto-connect
                  const customer = fetchedCustomers[0];
                  setStep("connecting");
                  connectAccountRef.current.mutate(
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
                } else {
                  // Multiple accounts or MCC detected - show selection UI
                  setCustomers(fetchedCustomers);
                  setStep("selecting");
                }
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
    },
    [router],
  );

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
    processOAuthCallback(code, state);
  }, [searchParams, router, processOAuthCallback]);

  const handleConnectAccounts = async (
    accounts: Array<{ customer_id: string; login_customer_id?: string }>,
  ) => {
    setStep("connecting");
    setConnectingCount({ current: 0, total: accounts.length });

    // Connect accounts sequentially
    for (let i = 0; i < accounts.length; i++) {
      const account = accounts[i];
      setConnectingCount({ current: i + 1, total: accounts.length });

      try {
        await new Promise<void>((resolve, reject) => {
          connectAccount.mutate(
            {
              customer_id: account.customer_id,
              refresh_token: refreshToken,
              login_customer_id: account.login_customer_id,
            },
            {
              onSuccess: () => resolve(),
              onError: (error) => reject(error),
            },
          );
        });
      } catch (error) {
        // Continue connecting remaining accounts even if one fails
        console.error(`Failed to connect account ${account.customer_id}:`, error);
      }
    }

    setStep("success");
    router.replace(ROUTES.ACCOUNTS);
  };

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

  if (step === "selecting") {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-4">
        <AccountSelection
          customers={customers}
          onConnect={handleConnectAccounts}
          isConnecting={connectAccount.isPending}
        />
      </div>
    );
  }

  const stepMessages: Record<ConnectionStep, string> = {
    exchanging: "Exchanging authorization code...",
    fetching_customers: "Fetching accessible accounts...",
    selecting: "",
    connecting:
      connectingCount.total > 1
        ? `Connecting account ${connectingCount.current} of ${connectingCount.total}...`
        : "Connecting your account...",
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
