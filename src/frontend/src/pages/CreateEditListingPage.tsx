import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useParams, useRouter } from "@tanstack/react-router";
import { ImageIcon, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { CardCondition, CardRarity, ExternalBlob } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCreateListing,
  useGetListing,
  useUpdateListing,
} from "../hooks/useQueries";

interface CreateEditListingPageProps {
  mode: "create" | "edit";
}

export default function CreateEditListingPage({
  mode,
}: CreateEditListingPageProps) {
  const router = useRouter();
  const { identity } = useInternetIdentity();
  const editParams = useParams({ strict: false }) as { id?: string };
  const editId = mode === "edit" ? (editParams.id ?? "") : "";
  const { data: existingListing } = useGetListing(editId);

  const createListing = useCreateListing();
  const updateListing = useUpdateListing();

  const [cardName, setCardName] = useState(existingListing?.cardName || "");
  const [setName, setSetName] = useState(existingListing?.setName || "");
  const [rarity, setRarity] = useState<CardRarity>(
    existingListing?.rarity || CardRarity.common,
  );
  const [condition, setCondition] = useState<CardCondition>(
    existingListing?.condition || CardCondition.nearMint,
  );
  const [price, setPrice] = useState(
    existingListing ? String(Number(existingListing.price) / 100) : "",
  );
  const [description, setDescription] = useState(
    existingListing?.description || "",
  );
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>(
    existingListing?.photoUrl?.getDirectURL?.() || "",
  );
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="font-display text-2xl font-bold">
          Please log in to list cards
        </h2>
      </div>
    );
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardName || !setName || !price) {
      toast.error("Please fill in all required fields");
      return;
    }
    const priceNum = Number.parseFloat(price);
    if (Number.isNaN(priceNum) || priceNum <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    setIsSubmitting(true);
    try {
      let photoBlob: ExternalBlob;
      if (photoFile) {
        const bytes = new Uint8Array(await photoFile.arrayBuffer());
        photoBlob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) =>
          setUploadProgress(pct),
        );
      } else if (existingListing?.photoUrl) {
        photoBlob = existingListing.photoUrl;
      } else {
        photoBlob = ExternalBlob.fromURL("");
      }

      const priceInCents = BigInt(Math.round(priceNum * 100));

      if (mode === "create") {
        await createListing.mutateAsync({
          id: crypto.randomUUID(),
          cardName,
          setName,
          rarity,
          condition,
          price: priceInCents,
          description,
          photoUrl: photoBlob,
          sellerId: identity.getPrincipal(),
          createdAt: BigInt(Date.now()) * BigInt(1_000_000),
        });
        toast.success("Listing created!");
        router.navigate({ to: "/my-listings" });
      } else {
        if (!existingListing) return;
        await updateListing.mutateAsync({
          ...existingListing,
          cardName,
          setName,
          rarity,
          condition,
          price: priceInCents,
          description,
          photoUrl: photoBlob,
        });
        toast.success("Listing updated!");
        router.navigate({ to: "/my-listings" });
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to save listing");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-3xl font-bold mb-6">
          {mode === "create" ? "List a Card" : "Edit Listing"}
        </h1>
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="font-display text-xl">Card Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Photo Upload */}
              <div className="space-y-2">
                <Label>Card Photo</Label>
                <button
                  type="button"
                  className="w-full border-2 border-dashed border-border rounded-xl p-4 cursor-pointer hover:border-pokemon-yellow transition-colors text-left"
                  onClick={() => fileInputRef.current?.click()}
                  data-ocid="listing_form.dropzone"
                >
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="max-h-48 mx-auto object-contain rounded"
                    />
                  ) : (
                    <div className="flex flex-col items-center py-4 text-muted-foreground">
                      <ImageIcon className="h-10 w-10 mb-2" />
                      <p className="text-sm">Click to upload card photo</p>
                    </div>
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                  data-ocid="listing_form.upload_button"
                />
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="text-sm text-muted-foreground">
                    Uploading: {uploadProgress}%
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cardName">Card Name *</Label>
                  <Input
                    id="cardName"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="Charizard"
                    className="bg-input border-border"
                    required
                    data-ocid="listing_form.input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="setName">Set Name *</Label>
                  <Input
                    id="setName"
                    value={setName}
                    onChange={(e) => setSetName(e.target.value)}
                    placeholder="Base Set"
                    className="bg-input border-border"
                    required
                    data-ocid="listing_form.input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Rarity *</Label>
                  <Select
                    value={rarity}
                    onValueChange={(v) => setRarity(v as CardRarity)}
                  >
                    <SelectTrigger
                      className="bg-input border-border"
                      data-ocid="listing_form.select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={CardRarity.common}>Common</SelectItem>
                      <SelectItem value={CardRarity.uncommon}>
                        Uncommon
                      </SelectItem>
                      <SelectItem value={CardRarity.rare}>Rare</SelectItem>
                      <SelectItem value={CardRarity.holoRare}>
                        Holo Rare
                      </SelectItem>
                      <SelectItem value={CardRarity.ultraRare}>
                        Ultra Rare
                      </SelectItem>
                      <SelectItem value={CardRarity.secretRare}>
                        Secret Rare
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Condition *</Label>
                  <Select
                    value={condition}
                    onValueChange={(v) => setCondition(v as CardCondition)}
                  >
                    <SelectTrigger
                      className="bg-input border-border"
                      data-ocid="listing_form.select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={CardCondition.mint}>Mint</SelectItem>
                      <SelectItem value={CardCondition.nearMint}>
                        Near Mint
                      </SelectItem>
                      <SelectItem value={CardCondition.lightlyPlayed}>
                        Lightly Played
                      </SelectItem>
                      <SelectItem value={CardCondition.moderatelyPlayed}>
                        Moderately Played
                      </SelectItem>
                      <SelectItem value={CardCondition.heavilyPlayed}>
                        Heavily Played
                      </SelectItem>
                      <SelectItem value={CardCondition.damaged}>
                        Damaged
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (USD) *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="price"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="9.99"
                    className="pl-7 bg-input border-border"
                    required
                    data-ocid="listing_form.input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the card's condition, history, or any notable details..."
                  rows={3}
                  className="bg-input border-border resize-none"
                  data-ocid="listing_form.textarea"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() =>
                    router.navigate({
                      to: mode === "edit" ? "/my-listings" : "/",
                    })
                  }
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-pokemon-red hover:bg-primary/90 text-primary-foreground"
                  data-ocid="listing_form.submit_button"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      {uploadProgress > 0
                        ? `Uploading ${uploadProgress}%`
                        : "Saving..."}
                    </>
                  ) : mode === "create" ? (
                    "List Card"
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
