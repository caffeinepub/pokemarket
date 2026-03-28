import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import AccessControl "authorization/access-control";
import Stripe "stripe/stripe";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import OutCall "http-outcalls/outcall";

actor {
  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // Types
  type ListingId = Text;
  type OrderId = Text;
  type CardRarity = {
    #common;
    #uncommon;
    #rare;
    #holoRare;
    #ultraRare;
    #secretRare;
  };
  type CardCondition = {
    #mint;
    #nearMint;
    #lightlyPlayed;
    #moderatelyPlayed;
    #heavilyPlayed;
    #damaged;
  };
  type OrderStatus = { #pending; #completed };

  public type UserProfile = {
    name : Text;
  };

  public type Listing = {
    id : ListingId;
    cardName : Text;
    setName : Text;
    rarity : CardRarity;
    condition : CardCondition;
    price : Nat;
    description : Text;
    photoUrl : Storage.ExternalBlob;
    sellerId : Principal;
    createdAt : Time.Time;
  };

  public type Order = {
    id : OrderId;
    listingId : ListingId;
    buyerId : Principal;
    sellerId : Principal;
    amount : Nat;
    platformFee : Nat;
    stripeSessionId : Text;
    status : OrderStatus;
    createdAt : Time.Time;
  };

  // Persistent state
  let listings = Map.empty<ListingId, Listing>();
  let orders = Map.empty<OrderId, Order>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  var nextListingId = 1;
  var nextOrderId = 1;
  var platformBalance = 0;
  let listingsPerPage = 20;
  let ordersPerPage = 20;
  var stripeConfig : ?Stripe.StripeConfiguration = null;

  // Helper functions
  func generateId(prefix : Text, nextId : Nat) : Text {
    prefix # nextId.toText();
  };

  func getListingInternal(listingId : ListingId) : Listing {
    switch (listings.get(listingId)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?listing) { listing };
    };
  };

  func getOrderInternal(orderId : OrderId) : Order {
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) { order };
    };
  };

  func filterListingsBySeller(sellerId : Principal) : [Listing] {
    listings.values().toArray().filter(func(listing) { listing.sellerId == sellerId });
  };

  func filterOrdersByBuyer(buyerId : Principal) : [Order] {
    orders.values().toArray().filter(func(order) { order.buyerId == buyerId });
  };

  func filterListings(cardName : Text, setName : Text, rarity : CardRarity, condition : CardCondition) : [Listing] {
    listings.values().toArray().filter(
      func(listing) {
        (cardName == "" or listing.cardName.contains(#text cardName)) and
        (setName == "" or listing.setName.contains(#text setName)) and
        ((rarity == #common) or (listing.rarity == rarity)) and
        ((condition == #mint) or (listing.condition == condition));
      }
    );
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Stripe Integration
  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    stripeConfig := ?config;
  };

  public query func isStripeConfigured() : async Bool {
    switch (stripeConfig) {
      case (null) { false };
      case (_) { true };
    };
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create checkout sessions");
    };
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  // Listing Management
  /// Returns newly created listing id
  public shared ({ caller }) func createListing(listing : Listing) : async ListingId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create listings");
    };

    let id = generateId("listing-", nextListingId);
    nextListingId += 1;

    let newListing : Listing = {
      listing with
      id;
      sellerId = caller;
      createdAt = Time.now();
    };
    listings.add(id, newListing);
    id;
  };

  /// Returns the existing listing
  public shared ({ caller }) func updateListing(listing : Listing) : async Listing {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update listings");
    };

    let existing = getListingInternal(listing.id);
    if (existing.sellerId != caller) {
      Runtime.trap("Unauthorized: Only the seller can update this listing");
    };
    let updatedListing : Listing = {
      existing with
      createdAt = Time.now();
    };
    listings.add(listing.id, updatedListing);
    updatedListing;
  };

  public shared ({ caller }) func deleteListing(listingId : ListingId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete listings");
    };

    let existing = getListingInternal(listingId);
    if (existing.sellerId != caller) {
      Runtime.trap("Unauthorized: Only the seller can delete this listing");
    };
    listings.remove(listingId);
  };

  public query ({ caller }) func getListing(listingId : ListingId) : async Listing {
    getListingInternal(listingId);
  };

  public query ({ caller }) func getAllListings() : async [Listing] {
    listings.values().toArray();
  };

  public query ({ caller }) func searchListings(cardName : Text, setName : Text, rarity : CardRarity, condition : CardCondition) : async [Listing] {
    filterListings(cardName, setName, rarity, condition);
  };

  public query ({ caller }) func getSellerListings(sellerId : Principal) : async [Listing] {
    if (caller != sellerId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own listings");
    };
    filterListingsBySeller(sellerId);
  };

  // Order Management
  public shared ({ caller }) func createOrder(listingId : ListingId, stripeSessionId : Text) : async OrderId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create orders");
    };

    let listing = getListingInternal(listingId);

    let orderId = generateId("order-", nextOrderId);
    nextOrderId += 1;

    let platformFee = listing.price * 3 / 100;

    let newOrder : Order = {
      id = orderId;
      listingId;
      buyerId = caller;
      sellerId = listing.sellerId;
      amount = listing.price;
      platformFee;
      stripeSessionId;
      status = #pending;
      createdAt = Time.now();
    };
    orders.add(orderId, newOrder);
    orderId;
  };

  public shared ({ caller }) func completeOrder(orderId : OrderId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can complete orders");
    };

    let order = getOrderInternal(orderId);
    if (order.buyerId != caller) {
      Runtime.trap("Only the buyer can mark this order as completed");
    };
    let completedOrder : Order = { order with status = #completed };
    orders.add(orderId, completedOrder);
    platformBalance += order.platformFee;
  };

  public query ({ caller }) func getOrder(orderId : OrderId) : async Order {
    let order = getOrderInternal(orderId);
    if (caller != order.buyerId and caller != order.sellerId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own orders");
    };
    order;
  };

  public query ({ caller }) func getSellerOrders(sellerId : Principal) : async [Order] {
    if (caller != sellerId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own orders");
    };
    orders.values().toArray().filter(
      func(order) { order.sellerId == sellerId }
    );
  };

  public query ({ caller }) func getBuyerOrders(buyerId : Principal) : async [Order] {
    if (caller != buyerId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own orders");
    };
    filterOrdersByBuyer(buyerId);
  };

  // Admin Functions
  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    orders.values().toArray();
  };

  public query ({ caller }) func getPlatformBalance() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view platform balance");
    };
    platformBalance;
  };
};
