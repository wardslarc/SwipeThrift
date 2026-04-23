"use client";

import React from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import Image from "next/image";

interface Listing {
  id: string;
  title: string;
  price: number;
  images: string[];
}

interface SwipeCardProps {
  listing: Listing;
  onSwipe: (direction: "LEFT" | "RIGHT") => void;
  isFront: boolean;
}

export default function SwipeCard({ listing, onSwipe, isFront }: SwipeCardProps) {
  const x = useMotionValue(0);
  
  // Rotation and Opacity based on horizontal drag (x)
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);

  // Swipe labels (Like/Nope)
  const likeOpacity = useTransform(x, [50, 150], [0, 1]);
  const nopeOpacity = useTransform(x, [-150, -50], [1, 0]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > 100) {
      onSwipe("RIGHT");
    } else if (info.offset.x < -100) {
      onSwipe("LEFT");
    }
  };

  return (
    <motion.div
      style={{ x, rotate, opacity, zIndex: isFront ? 10 : 0 }}
      drag={isFront ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={!isFront ? { scale: 0.95, y: 10 } : { scale: 1, y: 0 }}
      className="absolute inset-0 brutalist-card cursor-grab active:cursor-grabbing overflow-hidden bg-white"
    >
      {/* Image Area */}
      <div className="relative h-[75%] w-full bg-zinc-100">
        <Image
          src={listing.images[0] || "/next.svg"}
          alt={listing.title}
          fill
          sizes="(max-width: 768px) 100vw, 384px"
          className="object-cover pointer-events-none"
        />

        {/* Swipe Indicators */}
        <motion.div
          style={{ opacity: likeOpacity }}
          className="absolute top-8 left-8 border-4 border-green-500 text-green-500 font-black px-4 py-2 text-3xl uppercase -rotate-12"
        >
          LIKE
        </motion.div>
        <motion.div
          style={{ opacity: nopeOpacity }}
          className="absolute top-8 right-8 border-4 border-red-500 text-red-500 font-black px-4 py-2 text-3xl uppercase rotate-12"
        >
          NOPE
        </motion.div>
      </div>

      {/* Info Area */}
      <div className="p-6 bg-white border-t-2 border-black h-[25%] flex flex-col justify-center">
        <h2 className="text-xl font-black uppercase truncate tracking-tighter">
          {listing.title}
        </h2>
        <p className="text-2xl font-bold text-[var(--secondary)]">
          ${listing.price}
        </p>
      </div>
    </motion.div>
  );
}
