import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import Navbar from "./components/Navbar";
import ProfileSetupModal from "./components/ProfileSetupModal";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import BrowsePage from "./pages/BrowsePage";
import CardDetailPage from "./pages/CardDetailPage";
import CreateEditListingPage from "./pages/CreateEditListingPage";
import MyListingsPage from "./pages/MyListingsPage";
import MyPurchasesPage from "./pages/MyPurchasesPage";
import PaymentFailurePage from "./pages/PaymentFailurePage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import ProfilePage from "./pages/ProfilePage";

const rootRoute = createRootRoute({
  component: () => {
    const { identity } = useInternetIdentity();
    const isAuthenticated = !!identity;
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        {isAuthenticated && <ProfileSetupModal />}
        <main className="flex-1">
          <Outlet />
        </main>
        <footer className="border-t border-border py-6 mt-12">
          <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
            © {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              className="text-pokemon-yellow hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              caffeine.ai
            </a>
          </div>
        </footer>
        <Toaster />
      </div>
    );
  },
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: BrowsePage,
});

const cardDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/card/$id",
  component: CardDetailPage,
});

const createListingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/create-listing",
  component: () => <CreateEditListingPage mode="create" />,
});

const editListingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/edit-listing/$id",
  component: () => <CreateEditListingPage mode="edit" />,
});

const myListingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/my-listings",
  component: MyListingsPage,
});

const myPurchasesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/my-purchases",
  component: MyPurchasesPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminDashboardPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: ProfilePage,
});

const paymentSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payment-success",
  component: PaymentSuccessPage,
});

const paymentFailureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payment-failure",
  component: PaymentFailurePage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  cardDetailRoute,
  createListingRoute,
  editListingRoute,
  myListingsRoute,
  myPurchasesRoute,
  adminRoute,
  profileRoute,
  paymentSuccessRoute,
  paymentFailureRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
