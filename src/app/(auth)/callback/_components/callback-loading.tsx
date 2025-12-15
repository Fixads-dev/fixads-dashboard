"use client";

import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function CallbackLoading() {
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
