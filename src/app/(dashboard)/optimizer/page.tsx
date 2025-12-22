import { redirect } from "next/navigation";

import { ROUTES } from "@/shared/lib/constants";

export default function OptimizerPage() {
  redirect(ROUTES.OPTIMIZER_TEXT);
}
