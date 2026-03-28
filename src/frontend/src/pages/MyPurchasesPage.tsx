import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "motion/react";
import { OrderStatus } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetBuyerOrders } from "../hooks/useQueries";

export default function MyPurchasesPage() {
  const { identity } = useInternetIdentity();
  const { data: orders = [], isLoading } = useGetBuyerOrders();

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="font-display text-2xl font-bold">
          Please log in to view your purchases
        </h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="font-display text-3xl font-bold mb-6">My Purchases</h1>

      {isLoading ? (
        <div className="space-y-3" data-ocid="purchases.loading_state">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-24" data-ocid="purchases.empty_state">
          <div className="text-6xl mb-4">🛍️</div>
          <h3 className="font-display text-xl font-bold">No purchases yet</h3>
          <p className="text-muted-foreground mt-2">
            Browse the marketplace to find your next card!
          </p>
        </div>
      ) : (
        <div className="space-y-3" data-ocid="purchases.list">
          {orders.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              data-ocid={`purchases.item.${i + 1}`}
            >
              <Card className="bg-card border-border">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Order ID</p>
                    <p className="font-mono text-xs text-foreground">
                      {order.id.slice(0, 16)}...
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(
                        Number(order.createdAt) / 1_000_000,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-display font-bold text-pokemon-yellow text-lg">
                      ${(Number(order.amount) / 100).toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Fee: ${(Number(order.platformFee) / 100).toFixed(2)}
                    </p>
                    <Badge
                      className={`mt-1 text-xs ${
                        order.status === OrderStatus.completed
                          ? "bg-green-700 text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {order.status === OrderStatus.completed
                        ? "Completed"
                        : "Pending"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
