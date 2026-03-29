# PokeMarket

## Current State
UserProfile only stores name. CardDetailPage has no way for buyers to contact the seller.

## Requested Changes (Diff)

### Add
- email optional field to UserProfile in backend
- getSellerEmail query (public, no auth restriction)
- Email input in ProfileSetupModal and ProfilePage
- Seller email shown on CardDetailPage as mailto link

### Modify
- saveCallerUserProfile accepts UserProfile with email
- ProfileSetupModal includes optional email field
- ProfilePage includes optional email field
- CardDetailPage fetches and shows seller email

### Remove
Nothing.

## Implementation Plan
1. Update UserProfile in main.mo to add email: ?Text
2. Add getSellerEmail query
3. Update frontend profile components
4. Show seller email on CardDetailPage
