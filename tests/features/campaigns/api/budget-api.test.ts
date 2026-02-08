import { describe, expect, it } from "vitest";
import { budgetApi } from "@/features/campaigns/api/budget-api";

describe("budgetApi validates campaignId before making requests", () => {
  const INVALID_CAMPAIGN_ID = "abc; DROP TABLE";
  const ACCOUNT_ID = "test-account";

  it("getCampaignBudget rejects invalid campaignId", async () => {
    await expect(
      budgetApi.getCampaignBudget(ACCOUNT_ID, INVALID_CAMPAIGN_ID),
    ).rejects.toThrow("Invalid campaign ID");
  });

  it("updateBudget rejects invalid campaignId", async () => {
    await expect(
      budgetApi.updateBudget(ACCOUNT_ID, INVALID_CAMPAIGN_ID, {
        amount_micros: 1000000,
      }),
    ).rejects.toThrow("Invalid campaign ID");
  });

  it("getBudgetSpend rejects invalid campaignId", async () => {
    await expect(
      budgetApi.getBudgetSpend(ACCOUNT_ID, INVALID_CAMPAIGN_ID),
    ).rejects.toThrow("Invalid campaign ID");
  });

  it("getBudgetHistory rejects invalid campaignId", async () => {
    await expect(
      budgetApi.getBudgetHistory(ACCOUNT_ID, INVALID_CAMPAIGN_ID),
    ).rejects.toThrow("Invalid campaign ID");
  });
});
