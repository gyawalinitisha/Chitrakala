import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { GalleryProvider } from './context/GalleryContext';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import ArtistProfile from './pages/ArtistProfile';
import Auth from './pages/Auth';
import ArtworkDetails from './pages/ArtworkDetails';
import Cart from './pages/Cart';

import ArtistDashboard from './pages/artist/ArtistDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
    return (
        <AuthProvider>
            <GalleryProvider>
                <CartProvider>
                    <Router>
                        <Layout>
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/gallery" element={<Gallery />} />
                                <Route path="/artist/:id" element={<ArtistProfile />} />
                                <Route path="/artwork/:id" element={<ArtworkDetails />} />
                                <Route path="/auth" element={<Auth />} />
                                <Route path="/cart" element={<Cart />} />
                                <Route path="/artist-dashboard" element={<ArtistDashboard />} />
                                <Route path="/admin" element={<AdminDashboard />} />
                            </Routes>
                        </Layout>
                    </Router>
                </CartProvider>
            </GalleryProvider>
        </AuthProvider>
    );
}

export default App;
