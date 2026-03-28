import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import type { Listing } from "../backend";
import RarityBadge from "./RarityBadge";

const CONDITION_LABELS: Record<string, string> = {
  mint: "Mint",
  nearMint: "Near Mint",
  lightlyPlayed: "Lightly Played",
  moderatelyPlayed: "Moderately Played",
  heavilyPlayed: "Heavily Played",
  damaged: "Damaged",
};

interface ListingCardProps {
  listing: Listing;
  index?: number;
}

export default function ListingCard({ listing, index = 0 }: ListingCardProps) {
  const priceUsd = (Number(listing.price) / 100).toFixed(2);
  const photoUrl = listing.photoUrl?.getDirectURL?.();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ y: -4 }}
    >
      <Link to="/card/$id" params={{ id: listing.id }}>
        <Card className="bg-card border-border overflow-hidden cursor-pointer group transition-all duration-200 hover:border-pokemon-yellow hover:shadow-glow">
          <div className="relative aspect-[3/4] overflow-hidden bg-muted">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={listing.cardName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-6xl opacity-20">🃏</div>
              </div>
            )}
            <div className="absolute inset-0 card-shine opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute top-2 left-2">
              <RarityBadge rarity={listing.rarity} />
            </div>
          </div>
          <CardContent className="p-3">
            <h3 className="font-display font-bold text-foreground truncate">
              {listing.cardName}
            </h3>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {listing.setName}
            </p>
            <div className="flex items-center justify-between mt-2">
              <Badge
                variant="outline"
                className="text-xs border-border text-muted-foreground"
              >
                {CONDITION_LABELS[listing.condition] || listing.condition}
              </Badge>
              <span className="font-display font-bold text-pokemon-yellow">
                ${priceUsd}
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
