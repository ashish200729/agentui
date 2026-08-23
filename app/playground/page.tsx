import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Playground",
  description:
    "Tweak spring, tween and stagger properties, watch them play, and copy the motion code. Built on AgentUI's motion tokens.",
  alternates: { canonical: "/playground" },
};

export default function PlaygroundPage() {
  redirect("/components/agents");
}
