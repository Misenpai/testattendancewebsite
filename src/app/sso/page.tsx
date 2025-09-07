"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import Link from "next/link";

export default function SSOPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSSOUser } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setError("No SSO token provided");
      return;
    }

    try {
      // Decode the SSO token
      const decodedToken = atob(decodeURIComponent(token));
      const ssoData = JSON.parse(decodedToken);

      // Validate SSO data
      if (
        !ssoData.username ||
        !ssoData.projectCodes ||
        !Array.isArray(ssoData.projectCodes)
      ) {
        throw new Error("Invalid SSO data");
      }

      // Store SSO user data
      const authUser = {
        username: ssoData.username,
        projectCode: ssoData.projectCodes[0], // Primary project
        projects: ssoData.projectCodes, // All projects
        token: `sso-${Date.now()}`, // Generate a simple SSO token
        isSSO: true,
      };

      setSSOUser(authUser);

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error("SSO Error:", err);
      setError("Invalid SSO token");
    }
  }, [searchParams, router, setSSOUser]);

  if (error) {
    return (
      <div className="loading-screen">
        <div className="error-message">
          {error}
          <br />
          <Link href="/">Go to login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="loading-screen">
      <div className="loading-spinner">Authenticating via SSO...</div>
    </div>
  );
}
