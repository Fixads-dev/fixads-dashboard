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

// Module-level state to survive HMR remounts
// This is the key fix - HMR replaces the module but we store the Promise externally
let oauthPromise: Promise<void> | null = null;
let oauthResult: {
  type: "selecting" | "success" | "error";
  customers?: AccessibleCustomer[];
  refreshToken?: string;
  error?: string;
} | null = null;

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
  const hasStarted = useRef(false);
  const [step, setStep] = useState<ConnectionStep>("exchanging");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [customers, setCustomers] = useState<AccessibleCustomer[]>([]);
  const [refreshToken, setRefreshToken] = useState<string>("");
  const [connectingCount, setConnectingCount] = useState({ current: 0, total: 0 });

  const exchangeTokens = useExchangeCodeForTokens();
  const getAccessibleCustomers = useGetAccessibleCustomers();
  const connectAccount = useConnectAccount();

  // Process OAuth callback using async/await pattern
  // This survives HMR because we store the Promise at module level
  const processOAuthCallback = useCallback(
    async (code: string, state: string): Promise<void> => {
      const redirectUri = `${window.location.origin}/accounts/connect/callback`;

      try {
        // Step 1: Exchange code for tokens
        setStep("exchanging");

        const tokenData = await exchangeTokens.mutateAsync({
          code,
          state,
          redirect_uri: redirectUri,
        });

        if (!tokenData.refresh_token) {
          throw new Error("OAuth succeeded but no refresh token was returned. Please try again.");
        }

        // Step 2: Fetch accessible customers
        setStep("fetching_customers");

        const customerData = await getAccessibleCustomers.mutateAsync(tokenData.refresh_token);

        const fetchedCustomers = customerData.customers;

        if (fetchedCustomers.length === 0) {
          throw new Error("No Google Ads accounts found. Please ensure you have access to at least one Google Ads account.");
        }

        // If only one regular account, auto-connect it
        const regularAccounts = fetchedCustomers.filter((c) => !c.is_manager);
        if (regularAccounts.length === 1 && fetchedCustomers.length === 1) {
          // Single account, auto-connect
          const customer = fetchedCustomers[0];
          setStep("connecting");

          await connectAccount.mutateAsync({
            customer_id: customer.customer_id,
            refresh_token: tokenData.refresh_token,
            login_customer_id: customer.is_manager ? customer.customer_id : undefined,
          });

          oauthResult = { type: "success" };
          setStep("success");
          router.replace(ROUTES.ACCOUNTS);
        } else {
          // Multiple accounts or MCC detected - show selection UI
          oauthResult = {
            type: "selecting",
            customers: fetchedCustomers,
            refreshToken: tokenData.refresh_token,
          };
          setCustomers(fetchedCustomers);
          setRefreshToken(tokenData.refresh_token);
          setStep("selecting");
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to connect account";
        oauthResult = { type: "error", error: message };
        setStep("error");
        setErrorMessage(message);
      }
    },
    [router, exchangeTokens, getAccessibleCustomers, connectAccount],
  );

  useEffect(() => {
    // If OAuth already completed (from previous HMR mount), restore the result
    if (oauthResult) {
      if (oauthResult.type === "selecting" && oauthResult.customers) {
        setCustomers(oauthResult.customers);
        setRefreshToken(oauthResult.refreshToken || "");
        setStep("selecting");
      } else if (oauthResult.type === "error") {
        setStep("error");
        setErrorMessage(oauthResult.error || "Unknown error");
      } else if (oauthResult.type === "success") {
        setStep("success");
        router.replace(ROUTES.ACCOUNTS);
      }
      return;
    }

    // If OAuth is already in progress, just wait for it
    if (oauthPromise) {
      return;
    }

    // Prevent double execution within same component instance
    if (hasStarted.current) {
      return;
    }

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

    // Check sessionStorage to prevent code reuse across page refreshes
    const codeKey = `oauth_code_${code.slice(0, 10)}`;
    if (sessionStorage.getItem(codeKey)) {
      router.replace(ROUTES.ACCOUNTS);
      return;
    }

    // Mark as started and store in sessionStorage
    hasStarted.current = true;
    sessionStorage.setItem(codeKey, "processing");

    // Start the OAuth flow and store the Promise at module level
    // This ensures the Promise survives HMR remounts
    oauthPromise = processOAuthCallback(code, state).finally(() => {
      // Update sessionStorage when complete
      sessionStorage.setItem(codeKey, "completed");
    });
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
        await connectAccount.mutateAsync({
          customer_id: account.customer_id,
          refresh_token: refreshToken,
          login_customer_id: account.login_customer_id,
        });
      } catch {
        // Continue connecting remaining accounts even if one fails
      }
    }

    // Clear module-level state
    oauthPromise = null;
    oauthResult = null;

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
