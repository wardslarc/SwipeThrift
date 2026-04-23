"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic for registration will go here
    console.log("Register attempt:", { username, email, password });
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
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-pink-500/20 mix-blend-multiply" />
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
            />
          </div>

          <div>
            <label className="block text-sm font-bold uppercase mb-2">
              Email (Optional)
            </label>
            <input
              type="email"
              className="brutalist-input"
              placeholder="king@thrift.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            />
          </div>

          <button type="submit" className="w-full brutalist-button-secondary">
            Sign Up
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
