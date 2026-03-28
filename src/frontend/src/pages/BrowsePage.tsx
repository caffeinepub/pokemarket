import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { Zap } from "lucide-react";
import { motion } from "motion/react";
import ListingCard from "../components/ListingCard";
import { useGetAllListings } from "../hooks/useQueries";

const SKELETON_KEYS = [
  "s1",
  "s2",
  "s3",
  "s4",
  "s5",
  "s6",
  "s7",
  "s8",
  "s9",
  "s10",
  "s11",
  "s12",
];

export default function BrowsePage() {
  const { data: listings = [], isLoading } = useGetAllListings();

  return (
    <div>
      <div className="relative overflow-hidden">
        <img
          src="/assets/generated/hero-banner.dim_1200x400.jpg"
          alt="PokéMart"
          className="w-full h-48 md:h-64 object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl md:text-5xl font-bold"
          >
            Poké<span className="text-pokemon-red">Mart</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground mt-1"
          >
            Buy &amp; sell authentic Pokémon cards
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Link to="/create-listing">
              <Button
                className="mt-3 bg-pokemon-red hover:bg-primary/90 text-primary-foreground gap-1"
                size="sm"
                data-ocid="browse.primary_button"
              >
                <Zap className="h-4 w-4" /> List Your Cards
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <p className="text-sm text-muted-foreground mb-4">
          {isLoading
            ? "Loading..."
            : `${listings.length} card${listings.length !== 1 ? "s" : ""} available`}
        </p>

        {isLoading ? (
          <div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
            data-ocid="browse.loading_state"
          >
            {SKELETON_KEYS.map((key) => (
              <div key={key} className="space-y-2">
                <Skeleton className="aspect-[3/4] w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-24" data-ocid="browse.empty_state">
            <div className="text-6xl mb-4">🃏</div>
            <h3 className="font-display text-xl font-bold text-foreground">
              No cards listed yet
            </h3>
            <p className="text-muted-foreground mt-2">
              Be the first to list a card!
            </p>
            <Link to="/create-listing">
              <Button
                className="mt-4 bg-pokemon-red hover:bg-primary/90 text-primary-foreground"
                data-ocid="browse.primary_button"
              >
                List a Card
              </Button>
            </Link>
          </div>
        ) : (
          <div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
            data-ocid="browse.list"
          >
            {listings.map((listing, i) => (
              <ListingCard key={listing.id} listing={listing} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
