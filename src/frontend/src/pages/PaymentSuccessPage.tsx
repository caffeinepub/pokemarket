import { Button } from "@/components/ui/button";
import { Link, useSearch } from "@tanstack/react-router";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useCreateOrder, useGetStripeSessionStatus } from "../hooks/useQueries";

export default function PaymentSuccessPage() {
  const search = useSearch({ strict: false }) as {
    session_id?: string;
    listing_id?: string;
  };
  const sessionId = search.session_id || null;
  const listingId = search.listing_id || null;

  const { data: sessionStatus, isLoading } =
    useGetStripeSessionStatus(sessionId);
  const { mutateAsync: createOrderAsync } = useCreateOrder();
  const orderAttempted = useRef(false);

  useEffect(() => {
    if (!sessionStatus || orderAttempted.current) return;
    if (sessionStatus.__kind__ === "completed" && sessionId) {
      orderAttempted.current = true;
      const lId = listingId || "unknown";
      createOrderAsync({ listingId: lId, stripeSessionId: sessionId })
        .then(() => {
          toast.success("Order confirmed!");
        })
        .catch((e) => {
          console.error("Order creation error:", e);
        });
    }
  }, [sessionStatus, sessionId, listingId, createOrderAsync]);

  return (
    <div className="container mx-auto px-4 py-16 text-center max-w-md">
      {isLoading ? (
        <div data-ocid="payment_success.loading_state">
          <Loader2 className="h-16 w-16 animate-spin text-pokemon-yellow mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold">
            Processing payment...
          </h2>
        </div>
      ) : sessionStatus?.__kind__ === "completed" ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          data-ocid="payment_success.success_state"
        >
          <CheckCircle2 className="h-20 w-20 text-green-500 mx-auto mb-6" />
          <h1 className="font-display text-3xl font-bold text-foreground">
            Payment Successful!
          </h1>
          <p className="text-muted-foreground mt-2">
            Your Pokémon card is on its way. Check your purchases for details.
          </p>
          <div className="flex flex-col gap-3 mt-8">
            <Link to="/my-purchases">
              <Button
                className="w-full bg-pokemon-red hover:bg-primary/90 text-primary-foreground"
                data-ocid="payment_success.primary_button"
              >
                View My Purchases
              </Button>
            </Link>
            <Link to="/">
              <Button
                variant="outline"
                className="w-full"
                data-ocid="payment_success.secondary_button"
              >
                Continue Shopping
              </Button>
            </Link>
          </div>
        </motion.div>
      ) : (
        <div data-ocid="payment_success.error_state">
          <XCircle className="h-20 w-20 text-destructive mx-auto mb-6" />
          <h1 className="font-display text-3xl font-bold">Payment Issue</h1>
          <p className="text-muted-foreground mt-2">
            {sessionStatus?.__kind__ === "failed"
              ? sessionStatus.failed.error
              : "There was an issue processing your payment."}
          </p>
          <Link to="/">
            <Button
              className="mt-8 bg-pokemon-red hover:bg-primary/90 text-primary-foreground"
              data-ocid="payment_success.primary_button"
            >
              Back to Marketplace
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
