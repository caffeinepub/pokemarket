import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, User } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetCallerUserProfile,
  useSaveCallerUserProfile,
} from "../hooks/useQueries";

export default function ProfilePage() {
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (profile?.name) setName(profile.name);
    if (profile?.email) setEmail(profile.email);
  }, [profile?.name, profile?.email]);

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="font-display text-2xl font-bold">
          Please log in to view your profile
        </h2>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await saveProfile.mutateAsync({
        name: name.trim(),
        email: email.trim() || undefined,
      });
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to update profile");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-3xl font-bold mb-6">Profile</h1>
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <User className="h-6 w-6 text-muted-foreground" />
              </div>
              <CardTitle className="font-display">
                {profile?.name || "Trainer"}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="TrainerAsh99"
                  className="bg-input border-border"
                  disabled={isLoading}
                  data-ocid="profile.input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">
                  Contact Email{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="trainer@example.com"
                  className="bg-input border-border"
                  disabled={isLoading}
                  data-ocid="profile.textarea"
                />
                <p className="text-xs text-muted-foreground">
                  This email will be shown to buyers on your listings
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">
                  Principal ID
                </Label>
                <p className="font-mono text-xs text-muted-foreground break-all">
                  {identity.getPrincipal().toString()}
                </p>
              </div>
              <Button
                type="submit"
                disabled={saveProfile.isPending || !name.trim()}
                className="w-full bg-pokemon-red hover:bg-primary/90 text-primary-foreground"
                data-ocid="profile.submit_button"
              >
                {saveProfile.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save Profile"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
