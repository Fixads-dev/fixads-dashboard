import { DashboardDetailContent } from "./_components/dashboard-detail-content";

interface Props {
  params: Promise<{ dashboardId: string }>;
}

export default async function DashboardDetailPage({ params }: Props) {
  const { dashboardId } = await params;
  return <DashboardDetailContent dashboardId={dashboardId} />;
}
