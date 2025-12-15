import type { Metadata } from "next";
import { LoginContent } from "./_components/login-content";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Fixads Dashboard account",
};

export default function LoginPage() {
  return <LoginContent />;
}
