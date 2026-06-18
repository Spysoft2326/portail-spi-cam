"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ParametresContentFallback() {
  const router = useRouter();

  useEffect(() => {
    router.push("/dashboard/parametres");
  }, [router]);

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <div style={{ display: "inline-block", width: "40px", height: "40px", border: "4px solid #e5e7eb", borderTop: "4px solid #059669", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
      <p style={{ marginTop: "16px", color: "#6b7280" }}>Redirection vers les parametres...</p>
    </div>
  );
}
