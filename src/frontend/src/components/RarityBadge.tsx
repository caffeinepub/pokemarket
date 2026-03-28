import type { CardRarity } from "../backend";

const RARITY_LABELS: Record<CardRarity, string> = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  holoRare: "Holo Rare",
  ultraRare: "Ultra Rare",
  secretRare: "Secret Rare",
};

const RARITY_CLASSES: Record<CardRarity, string> = {
  common: "rarity-common",
  uncommon: "rarity-uncommon",
  rare: "rarity-rare",
  holoRare: "rarity-holo-rare",
  ultraRare: "rarity-ultra-rare",
  secretRare: "rarity-secret-rare",
};

interface RarityBadgeProps {
  rarity: CardRarity;
  size?: "sm" | "md";
}

export default function RarityBadge({ rarity, size = "sm" }: RarityBadgeProps) {
  const sizeClass = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1";
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${sizeClass} ${RARITY_CLASSES[rarity]}`}
    >
      {RARITY_LABELS[rarity]}
    </span>
  );
}

export { RARITY_LABELS };
