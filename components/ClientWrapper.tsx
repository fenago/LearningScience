"use client";

import { Suspense } from "react";

// Wrapper component to handle Suspense boundaries for client components using useSearchParams
export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}
