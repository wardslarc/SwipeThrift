"use client";

import React, { useState, useEffect } from "react";
import SwipeCard from "@/components/SwipeCard";
import { useRouter } from "next/navigation";

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
      // Right swipe auto-chat logic is handled by backend in Phase 3
    } catch (err) {
      console.error("Swipe failed:", err);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--background)] flex flex-col p-4">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black uppercase tracking-tighter">
          Swipe<span className="text-[var(--secondary)]">Thrift</span>
        </h1>
        <div className="brutalist-card px-4 py-1 font-bold bg-white">
          CREDITS: <span className="text-[var(--primary)] text-lg">{credits}</span>
        </div>
      </header>

      {/* Main Feed Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        {isLoading ? (
          <div className="font-black text-2xl uppercase animate-pulse">
            LOADING ITEMS...
          </div>
        ) : listings.length > 0 ? (
          <div className="relative w-full max-w-sm aspect-[3/4]">
            {/* Show up to 2 cards at once for performance/stacking effect */}
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
            <h2 className="text-3xl font-black uppercase mb-4">You&apos;re All Caught Up!</h2>
            <p className="font-medium text-zinc-600 italic">
              No new items in your area. Check back later or post your own!
            </p>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <nav className="mt-auto pt-8 flex justify-around items-center border-t-2 border-black/10">
         <button className="font-black uppercase text-[var(--primary)] border-b-4 border-[var(--primary)] pb-1">Feed</button>
         <button className="font-bold uppercase text-zinc-400 hover:text-black transition-colors">Sell</button>
         <button className="font-bold uppercase text-zinc-400 hover:text-black transition-colors">Chat</button>
         <button className="font-bold uppercase text-zinc-400 hover:text-black transition-colors">Profile</button>
      </nav>
    </main>
  );
}
