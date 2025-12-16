"use client";

import { Suspense } from "react";
import { CampaignDetailContent } from "./_components/campaign-detail-content";

export default function CampaignDetailPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <CampaignDetailContent />
    </Suspense>
  );
}
