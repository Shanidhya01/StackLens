"use client";

import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/");
    } catch (e) {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#080c10", fontFamily: "'IBM Plex Mono', monospace" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');

        .grid-bg {
          background-image:
            linear-gradient(rgba(52,211,153,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(52,211,153,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        .login-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          backdrop-filter: blur(12px);
        }

        .google-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 13px 20px;
          border-radius: 7px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.85);
          font-family: 'IBM Plex Mono', monospace;
          font-size: 13px;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, box-shadow 0.2s;
        }
        .google-btn:hover:not(:disabled) {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.18);
          box-shadow: 0 0 20px rgba(255,255,255,0.04);
        }
        .google-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pulse-dot { animation: pulse-green 2s infinite; }
        @keyframes pulse-green {
          0%,100% { opacity:1; }
          50% { opacity:0.3; }
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.06);
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spin { animation: spin 0.8s linear infinite; }
      `}</style>

      {/* Full-page grid background */}
      <div className="grid-bg fixed inset-0 pointer-events-none" />

      {/* Radial glow */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(52,211,153,0.05) 0%, transparent 70%)"
      }} />

      <div className="relative z-10 w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot" />
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1.25rem", color: "#fff" }}>
              StackLens
            </span>
          </a>
          <h1
            style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "1.6rem", color: "#fff", lineHeight: 1.2 }}
            className="mb-2"
          >
            Welcome back
          </h1>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.03em" }}>
            Sign in to access your analyses and history
          </p>
        </div>

        {/* Card */}
        <div className="login-card p-7">

          {/* Terminal hint */}
          <div
            className="rounded-md px-4 py-3 mb-6 flex items-start gap-3"
            style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)" }}
          >
            <span style={{ color: "#34d399", fontSize: "12px" }}>$</span>
            <div>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>
                stacklens auth --provider google<br />
                <span style={{ color: "rgba(52,211,153,0.6)" }}>→ Awaiting authentication...</span>
              </p>
            </div>
          </div>

          {/* Google button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="google-btn"
          >
            {loading ? (
              <>
                <svg className="spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="10" />
                </svg>
                <span style={{ color: "rgba(255,255,255,0.4)" }}>Authenticating...</span>
              </>
            ) : (
              <>
                {/* Google logo */}
                <svg width="16" height="16" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                  <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
                  <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                  <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="divider-line" />
            <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.15em" }}>SECURE AUTH</span>
            <div className="divider-line" />
          </div>

          {/* Trust signals */}
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { icon: "🔒", label: "OAuth 2.0" },
              { icon: "⚡", label: "Instant access" },
              { icon: "🛡", label: "No password" },
            ].map((t) => (
              <div key={t.label} className="rounded-md py-2.5 px-2" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                <div style={{ fontSize: "14px", marginBottom: "3px" }}>{t.icon}</div>
                <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.05em" }}>{t.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center mt-5" style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)", lineHeight: 1.7 }}>
          By signing in, you agree to our{" "}
          <a href="/terms" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "underline" }}>Terms</a>
          {" & "}
          <a href="/privacy" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "underline" }}>Privacy Policy</a>
        </p>
      </div>
    </main>
  );
}