"use client";

import { useCallback } from "react";
import { Share2, Link2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { CoinDetailLinks } from "@/lib/api/coingecko-types";

interface CoinDetailActionsProps {
  coinId: string;
  coinName: string;
  links?: CoinDetailLinks;
}

/**
 * Share and copy link buttons, plus external links for coin detail page.
 */
export function CoinDetailActions({ coinId, coinName, links }: CoinDetailActionsProps) {
  const getUrl = useCallback(
    () => (typeof window !== "undefined" ? `${window.location.origin}/coin/${coinId}` : ""),
    [coinId]
  );

  const handleCopy = useCallback(async () => {
    const url = getUrl();
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Failed to copy link");
    }
  }, [getUrl]);

  const handleShare = useCallback(async () => {
    const url = getUrl();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${coinName} Price - CryptoDash`,
          url,
          text: `Check out ${coinName} price and market data on CryptoDash`,
        });
        toast.success("Shared successfully");
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          toast.error("Failed to share");
        }
      }
    } else {
      handleCopy();
    }
  }, [getUrl, coinName, handleCopy]);

  const homepage = links?.homepage?.filter(Boolean)[0];
  const twitter = links?.twitter_screen_name
    ? `https://twitter.com/${links.twitter_screen_name}`
    : null;
  const subreddit = links?.subreddit_url ?? null;
  const github = links?.repos_url?.github?.filter(Boolean)[0] ?? null;
  const whitepaper = links?.whitepaper ?? null;

  const externalLinks = [
    homepage && { href: homepage, label: "Website", icon: ExternalLink },
    twitter && { href: twitter, label: "Twitter", icon: ExternalLink },
    subreddit && { href: subreddit, label: "Reddit", icon: ExternalLink },
    github && { href: github, label: "GitHub", icon: ExternalLink },
    whitepaper && { href: whitepaper, label: "Whitepaper", icon: ExternalLink },
  ].filter(Boolean) as { href: string; label: string; icon: typeof ExternalLink }[];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" onClick={handleShare}>
        <Share2 className="mr-1.5 h-4 w-4" />
        Share
      </Button>
      <Button variant="outline" size="sm" onClick={handleCopy}>
        <Link2 className="mr-1.5 h-4 w-4" />
        Copy link
      </Button>
      {externalLinks.map(({ href, label }) => (
        <Button key={href} variant="ghost" size="sm" asChild>
          <a href={href} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-1.5 h-4 w-4" />
            {label}
          </a>
        </Button>
      ))}
    </div>
  );
}
