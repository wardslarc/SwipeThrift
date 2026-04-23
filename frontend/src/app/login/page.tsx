"use client";

import React, { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Invalid credentials");
      }

      // Success! Token is set in HTTP-only cookie by backend
      router.push("/feed");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center p-4">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/bg.png"
          alt="Background"
          fill
          className="object-cover opacity-40"
          priority
        />
      </div>

      <div className="brutalist-card relative z-10 w-full max-w-md p-8 bg-white/95 backdrop-blur-sm">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="relative w-48 h-12 mb-2">
            <Image
              src="/swipethrift.png"
              alt="SwipeThrift Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <p className="text-zinc-600 font-medium italic">
            intentional thrifting for the bold.
          </p>
        </div>

        {registered && (
          <div className="mb-6 p-3 bg-green-100 border-2 border-green-600 text-green-600 font-bold text-sm uppercase">
            Account created! Please log in.
          </div>
        )}

        {error && (
          <div className="mb-6 p-3 bg-red-100 border-2 border-red-600 text-red-600 font-bold text-sm uppercase">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold uppercase mb-2">
              Username
            </label>
            <input
              type="text"
              className="brutalist-input"
              placeholder="thrift_king"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-bold uppercase mb-2">
              Password
            </label>
            <input
              type="password"
              className="brutalist-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <button 
            type="submit" 
            className="w-full brutalist-button-primary disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? "LOGGING IN..." : "LOG IN"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm font-bold">
            New here?{" "}
            <Link
              href="/register"
              className="text-[var(--secondary)] underline decoration-2 underline-offset-4 hover:text-pink-700"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold">LOADING...</div>}>
      <LoginContent />
    </Suspense>
  );
}
