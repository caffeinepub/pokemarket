import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { Search, SlidersHorizontal, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { CardCondition, CardRarity } from "../backend";
import ListingCard from "../components/ListingCard";
import { useGetAllListings } from "../hooks/useQueries";

const RARITY_OPTIONS = [
  { value: "all", label: "All Rarities" },
  { value: CardRarity.common, label: "Common" },
  { value: CardRarity.uncommon, label: "Uncommon" },
  { value: CardRarity.rare, label: "Rare" },
  { value: CardRarity.holoRare, label: "Holo Rare" },
  { value: CardRarity.ultraRare, label: "Ultra Rare" },
  { value: CardRarity.secretRare, label: "Secret Rare" },
];

const CONDITION_OPTIONS = [
  { value: "all", label: "All Conditions" },
  { value: CardCondition.mint, label: "Mint" },
  { value: CardCondition.nearMint, label: "Near Mint" },
  { value: CardCondition.lightlyPlayed, label: "Lightly Played" },
  { value: CardCondition.moderatelyPlayed, label: "Moderately Played" },
  { value: CardCondition.heavilyPlayed, label: "Heavily Played" },
  { value: CardCondition.damaged, label: "Damaged" },
];

const SKELETON_KEYS = [
  "s1",
  "s2",
  "s3",
  "s4",
  "s5",
  "s6",
  "s7",
  "s8",
  "s9",
  "s10",
  "s11",
  "s12",
];

export default function BrowsePage() {
  const { data: listings = [], isLoading } = useGetAllListings();
  const [search, setSearch] = useState("");
  const [setFilter, setSetFilter] = useState("");
  const [rarityFilter, setRarityFilter] = useState("all");
  const [conditionFilter, setConditionFilter] = useState("all");

  const filtered = useMemo(() => {
    return listings.filter((l) => {
      if (
        search &&
        !l.cardName.toLowerCase().includes(search.toLowerCase()) &&
        !l.setName.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      if (
        setFilter &&
        !l.setName.toLowerCase().includes(setFilter.toLowerCase())
      )
        return false;
      if (rarityFilter !== "all" && l.rarity !== rarityFilter) return false;
      if (conditionFilter !== "all" && l.condition !== conditionFilter)
        return false;
      return true;
    });
  }, [listings, search, setFilter, rarityFilter, conditionFilter]);

  const clearFilters = () => {
    setSearch("");
    setSetFilter("");
    setRarityFilter("all");
    setConditionFilter("all");
  };

  const hasFilters =
    search || setFilter || rarityFilter !== "all" || conditionFilter !== "all";

  return (
    <div>
      <div className="relative overflow-hidden">
        <img
          src="/assets/generated/hero-banner.dim_1200x400.jpg"
          alt="PokéMart"
          className="w-full h-48 md:h-64 object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl md:text-5xl font-bold"
          >
            Poké<span className="text-pokemon-red">Mart</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground mt-1"
          >
            Buy &amp; sell authentic Pokémon cards
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Link to="/create-listing">
              <Button
                className="mt-3 bg-pokemon-red hover:bg-primary/90 text-primary-foreground gap-1"
                size="sm"
                data-ocid="browse.primary_button"
              >
                <Zap className="h-4 w-4" /> List Your Cards
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search card name or set..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-input border-border"
              data-ocid="browse.search_input"
            />
          </div>
          <Input
            placeholder="Filter by set..."
            value={setFilter}
            onChange={(e) => setSetFilter(e.target.value)}
            className="md:w-48 bg-input border-border"
            data-ocid="browse.input"
          />
          <Select value={rarityFilter} onValueChange={setRarityFilter}>
            <SelectTrigger
              className="md:w-44 bg-input border-border"
              data-ocid="browse.select"
            >
              <SelectValue placeholder="Rarity" />
            </SelectTrigger>
            <SelectContent>
              {RARITY_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={conditionFilter} onValueChange={setConditionFilter}>
            <SelectTrigger
              className="md:w-44 bg-input border-border"
              data-ocid="browse.select"
            >
              <SelectValue placeholder="Condition" />
            </SelectTrigger>
            <SelectContent>
              {CONDITION_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasFilters && (
            <Button
              variant="outline"
              onClick={clearFilters}
              size="icon"
              className="shrink-0"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          )}
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          {isLoading
            ? "Loading..."
            : `${filtered.length} card${filtered.length !== 1 ? "s" : ""} available`}
        </p>

        {isLoading ? (
          <div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
            data-ocid="browse.loading_state"
          >
            {SKELETON_KEYS.map((key) => (
              <div key={key} className="space-y-2">
                <Skeleton className="aspect-[3/4] w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24" data-ocid="browse.empty_state">
            <div className="text-6xl mb-4">🃏</div>
            <h3 className="font-display text-xl font-bold text-foreground">
              No cards found
            </h3>
            <p className="text-muted-foreground mt-2">
              Try adjusting your filters or be the first to list!
            </p>
            <Link to="/create-listing">
              <Button
                className="mt-4 bg-pokemon-red hover:bg-primary/90 text-primary-foreground"
                data-ocid="browse.primary_button"
              >
                List a Card
              </Button>
            </Link>
          </div>
        ) : (
          <div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
            data-ocid="browse.list"
          >
            {filtered.map((listing, i) => (
              <ListingCard key={listing.id} listing={listing} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
