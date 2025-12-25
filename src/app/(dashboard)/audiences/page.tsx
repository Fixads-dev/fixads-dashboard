"use client";

import { Suspense } from "react";
import { AudiencesContent } from "./_components/audiences-content";

export default function AudiencesPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <AudiencesContent />
    </Suspense>
  );
}
