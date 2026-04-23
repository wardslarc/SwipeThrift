"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email: email || null, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Something went wrong");
      }

      // Success! Redirect to login
      router.push("/login?registered=true");
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
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black uppercase tracking-tighter text-black mb-2">
            Join <span className="text-[var(--primary)]">Swipe</span>
          </h1>
          <p className="text-zinc-600 font-medium italic">
            Get 30 credits on sign up!
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-100 border-2 border-red-600 text-red-600 font-bold text-sm uppercase">
              {error}
            </div>
          )}

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
              Email Address
            </label>
            <input
              type="email"
              className="brutalist-input"
              placeholder="king@thrift.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            className="w-full brutalist-button-secondary disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? "CREATING..." : "SIGN UP"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm font-bold">
            Already a member?{" "}
            <Link
              href="/login"
              className="text-[var(--primary)] underline decoration-2 underline-offset-4 hover:text-violet-700"
            >
              Log In
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
