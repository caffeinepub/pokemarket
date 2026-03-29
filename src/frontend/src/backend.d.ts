import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type OrderId = string;
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface Listing {
    id: ListingId;
    setName: string;
    cardName: string;
    createdAt: Time;
    description: string;
    photoUrl: ExternalBlob;
    rarity: CardRarity;
    sellerId: Principal;
    price: bigint;
    condition: CardCondition;
}
export interface Order {
    id: OrderId;
    status: OrderStatus;
    platformFee: bigint;
    listingId: ListingId;
    createdAt: Time;
    buyerId: Principal;
    sellerId: Principal;
    stripeSessionId: string;
    amount: bigint;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export type ListingId = string;
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface UserProfile {
    name: string;
    email?: string;
}
export enum CardCondition {
    damaged = "damaged",
    lightlyPlayed = "lightlyPlayed",
    mint = "mint",
    heavilyPlayed = "heavilyPlayed",
    nearMint = "nearMint",
    moderatelyPlayed = "moderatelyPlayed"
}
export enum CardRarity {
    ultraRare = "ultraRare",
    rare = "rare",
    holoRare = "holoRare",
    secretRare = "secretRare",
    common = "common",
    uncommon = "uncommon"
}
export enum OrderStatus {
    pending = "pending",
    completed = "completed"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    completeOrder(orderId: OrderId): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    /**
     * / Returns newly created listing id
     */
    createListing(listing: Listing): Promise<ListingId>;
    createOrder(listingId: ListingId, stripeSessionId: string): Promise<OrderId>;
    deleteListing(listingId: ListingId): Promise<void>;
    getAllListings(): Promise<Array<Listing>>;
    getAllOrders(): Promise<Array<Order>>;
    getBuyerOrders(buyerId: Principal): Promise<Array<Order>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getListing(listingId: ListingId): Promise<Listing>;
    getOrder(orderId: OrderId): Promise<Order>;
    getPlatformBalance(): Promise<bigint>;
    getSellerEmail(sellerId: Principal): Promise<string | null>;
    getSellerListings(sellerId: Principal): Promise<Array<Listing>>;
    getSellerOrders(sellerId: Principal): Promise<Array<Order>>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchListings(cardName: string, setName: string, rarity: CardRarity, condition: CardCondition): Promise<Array<Listing>>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    /**
     * / Returns the existing listing
     */
    updateListing(listing: Listing): Promise<Listing>;
}
