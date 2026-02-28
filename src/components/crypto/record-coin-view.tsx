"use client";

import { useEffect } from "react";
import { recordRecentlyViewed } from "./recently-viewed";

interface RecordCoinViewProps {
  id: string;
  name: string;
  symbol: string;
  image: string;
}

/**
 * Records coin view to localStorage for recently viewed.
 * Renders nothing.
 */
export function RecordCoinView({ id, name, symbol, image }: RecordCoinViewProps) {
  useEffect(() => {
    recordRecentlyViewed({ id, name, symbol, image });
  }, [id, name, symbol, image]);
  return null;
}
