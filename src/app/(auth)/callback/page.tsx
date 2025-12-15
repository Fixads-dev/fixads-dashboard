import type { Metadata } from "next";
import { Suspense } from "react";
import { CallbackContent } from "./_components/callback-content";
import { CallbackLoading } from "./_components/callback-loading";

export const metadata: Metadata = {
  title: "Authenticating...",
  description: "Completing authentication",
};

export default function CallbackPage() {
  return (
    <Suspense fallback={<CallbackLoading />}>
      <CallbackContent />
    </Suspense>
  );
}
