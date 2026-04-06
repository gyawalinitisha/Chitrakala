import React from 'react';
import Navbar from './Navbar';
import Toast from '../ui/Toast';
// Footer import will go here later
// import Footer from './Footer';

const Layout = ({ children }) => {
    return (
        <div className="app-layout">
            <Navbar />
            <Toast />
            <main className="main-content">
                {children}
            </main>
            <footer style={{ padding: '2rem', textAlign: 'center', borderTop: '1px solid var(--color-border)', marginTop: '4rem' }}>
                <p className="text-muted">© 2026 Digital Art Gallery. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Layout;
