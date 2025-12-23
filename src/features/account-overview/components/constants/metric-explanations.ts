export interface MetricExplanation {
  title: string;
  description: string;
  formula?: string;
  tip?: string;
}

export const metricExplanations: Record<string, MetricExplanation> = {
  "Total Spend": {
    title: "Total Ad Spend",
    description:
      "The total amount of money spent on your Google Ads campaigns during the selected time period.",
    tip: "Monitor this to ensure you stay within budget. Lower spend with same results = better efficiency.",
  },
  Impressions: {
    title: "Ad Impressions",
    description:
      "The number of times your ads were shown to users. Each time your ad appears on a search result page or website, it counts as one impression.",
    formula: "CTR (Click-Through Rate) = Clicks / Impressions x 100%",
    tip: "High impressions but low clicks may indicate your ad copy needs improvement.",
  },
  Clicks: {
    title: "Ad Clicks",
    description:
      "The number of times users clicked on your ads. This indicates user interest and drives traffic to your website.",
    formula: "Avg CPC (Cost Per Click) = Total Spend / Total Clicks",
    tip: "Quality clicks matter more than quantity. Focus on attracting your target audience.",
  },
  Conversions: {
    title: "Conversions",
    description:
      "The number of valuable actions users completed after clicking your ad, such as purchases, sign-ups, or form submissions.",
    formula: "Cost per Conversion = Total Spend / Conversions",
    tip: "This is your most important metric - it shows actual business results from your ads.",
  },
  "Conversion Value": {
    title: "Conversion Value",
    description:
      "The total monetary value of all conversions. This represents the revenue generated from your ad campaigns.",
    tip: "Compare this to your spend to understand profitability.",
  },
  ROAS: {
    title: "Return on Ad Spend",
    description:
      "How much revenue you earn for every dollar spent on advertising. A ROAS of 2x means you earn $2 for every $1 spent.",
    formula: "ROAS = Conversion Value / Ad Spend",
    tip: "ROAS > 1x means profitable. Industry average is typically 2-4x depending on margins.",
  },
  "Total Campaigns": {
    title: "Total Campaigns",
    description:
      "The total number of advertising campaigns in your Google Ads account, including both active and paused campaigns.",
    tip: "Consolidating campaigns can simplify management and improve performance.",
  },
  "Top Campaigns": {
    title: "Top Performing Campaigns",
    description:
      "Your best-performing campaigns ranked by the number of conversions. Click on any campaign to view detailed performance data and optimization options.",
    tip: "Focus your budget on top performers. Consider pausing or optimizing low-performing campaigns.",
  },
  "Campaign Distribution": {
    title: "Campaign Type Breakdown",
    description:
      "Shows how your campaigns are distributed across different Google Ads campaign types (Search, Shopping, Display, Performance Max, etc.).",
    tip: "A diverse mix of campaign types can help you reach customers at different stages of their buying journey.",
  },
};
