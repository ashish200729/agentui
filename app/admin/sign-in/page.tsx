import type { Metadata } from "next";
import { AdminSignIn } from "./sign-in";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default function AdminSignInPage() {
  return <AdminSignIn />;
}
