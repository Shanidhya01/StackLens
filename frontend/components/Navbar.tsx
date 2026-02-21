"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const isActive = (path: string) => pathname === path;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Syne:wght@700;800&display=swap');

        .navbar {
          background: rgba(8, 12, 16, 0.85);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          font-family: 'IBM Plex Mono', monospace;
        }

        .nav-logo {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 1.2rem;
          color: #fff;
          letter-spacing: -0.02em;
          transition: opacity 0.2s;
        }
        .nav-logo:hover { opacity: 0.8; }

        .nav-badge {
          font-size: 10px;
          padding: 2px 7px;
          border-radius: 3px;
          background: rgba(52, 211, 153, 0.1);
          border: 1px solid rgba(52, 211, 153, 0.2);
          color: #34d399;
          letter-spacing: 0.04em;
        }

        .pulse-dot {
          animation: pulse-green 2s infinite;
        }
        @keyframes pulse-green {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .nav-link {
          font-size: 12px;
          letter-spacing: 0.07em;
          padding: 6px 14px;
          border-radius: 4px;
          color: rgba(255, 255, 255, 0.4);
          border: 1px solid transparent;
          transition: color 0.2s, border-color 0.2s, background 0.2s;
          text-decoration: none;
        }
        .nav-link:hover {
          color: rgba(255, 255, 255, 0.85);
          background: rgba(255, 255, 255, 0.04);
        }
        .nav-link.active {
          color: #34d399;
          border-color: rgba(52, 211, 153, 0.2);
          background: rgba(52, 211, 153, 0.06);
        }

        .nav-user {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 5px 12px;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
        }
        .nav-user-avatar {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: rgba(52, 211, 153, 0.15);
          border: 1px solid rgba(52, 211, 153, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          color: #34d399;
          font-weight: 600;
        }
        .nav-user-name {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.5);
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .btn-logout {
          font-size: 11px;
          letter-spacing: 0.08em;
          padding: 6px 14px;
          border-radius: 4px;
          color: rgba(255, 100, 100, 0.7);
          border: 1px solid rgba(255, 100, 100, 0.15);
          background: transparent;
          cursor: pointer;
          transition: color 0.2s, border-color 0.2s, background 0.2s;
          font-family: 'IBM Plex Mono', monospace;
        }
        .btn-logout:hover {
          color: #ff6464;
          border-color: rgba(255, 100, 100, 0.35);
          background: rgba(255, 100, 100, 0.06);
        }

        .btn-login {
          font-size: 12px;
          letter-spacing: 0.08em;
          padding: 7px 18px;
          border-radius: 4px;
          background: #34d399;
          color: #080c10;
          font-weight: 600;
          transition: background 0.2s, box-shadow 0.2s;
          font-family: 'IBM Plex Mono', monospace;
          text-decoration: none;
        }
        .btn-login:hover {
          background: #6ee7b7;
          box-shadow: 0 0 18px rgba(52, 211, 153, 0.25);
        }

        .divider {
          width: 1px;
          height: 16px;
          background: rgba(255, 255, 255, 0.08);
        }
      `}</style>

      <nav className="navbar fixed top-0 left-0 right-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-3 flex justify-between items-center">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot" />
            <span className="nav-logo">StackLens</span>
            <span className="nav-badge">v2.1</span>
          </Link>

          {/* Links + Auth */}
          <div className="flex items-center gap-2">
            <Link href="/" className={`nav-link${isActive("/") ? " active" : ""}`}>
              Home
            </Link>
            <Link href="/history" className={`nav-link${isActive("/history") ? " active" : ""}`}>
              History
            </Link>

            <div className="divider mx-2" />

            {user ? (
              <>
                <div className="nav-user">
                  <div className="nav-user-avatar">
                    {(user.displayName || user.email || "?")[0].toUpperCase()}
                  </div>
                  <span className="nav-user-name">
                    {user.displayName || user.email}
                  </span>
                </div>
                <button
                  onClick={() => signOut(auth)}
                  className="btn-logout"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" className="btn-login">
                Sign in →
              </Link>
            )}
          </div>

        </div>
      </nav>

      {/* Spacer so content doesn't hide under fixed nav */}
      <div style={{ height: "57px" }} />
    </>
  );
}