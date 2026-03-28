import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useRouter } from "@tanstack/react-router";
import { Edit2, Loader2, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import RarityBadge from "../components/RarityBadge";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useDeleteListing, useGetSellerListings } from "../hooks/useQueries";

const CONDITION_LABELS: Record<string, string> = {
  mint: "Mint",
  nearMint: "Near Mint",
  lightlyPlayed: "Lightly Played",
  moderatelyPlayed: "Moderately Played",
  heavilyPlayed: "Heavily Played",
  damaged: "Damaged",
};

export default function MyListingsPage() {
  const { identity } = useInternetIdentity();
  const router = useRouter();
  const { data: listings = [], isLoading } = useGetSellerListings();
  const deleteListing = useDeleteListing();

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="font-display text-2xl font-bold">
          Please log in to view your listings
        </h2>
      </div>
    );
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteListing.mutateAsync(id);
      toast.success("Listing deleted");
    } catch {
      toast.error("Failed to delete listing");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-bold">My Listings</h1>
        <Link to="/create-listing">
          <Button
            className="bg-pokemon-red hover:bg-primary/90 text-primary-foreground gap-2"
            data-ocid="my_listings.primary_button"
          >
            <Plus className="h-4 w-4" /> List a Card
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3" data-ocid="my_listings.loading_state">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-24" data-ocid="my_listings.empty_state">
          <div className="text-6xl mb-4">🃏</div>
          <h3 className="font-display text-xl font-bold">No listings yet</h3>
          <p className="text-muted-foreground mt-2">
            Start selling your Pokémon cards!
          </p>
          <Link to="/create-listing">
            <Button
              className="mt-4 bg-pokemon-red hover:bg-primary/90 text-primary-foreground"
              data-ocid="my_listings.primary_button"
            >
              List Your First Card
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3" data-ocid="my_listings.list">
          {listings.map((listing, i) => {
            const photoUrl = listing.photoUrl?.getDirectURL?.();
            const priceUsd = (Number(listing.price) / 100).toFixed(2);
            return (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                data-ocid={`my_listings.item.${i + 1}`}
              >
                <Card className="bg-card border-border hover:border-muted-foreground transition-colors">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="h-16 w-12 rounded-lg overflow-hidden bg-muted shrink-0">
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt={listing.cardName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">
                          🃏
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-bold truncate">
                        {listing.cardName}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {listing.setName}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <RarityBadge rarity={listing.rarity} />
                        <Badge
                          variant="outline"
                          className="text-xs border-border text-muted-foreground"
                        >
                          {CONDITION_LABELS[listing.condition]}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-display font-bold text-pokemon-yellow">
                        ${priceUsd}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.navigate({
                              to: "/edit-listing/$id",
                              params: { id: listing.id },
                            })
                          }
                          className="gap-1"
                          data-ocid={`my_listings.edit_button.${i + 1}`}
                        >
                          <Edit2 className="h-3 w-3" /> Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              data-ocid={`my_listings.delete_button.${i + 1}`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent data-ocid="my_listings.dialog">
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete listing?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently remove "{listing.cardName}
                                " from the marketplace.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel data-ocid="my_listings.cancel_button">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(listing.id)}
                                className="bg-destructive text-destructive-foreground"
                                data-ocid="my_listings.confirm_button"
                              >
                                {deleteListing.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  "Delete"
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
