import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useGetCallerUserProfile,
  useSaveCallerUserProfile,
} from "../hooks/useQueries";

export default function ProfileSetupModal() {
  const { data: profile, isLoading, isFetched } = useGetCallerUserProfile();
  const { mutateAsync: saveProfile, isPending } = useSaveCallerUserProfile();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const showModal = !isLoading && isFetched && profile === null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await saveProfile({
        name: name.trim(),
        email: email.trim() || undefined,
      });
      toast.success("Welcome to PokéMart!");
    } catch {
      toast.error("Failed to save profile");
    }
  };

  return (
    <Dialog open={showModal}>
      <DialogContent className="sm:max-w-md" data-ocid="profile_setup.dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            Welcome to Poké<span className="text-pokemon-red">Mart</span>!
          </DialogTitle>
          <DialogDescription>
            Choose a display name to get started trading cards.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="display-name">Display Name</Label>
            <Input
              id="display-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="TrainerAsh99"
              className="bg-input border-border"
              data-ocid="profile_setup.input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="setup-email">
              Contact Email{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Input
              id="setup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="trainer@example.com"
              className="bg-input border-border"
              data-ocid="profile_setup.textarea"
            />
            <p className="text-xs text-muted-foreground">
              Shown to buyers on your listings so they can contact you
            </p>
          </div>
          <Button
            type="submit"
            disabled={!name.trim() || isPending}
            className="w-full bg-pokemon-red hover:bg-primary/90 text-primary-foreground"
            data-ocid="profile_setup.submit_button"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              "Start Trading!"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
