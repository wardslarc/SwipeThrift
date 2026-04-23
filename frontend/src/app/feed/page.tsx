"use client";

import React, { useState, useEffect } from "react";
import SwipeCard from "@/components/SwipeCard";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, PlusSquare, MessageSquare, User } from "lucide-react";

interface Listing {
  id: string;
  title: string;
  price: number;
  images: string[];
}

export default function FeedPage() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [credits, setCredits] = useState<number>(30);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Feed and User Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user info for credits
        const userRes = await fetch("/api/auth/me");
        if (userRes.ok) {
          const userData = await userRes.json();
          setCredits(userData.credits);
        } else {
          router.push("/login");
          return;
        }

        // Fetch Listings Feed
        const feedRes = await fetch("/api/listings/feed");
        if (feedRes.ok) {
          const feedData = await feedRes.json();
          setListings(feedData);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleSwipe = async (direction: "LEFT" | "RIGHT", listingId: string) => {
    // Optimistic UI: remove from stack immediately
    setListings((prev) => prev.filter((item) => item.id !== listingId));

    try {
      await fetch("/api/listings/swipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, direction }),
      });
    } catch (err) {
      console.error("Swipe failed:", err);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--background)] flex flex-col pb-24">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[var(--background)] p-4 border-b-2 border-black flex justify-between items-center shadow-[0_2px_0_0_rgba(0,0,0,1)]">
        <h1 className="text-xl font-black uppercase tracking-tighter">
          Swipe<span className="text-[var(--secondary)]">Thrift</span>
        </h1>
        <div className="brutalist-card px-3 py-1 font-bold bg-white text-sm">
          <span className="text-zinc-500 uppercase mr-1">Credits:</span>
          <span className="text-[var(--primary)]">{credits}</span>
        </div>
      </header>

      {/* Main Feed Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative p-4 mt-4">
        {isLoading ? (
          <div className="font-black text-2xl uppercase animate-pulse">
            LOADING ITEMS...
          </div>
        ) : listings.length > 0 ? (
          <div className="relative w-full max-w-sm aspect-[3/4]">
            {listings.slice(0, 2).reverse().map((listing, index) => (
              <SwipeCard
                key={listing.id}
                listing={listing}
                isFront={index === 1 || listings.length === 1}
                onSwipe={(dir) => handleSwipe(dir, listing.id)}
              />
            ))}
          </div>
        ) : (
          <div className="brutalist-card p-12 text-center bg-white w-full max-w-sm">
            <h2 className="text-2xl font-black uppercase mb-4 text-black">You&apos;re All Caught Up!</h2>
            <p className="font-medium text-zinc-600 italic text-sm">
              No new items in your area. Check back later or post your own!
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons (Floating above Nav) */}
      {!isLoading && listings.length > 0 && (
        <div className="fixed bottom-24 left-0 right-0 flex justify-center gap-6 z-10">
          <button 
            onClick={() => handleSwipe("LEFT", listings[0].id)}
            className="w-14 h-14 rounded-full border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center text-red-500 font-black text-xl active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            ✕
          </button>
          <button 
            onClick={() => handleSwipe("RIGHT", listings[0].id)}
            className="w-14 h-14 rounded-full border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center text-green-500 font-black text-xl active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            ♥
          </button>
        </div>
      )}

      {/* Improved Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-black z-30 flex h-16 shadow-[0_-4px_0_0_rgba(0,0,0,0.05)]">
         <button className="flex-1 flex flex-col items-center justify-center gap-1 border-r-2 border-black bg-violet-50 text-[var(--primary)]">
            <Sparkles size={20} strokeWidth={3} />
            <span className="text-[10px] font-black uppercase">Feed</span>
         </button>
         <Link href="/sell" className="flex-1 flex flex-col items-center justify-center gap-1 border-r-2 border-black text-zinc-400 hover:text-black transition-colors">
            <PlusSquare size={20} strokeWidth={2.5} />
            <span className="text-[10px] font-black uppercase">Sell</span>
         </Link>
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
