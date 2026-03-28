# PokeMarket

## Current State
Full Pokémon card marketplace with listings, Stripe payments, user accounts, and admin dashboard. ListingCard component links to card detail pages. No favorites/watchlist feature.

## Requested Changes (Diff)

### Add
- Favorites feature: users can heart/favorite any listing
- Favorites stored in localStorage (no backend changes needed)
- Favorites button on each ListingCard (heart icon, top-right corner of card image)
- A "My Favorites" page accessible from the navbar showing saved cards

### Modify
- ListingCard: add a heart button overlay on card image (top-right), toggles favorite state
- Navbar: add "Favorites" link

### Remove
- Nothing removed

## Implementation Plan
1. Create a `useFavorites` hook that reads/writes to localStorage
2. Update ListingCard to accept optional `isFavorited` and `onToggleFavorite` props, show heart icon overlay
3. Update BrowsePage to pass favorite state/toggle into each ListingCard
4. Create FavoritesPage that reads favorites from localStorage and displays matching listings
5. Add Favorites link to Navbar
6. Add route for /favorites in App.tsx
