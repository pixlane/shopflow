"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Demo: just redirect after brief delay
    setTimeout(() => {
      window.location.href = "/admin/dashboard";
    }, 800);
  }

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-foreground mb-4">
            <span className="text-background text-sm font-bold tracking-widest">A</span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Admin access</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Sign in to the Atelier dashboard
          </p>
        </div>

        {/* Card */}
        <div className="bg-card rounded-2xl border border-border p-7 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Email address</label>
              <input
                type="email"
                defaultValue="admin@atelier.com"
                required
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                placeholder="admin@atelier.com"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium">Password</label>
                <Link
                  href="#"
                  className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  defaultValue="demo1234"
                  required
                  className="w-full h-10 pl-3 pr-10 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 mt-2 rounded-md bg-foreground text-background text-sm font-medium flex items-center justify-center gap-2 hover:bg-foreground/90 active:scale-[0.98] transition-all disabled:opacity-70"
            >
              {loading ? (
                <span className="h-4 w-4 rounded-full border-2 border-background/30 border-t-background animate-spin" />
              ) : (
                <>
                  Sign in <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Demo hint */}
          <div className="mt-5 pt-5 border-t border-border text-center">
            <p className="text-[11px] text-muted-foreground">
              Demo credentials are pre-filled.
            </p>
          </div>
        </div>

        {/* Back to store */}
        <p className="text-center text-[11px] text-muted-foreground mt-6">
          <Link
            href="/store"
            className="hover:text-foreground transition-colors"
          >
            ← Back to storefront
          </Link>
        </p>
      </div>
    </div>
  );
}
