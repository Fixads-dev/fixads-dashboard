"use client";

import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GoogleOAuthButton, GuestGuard } from "@/features/auth";
import { APP_NAME } from "@/shared/lib/constants";

export function LoginContent() {
  return (
    <GuestGuard>
      <Card className="border-0 shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4">
            <Image
              src="/images/logo.png"
              alt="Fixads"
              width={64}
              height={64}
              className="rounded-xl"
              priority
            />
          </div>
          <CardTitle className="text-2xl font-bold">{APP_NAME}</CardTitle>
          <CardDescription>
            Sign in to optimize your Google Ads Performance Max campaigns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <GoogleOAuthButton />
          <p className="text-center text-xs text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardContent>
      </Card>
    </GuestGuard>
  );
}
