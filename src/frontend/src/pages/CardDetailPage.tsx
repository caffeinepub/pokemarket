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
import { Skeleton } from "@/components/ui/skeleton";
import { useParams, useRouter } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  Edit2,
  Loader2,
  Mail,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import type { ShoppingItem } from "../backend";
import RarityBadge, { RARITY_LABELS } from "../components/RarityBadge";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCreateCheckoutSession,
  useDeleteListing,
  useGetListing,
  useGetSellerEmail,
  useIsStripeConfigured,
} from "../hooks/useQueries";

const CONDITION_LABELS: Record<string, string> = {
  mint: "Mint",
  nearMint: "Near Mint",
  lightlyPlayed: "Lightly Played",
  moderatelyPlayed: "Moderately Played",
  heavilyPlayed: "Heavily Played",
  damaged: "Damaged",
};

export default function CardDetailPage() {
  const params = useParams({ from: "/card/$id" });
  const router = useRouter();
  const { identity } = useInternetIdentity();
  const { data: listing, isLoading } = useGetListing(params.id);
  const deleteListing = useDeleteListing();
  const createCheckout = useCreateCheckoutSession();
  const { data: stripeConfigured } = useIsStripeConfigured();

  const isOwner =
    identity &&
    listing &&
    listing.sellerId.toString() === identity.getPrincipal().toString();

  const { data: sellerEmail } = useGetSellerEmail(
    !isOwner && listing ? listing.sellerId : undefined,
  );

  const priceUsd = listing ? (Number(listing.price) / 100).toFixed(2) : "0.00";
  const photoUrl = listing?.photoUrl?.getDirectURL?.();

  const handleDelete = async () => {
    if (!listing) return;
    try {
      await deleteListing.mutateAsync(listing.id);
      toast.success("Listing deleted");
      router.navigate({ to: "/my-listings" });
    } catch {
      toast.error("Failed to delete listing");
    }
  };

  const handleBuyNow = async () => {
    if (!listing) return;
    if (!identity) {
      toast.error("Please log in to purchase");
      return;
    }
    try {
      const item: ShoppingItem = {
        productName: listing.cardName,
        currency: "usd",
        quantity: BigInt(1),
        priceInCents: listing.price,
        productDescription: `${listing.setName} - ${CONDITION_LABELS[listing.condition]} - ${RARITY_LABELS[listing.rarity]}`,
      };
      const session = await createCheckout.mutateAsync([item]);
      window.location.href = session.url;
    } catch (e: any) {
      toast.error(e.message || "Failed to start checkout");
    }
  };

  if (isLoading) {
    return (
      <div
        className="container mx-auto px-4 py-8 max-w-4xl"
        data-ocid="card_detail.loading_state"
      >
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="aspect-[3/4] w-full rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div
        className="container mx-auto px-4 py-16 text-center"
        data-ocid="card_detail.error_state"
      >
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="font-display text-2xl font-bold">Card not found</h2>
        <Link to="/">
          <Button variant="outline" className="mt-4">
            Back to Browse
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        data-ocid="card_detail.link"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Browse
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid md:grid-cols-2 gap-8"
      >
        {/* Card Image */}
        <div className="relative">
          <div className="aspect-[3/4] rounded-xl overflow-hidden bg-muted border border-border">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={listing.cardName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-8xl opacity-20">🃏</div>
              </div>
            )}
          </div>
        </div>

        {/* Card Info */}
        <div className="flex flex-col">
          <div className="flex items-start gap-2 flex-wrap mb-2">
            <RarityBadge rarity={listing.rarity} size="md" />
            <Badge
              variant="outline"
              className="border-border text-muted-foreground"
            >
              {CONDITION_LABELS[listing.condition]}
            </Badge>
          </div>

          <h1 className="font-display text-3xl font-bold text-foreground">
            {listing.cardName}
          </h1>
          <p className="text-muted-foreground mt-1">{listing.setName}</p>

          {listing.description && (
            <p className="text-foreground/80 mt-4 leading-relaxed">
              {listing.description}
            </p>
          )}

          <div className="mt-auto pt-6">
            <div className="text-4xl font-display font-bold text-pokemon-yellow mb-4">
              ${priceUsd}
            </div>

            {isOwner ? (
              <div className="flex gap-3">
                <Link
                  to="/edit-listing/$id"
                  params={{ id: listing.id }}
                  className="flex-1"
                >
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    data-ocid="card_detail.edit_button"
                  >
                    <Edit2 className="h-4 w-4" /> Edit Listing
                  </Button>
                </Link>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="gap-2"
                      data-ocid="card_detail.delete_button"
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent data-ocid="card_detail.dialog">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this listing?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel data-ocid="card_detail.cancel_button">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        data-ocid="card_detail.confirm_button"
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
            ) : (
              <div className="space-y-3">
                {stripeConfigured === false && (
                  <div
                    className="flex items-center gap-2 text-sm text-muted-foreground bg-muted rounded-lg p-3"
                    data-ocid="card_detail.error_state"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    Stripe payments are not configured yet.
                  </div>
                )}
                <Button
                  onClick={handleBuyNow}
                  disabled={
                    createCheckout.isPending ||
                    !identity ||
                    stripeConfigured === false
                  }
                  className="w-full bg-pokemon-red hover:bg-primary/90 text-primary-foreground gap-2 h-12 text-lg"
                  data-ocid="card_detail.primary_button"
                >
                  {createCheckout.isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5" /> Buy Now
                    </>
                  )}
                </Button>
                {!identity && (
                  <p className="text-sm text-center text-muted-foreground">
                    Please log in to purchase
                  </p>
                )}
                {sellerEmail && (
                  <a
                    href={`mailto:${sellerEmail}`}
                    className="flex items-center gap-2 w-full justify-center rounded-lg border border-border px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                    data-ocid="card_detail.secondary_button"
                  >
                    <Mail className="h-4 w-4 shrink-0" />
                    {sellerEmail}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
