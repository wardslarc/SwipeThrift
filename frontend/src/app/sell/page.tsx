"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, PlusSquare, MessageSquare, User, Camera, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function SellPage() {
  const router = useRouter();
  const [credits, setCredits] = useState<number>(0);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setCredits(data.credits);
      } else {
        router.push("/login");
      }
    };
    fetchUser();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (credits < 20) {
      setError("INSUFFICIENT CREDITS. YOU NEED 20 CREDITS TO POST.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          price: parseFloat(price),
          description,
          images: [imageUrl], // MVP uses 1 image in array
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to post listing");
      }

      setSuccess(true);
      setCredits(prev => prev - 20);
      // Reset form
      setTitle("");
      setPrice("");
      setDescription("");
      setImageUrl("");
      
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message.toUpperCase() : "SERVER ERROR");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex flex-col pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background p-4 border-b-2 border-black flex justify-between items-center shadow-[0_2px_0_0_rgba(0,0,0,1)]">
        <h1 className="text-xl font-black uppercase tracking-tighter">
          Swipe<span className="text-[var(--secondary)]">Thrift</span>
        </h1>
        <div className="brutalist-card px-3 py-1 font-bold bg-white text-sm">
          <span className="text-zinc-500 uppercase mr-1">Credits:</span>
          <span className="text-[var(--primary)]">{credits}</span>
        </div>
      </header>

      <div className="flex-1 p-4 max-w-md mx-auto w-full">
        <div className="mb-8">
          <h2 className="text-3xl font-black uppercase leading-none mb-2">Post an Item</h2>
          <p className="font-bold text-zinc-500 text-sm uppercase italic">Costs 20 credits per listing.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border-2 border-red-600 text-red-600 flex gap-3 items-center">
            <AlertCircle size={24} />
            <span className="font-black text-xs leading-tight">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-100 border-2 border-green-600 text-green-600 font-black text-sm uppercase">
            Listing posted successfully! -20 Credits.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-black uppercase mb-2">Item Title</label>
            <input
              type="text"
              className="brutalist-input"
              placeholder="VINTAGE LEATHER JACKET"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase mb-2">Price ($)</label>
              <input
                type="number"
                className="brutalist-input"
                placeholder="45.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase mb-2">Image URL</label>
              <div className="relative">
                <input
                  type="url"
                  className="brutalist-input pl-10"
                  placeholder="HTTP://..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <Camera className="absolute left-3 top-3.5 text-zinc-400" size={18} />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase mb-2">Description</label>
            <textarea
              className="brutalist-input min-h-[100px]"
              placeholder="TELL US ABOUT IT..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <button 
            type="submit" 
            className="w-full brutalist-button-secondary disabled:opacity-50 py-4 text-lg"
            disabled={isLoading || credits < 20}
          >
            {isLoading ? "POSTING..." : "LIST ITEM (20 CREDITS)"}
          </button>
        </form>
      </div>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-black z-30 flex h-16 shadow-[0_-4px_0_0_rgba(0,0,0,0.05)]">
         <Link href="/feed" className="flex-1 flex flex-col items-center justify-center gap-1 border-r-2 border-black text-zinc-400 hover:text-black transition-colors">
            <Sparkles size={20} strokeWidth={2.5} />
            <span className="text-[10px] font-black uppercase">Feed</span>
         </Link>
         <button className="flex-1 flex flex-col items-center justify-center gap-1 border-r-2 border-black bg-pink-50 text-[var(--secondary)]">
            <PlusSquare size={20} strokeWidth={3} />
            <span className="text-[10px] font-black uppercase">Sell</span>
         </button>
         <button className="flex-1 flex flex-col items-center justify-center gap-1 border-r-2 border-black text-zinc-400 hover:text-black transition-colors">
            <MessageSquare size={20} strokeWidth={2.5} />
            <span className="text-[10px] font-black uppercase">Chat</span>
         </button>
         <Link href="/profile" className="flex-1 flex flex-col items-center justify-center gap-1 text-zinc-400 hover:text-black transition-colors">
            <User size={20} strokeWidth={2.5} />
            <span className="text-[10px] font-black uppercase">Me</span>
         </Link>
      </nav>
    </main>
  );
}
