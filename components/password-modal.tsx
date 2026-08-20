"use client";

import { useState, useEffect, useRef } from "react";

interface PasswordModalProps {
  open: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PasswordModal({ open, onSuccess, onCancel }: PasswordModalProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setPassword("");
      setError(false);
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        onSuccess();
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-sm border border-white/10 bg-black/90 backdrop-blur-md rounded-lg p-6"
      >
        <h2 className="text-base font-medium text-white/80 mb-1">Enter demo password</h2>
        <p className="text-xs text-white/35 mb-4">This demo is password-protected to prevent abuse.</p>
        <input
          ref={inputRef}
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError(false);
          }}
          placeholder="Password"
          disabled={loading}
          className={`w-full border bg-white/5 text-white/75 placeholder-white/30 rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors ${
            error ? "border-red-500/50 focus:border-red-500/50" : "border-white/10 focus:border-white/25"
          }`}
        />
        {error && (
          <p className="text-xs text-red-400 mt-1.5">Wrong password. Try again.</p>
        )}
        <p className="text-[11px] text-white/25 mt-3">
          Don&apos;t have the password? Contact us at{" "}
          <a href="mailto:hello@silba.xyz" className="text-white/40 hover:text-white/60 underline underline-offset-2 transition-colors">
            hello@silba.xyz
          </a>
        </p>
        <div className="flex items-center justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="text-sm text-white/40 hover:text-white/70 transition-colors cursor-pointer px-3 py-1.5"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!password || loading}
            className="bg-white/10 text-white text-sm font-medium rounded-lg hover:bg-white/20 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors px-4 py-1.5"
          >
            {loading ? "Checking..." : "Continue"}
          </button>
        </div>
      </form>
    </div>
  );
}
