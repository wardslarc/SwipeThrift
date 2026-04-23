"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, PlusSquare, MessageSquare, User, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Listing {
  id: string;
  title: string;
  price: number;
  status: "ACTIVE" | "SOLD" | "DELETED";
  images: string[];
}

export default function ProfilePage() {
  const router = useRouter();
  const [credits, setCredits] = useState<number>(0);
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await fetch("/api/auth/me");
        if (userRes.ok) {
          const userData = await userRes.json();
          setCredits(userData.credits);
        } else {
          router.push("/login");
          return;
        }

        const listingsRes = await fetch("/api/listings/my");
        if (listingsRes.ok) {
          const listingsData = await listingsRes.json();
          setListings(listingsData);
        }
      } catch (err) {
        console.error("Failed to fetch profile data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [router]);

  const markAsSold = async (id: string) => {
    try {
      const res = await fetch(`/api/listings/${id}/sold`, { method: "PATCH" });
      if (res.ok) {
        setListings(prev => prev.map(l => l.id === id ? { ...l, status: "SOLD" } : l));
      }
    } catch (err) {
      console.error("Failed to mark as sold:", err);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--background)] flex flex-col pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[var(--background)] p-4 border-b-2 border-black flex justify-between items-center shadow-[0_2px_0_0_rgba(0,0,0,1)]">
        <h1 className="text-xl font-black uppercase tracking-tighter">
          Swipe<span className="text-[var(--secondary)]">Thrift</span>
        </h1>
        <div className="brutalist-card px-3 py-1 font-bold bg-white text-sm">
          <span className="text-zinc-500 uppercase mr-1">Credits:</span>
          <span className="text-[var(--primary)]">{credits}</span>
        </div>
      </header>

      <div className="p-4 max-w-md mx-auto w-full">
        <div className="mb-8">
          <h2 className="text-3xl font-black uppercase leading-none mb-2 text-[var(--primary)]">My Closet</h2>
          <p className="font-bold text-zinc-500 text-sm uppercase italic">Manage your listings.</p>
        </div>

        {isLoading ? (
          <div className="font-black text-xl uppercase animate-pulse">LOADING...</div>
        ) : (
          <div className="space-y-4">
            {listings.length === 0 && (
              <div className="brutalist-card p-8 text-center bg-white">
                <p className="font-black uppercase text-sm mb-4">You haven&apos;t posted anything yet!</p>
                <Link href="/sell" className="brutalist-button-secondary inline-block">Post First Item</Link>
              </div>
            )}
            
            {listings.map((item) => (
              <div key={item.id} className={`brutalist-card p-4 flex gap-4 ${item.status === 'SOLD' ? 'opacity-60 grayscale' : 'bg-white'}`}>
                <div className="relative w-20 h-20 border-2 border-black flex-shrink-0">
                  <Image src={item.images[0]} alt={item.title} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black uppercase truncate text-sm">{item.title}</h3>
                  <p className="font-bold text-[var(--secondary)] text-lg">${item.price}</p>
                  <p className={`text-[10px] font-black uppercase mt-1 ${item.status === 'ACTIVE' ? 'text-green-600' : 'text-zinc-400'}`}>
                    Status: {item.status}
                  </p>
                </div>
                {item.status === 'ACTIVE' && (
                  <button 
                    onClick={() => markAsSold(item.id)}
                    className="self-center p-2 border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] bg-white hover:bg-green-50 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                    title="Mark as Sold"
                  >
                    <CheckCircle2 size={20} className="text-green-600" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-black z-30 flex h-16 shadow-[0_-4px_0_0_rgba(0,0,0,0.05)]">
         <Link href="/feed" className="flex-1 flex flex-col items-center justify-center gap-1 border-r-2 border-black text-zinc-400 hover:text-black transition-colors">
            <Sparkles size={20} strokeWidth={2.5} />
            <span className="text-[10px] font-black uppercase">Feed</span>
         </Link>
         <Link href="/sell" className="flex-1 flex flex-col items-center justify-center gap-1 border-r-2 border-black text-zinc-400 hover:text-black transition-colors">
            <PlusSquare size={20} strokeWidth={2.5} />
            <span className="text-[10px] font-black uppercase">Sell</span>
         </Link>
         <button className="flex-1 flex flex-col items-center justify-center gap-1 border-r-2 border-black text-zinc-400 hover:text-black transition-colors">
            <MessageSquare size={20} strokeWidth={2.5} />
            <span className="text-[10px] font-black uppercase">Chat</span>
         </button>
         <button className="flex-1 flex flex-col items-center justify-center gap-1 bg-violet-50 text-[var(--primary)]">
            <User size={20} strokeWidth={3} />
            <span className="text-[10px] font-black uppercase">Me</span>
         </button>
      </nav>
    </main>
  );
}
