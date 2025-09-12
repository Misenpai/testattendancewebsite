// src/app/sso/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";
import Link from "next/link";

export default function SSOPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSSOUser } = useAuth();
  const [error, setError] = useState("");
  const [debug, setDebug] = useState<any>(null);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");
    console.log("Received token:", token);

    if (!token) {
      setError("No SSO token provided");
      return;
    }

    try {
      const decodedToken = atob(token);
      console.log("Decoded token:", decodedToken);

      const ssoData = JSON.parse(decodedToken);
      console.log("Parsed SSO data:", ssoData);

      if (
        !ssoData.username ||
        !ssoData.projectCodes ||
        !Array.isArray(ssoData.projectCodes)
      ) {
        console.error("Invalid SSO data structure:", ssoData);
        throw new Error("Invalid SSO data structure");
      }

      const tokenAge = Date.now() - ssoData.timestamp;
      const maxAge = 5 * 60 * 1000; // 5 minutes
      if (tokenAge > maxAge) {
        throw new Error("SSO token expired");
      }

      const authUser = {
        username: ssoData.username,
        projectCode: ssoData.projectCodes[0],
        projects: ssoData.projectCodes,
        token: `sso-${Date.now()}`,
        isSSO: true,
      };

      console.log("Created auth user:", authUser);
      setDebug({ ssoData, authUser, tokenAge });

      // Set the user in auth context
      setSSOUser(authUser);

      // Set redirecting state
      setRedirecting(true);

      // Force navigation using window.location for better reliability
      setTimeout(() => {
        console.log("Redirecting to dashboard...");
        window.location.href = "/dashboard";
      }, 2000);
    } catch (err) {
      console.error("SSO Error:", err);
      setError(
        `Invalid SSO token: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
      setDebug({ error: err, token });
    }
  }, [searchParams, setSSOUser]);

  if (error) {
    return (
      <div className="loading-screen">
        <div className="error-message">
          <h2>SSO Authentication Failed</h2>
          <p>{error}</p>
          {debug && (
            <div
              style={{
                marginTop: "20px",
                textAlign: "left",
                background: "#f0f0f0",
                padding: "10px",
                borderRadius: "5px",
              }}
            >
              <h3>Debug Info:</h3>
              <pre style={{ fontSize: "12px", overflow: "auto" }}>
                {JSON.stringify(debug, null, 2)}
              </pre>
            </div>
          )}
          <br />
          <Link href="/">Go to home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="loading-screen">
      <div className="loading-spinner">
        <p>
          {redirecting
            ? "Authentication successful! Redirecting to dashboard..."
            : "Authenticating via SSO..."}
        </p>
        {debug && (
          <div
            style={{
              marginTop: "20px",
              textAlign: "left",
              background: "#f0f0f0",
              padding: "10px",
              borderRadius: "5px",
              maxWidth: "600px",
            }}
          >
            <h3>Debug Info:</h3>
            <p>
              <strong>Username:</strong> {debug.authUser?.username}
            </p>
            <p>
              <strong>Projects:</strong> {debug.authUser?.projects?.join(", ")}
            </p>
            <p>
              <strong>Token Age:</strong> {debug.tokenAge}ms
            </p>
            {redirecting && (
              <p style={{ color: "green" }}>
                <strong>Status:</strong> Redirecting in 2 seconds...
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}