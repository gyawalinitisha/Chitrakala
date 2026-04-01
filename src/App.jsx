import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';

import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { GalleryProvider } from "./context/GalleryContext";
import { ChatProvider } from "./context/ChatContext";
import ChatWindow from "./components/chat/ChatWindow";

import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import Gallery from "./pages/Gallery";
import Artists from "./pages/Artists";
import ArtistProfile from "./pages/ArtistProfile";
import Auth from "./pages/Auth";
import ArtworkDetails from "./pages/ArtworkDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Inbox from './pages/Inbox';

import ArtistDashboard from "./pages/artist/ArtistDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminRoute from "./components/AdminRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import CollectorRoute from "./components/CollectorRoute";
import UserProfile from "./pages/UserProfile";
import Settings from "./pages/Settings";

// Fallback Client ID if none provided in .env
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
      <ChatProvider>
        <GalleryProvider>
          <CartProvider>
            <Router>
              <Layout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/gallery" element={<Gallery />} />
                  <Route path="/artists" element={<Artists />} />
                  <Route path="/artist/:id" element={<ArtistProfile />} />
                  <Route path="/artwork/:id" element={<ArtworkDetails />} />
                  <Route path="/auth" element={<Auth />} />
                  {/* Collector-only routes (artists/admins are redirected) */}
                  <Route element={<CollectorRoute />}>
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                  </Route>

                  {/* Protected User Routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/inbox" element={<Inbox />} />
                    <Route path="/profile" element={<UserProfile />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/artist-dashboard" element={<ArtistDashboard />} />
                  </Route>

                  {/* Admin Protected Route */}
                  <Route element={<AdminRoute />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                  </Route>
                </Routes>

                <ChatWindow />
              </Layout>
            </Router>
          </CartProvider>
        </GalleryProvider>
      </ChatProvider>
    </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
