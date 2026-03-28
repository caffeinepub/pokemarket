import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { XCircle } from "lucide-react";
import { motion } from "motion/react";

export default function PaymentFailurePage() {
  return (
    <div className="container mx-auto px-4 py-16 text-center max-w-md">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        data-ocid="payment_failure.error_state"
      >
        <XCircle className="h-20 w-20 text-destructive mx-auto mb-6" />
        <h1 className="font-display text-3xl font-bold">Payment Cancelled</h1>
        <p className="text-muted-foreground mt-2">
          Your payment was cancelled. No charges were made.
        </p>
        <div className="flex flex-col gap-3 mt-8">
          <Link to="/">
            <Button
              className="w-full bg-pokemon-red hover:bg-primary/90 text-primary-foreground"
              data-ocid="payment_failure.primary_button"
            >
              Back to Marketplace
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
