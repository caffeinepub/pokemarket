import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import ListingCard from "../components/ListingCard";
import { useFavorites } from "../hooks/useFavorites";
import { useGetAllListings } from "../hooks/useQueries";

export default function FavoritesPage() {
  const { data: listings = [], isLoading } = useGetAllListings();
  const { favorites, isFavorited, toggleFavorite } = useFavorites();

  const favoritedListings = useMemo(
    () => listings.filter((l) => favorites.includes(l.id)),
    [listings, favorites],
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-1">
          <Heart className="h-6 w-6 text-pokemon-red" fill="#e3350d" />
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            My Favorites
          </h1>
        </div>
        <p className="text-muted-foreground">Cards you've saved for later</p>
      </motion.div>

      {isLoading ? (
        <div
          className="text-center py-24 text-muted-foreground"
          data-ocid="favorites.loading_state"
        >
          Loading...
        </div>
      ) : favoritedListings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-24"
          data-ocid="favorites.empty_state"
        >
          <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
          <h3 className="font-display text-xl font-bold text-foreground">
            No favorites yet
          </h3>
          <p className="text-muted-foreground mt-2 max-w-xs mx-auto">
            Browse cards and tap the heart icon to save ones you love.
          </p>
          <Link to="/">
            <Button
              className="mt-6 bg-pokemon-red hover:bg-primary/90 text-primary-foreground"
              data-ocid="favorites.primary_button"
            >
              Browse Cards
            </Button>
          </Link>
        </motion.div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            {favoritedListings.length} saved card
            {favoritedListings.length !== 1 ? "s" : ""}
          </p>
          <div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
            data-ocid="favorites.list"
          >
            {favoritedListings.map((listing, i) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                index={i}
                isFavorited={isFavorited(listing.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
