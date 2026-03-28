import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DollarSign, Loader2, Settings, ShoppingBag } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { OrderStatus } from "../backend";
import {
  useGetAllOrders,
  useGetPlatformBalance,
  useIsCallerAdmin,
  useIsStripeConfigured,
  useSetStripeConfiguration,
} from "../hooks/useQueries";

export default function AdminDashboardPage() {
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: orders = [], isLoading: ordersLoading } = useGetAllOrders();
  const { data: balance } = useGetPlatformBalance();
  const { data: stripeConfigured } = useIsStripeConfigured();
  const setStripeConfig = useSetStripeConfiguration();

  const [secretKey, setSecretKey] = useState("");
  const [countries, setCountries] = useState("US,CA,GB,AU");

  if (adminLoading) {
    return (
      <div
        className="container mx-auto px-4 py-8"
        data-ocid="admin.loading_state"
      >
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-3 gap-4">
          {["a", "b", "c"].map((k) => (
            <Skeleton key={k} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div
        className="container mx-auto px-4 py-16 text-center"
        data-ocid="admin.error_state"
      >
        <h2 className="font-display text-2xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground mt-2">
          You don't have admin privileges.
        </p>
      </div>
    );
  }

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.amount), 0);

  const handleSaveStripe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretKey.trim()) {
      toast.error("Please enter a Stripe secret key");
      return;
    }
    try {
      const allowedCountries = countries
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
      await setStripeConfig.mutateAsync({
        secretKey: secretKey.trim(),
        allowedCountries,
      });
      toast.success("Stripe configured successfully!");
      setSecretKey("");
    } catch (e: any) {
      toast.error(e.message || "Failed to configure Stripe");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-3xl font-bold mb-6">
          Admin Dashboard
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="bg-card border-border" data-ocid="admin.card">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <DollarSign className="h-5 w-5 text-pokemon-yellow" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Platform Fees</p>
                  <p className="font-display text-2xl font-bold text-pokemon-yellow">
                    $
                    {balance !== undefined
                      ? (Number(balance) / 100).toFixed(2)
                      : "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border" data-ocid="admin.card">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <ShoppingBag className="h-5 w-5 text-pokemon-red" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="font-display text-2xl font-bold">
                    {orders.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border" data-ocid="admin.card">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <ShoppingBag className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="font-display text-2xl font-bold">
                    ${(totalRevenue / 100).toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {!stripeConfigured && (
          <Card className="bg-card border-border mb-8" data-ocid="admin.card">
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configure Stripe Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveStripe} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="secretKey">Stripe Secret Key</Label>
                  <Input
                    id="secretKey"
                    type="password"
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    placeholder="sk_live_..."
                    className="bg-input border-border"
                    data-ocid="admin.input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="countries">
                    Allowed Countries (comma-separated)
                  </Label>
                  <Input
                    id="countries"
                    value={countries}
                    onChange={(e) => setCountries(e.target.value)}
                    placeholder="US,CA,GB"
                    className="bg-input border-border"
                    data-ocid="admin.input"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={setStripeConfig.isPending}
                  className="bg-pokemon-red hover:bg-primary/90 text-primary-foreground"
                  data-ocid="admin.submit_button"
                >
                  {setStripeConfig.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    "Save Stripe Configuration"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {stripeConfigured && (
          <Card className="bg-card border-border mb-8" data-ocid="admin.card">
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Stripe Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Badge className="bg-green-700 text-white">Active</Badge>
                <span className="text-sm text-muted-foreground">
                  Stripe payments are configured and active.
                </span>
              </div>
              <form
                onSubmit={handleSaveStripe}
                className="space-y-4 max-w-md mt-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="secretKey2">Update Stripe Secret Key</Label>
                  <Input
                    id="secretKey2"
                    type="password"
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    placeholder="sk_live_..."
                    className="bg-input border-border"
                    data-ocid="admin.input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="countries2">Allowed Countries</Label>
                  <Input
                    id="countries2"
                    value={countries}
                    onChange={(e) => setCountries(e.target.value)}
                    placeholder="US,CA,GB"
                    className="bg-input border-border"
                    data-ocid="admin.input"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={setStripeConfig.isPending}
                  variant="outline"
                  data-ocid="admin.submit_button"
                >
                  {setStripeConfig.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Update Configuration"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="font-display">
              All Orders ({orders.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {ordersLoading ? (
              <div className="p-6" data-ocid="admin.loading_state">
                <Skeleton className="h-48 w-full" />
              </div>
            ) : orders.length === 0 ? (
              <div
                className="text-center py-12 text-muted-foreground"
                data-ocid="admin.empty_state"
              >
                No orders yet.
              </div>
            ) : (
              <div className="overflow-x-auto" data-ocid="admin.table">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead>Order ID</TableHead>
                      <TableHead>Listing</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Fee (3%)</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order, i) => (
                      <TableRow
                        key={order.id}
                        className="border-border"
                        data-ocid={`admin.row.${i + 1}`}
                      >
                        <TableCell className="font-mono text-xs">
                          {order.id.slice(0, 12)}...
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {order.listingId.slice(0, 12)}...
                        </TableCell>
                        <TableCell className="font-display font-bold text-pokemon-yellow">
                          ${(Number(order.amount) / 100).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          ${(Number(order.platformFee) / 100).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              order.status === OrderStatus.completed
                                ? "bg-green-700 text-white"
                                : "bg-muted text-muted-foreground"
                            }
                          >
                            {order.status === OrderStatus.completed
                              ? "Completed"
                              : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {new Date(
                            Number(order.createdAt) / 1_000_000,
                          ).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
