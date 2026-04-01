import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useGallery } from '../../context/GalleryContext';
import { useChat } from '../../context/ChatContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Plus, Pencil, Trash2, Upload, AlertTriangle, X, Tag, Package, MapPin, Phone, User, Bell } from 'lucide-react';
import { API_URL } from '../../config';
import './ArtistDashboard.css';

const ORDER_STATUS_CONFIG = {
    Processing: { label: 'Processing', color: '#b45309', bg: 'rgba(217,119,6,0.1)',  border: 'rgba(217,119,6,0.3)' },
    Shipped:    { label: 'Shipped',    color: '#1d4ed8', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)' },
    Delivered:  { label: 'Delivered',  color: '#059669', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)' },
};

const EMPTY_FORM = {
    title: '',
    price: '',
    category: 'Landscape',
    description: '',
    image: '',
    widthCm: '',
    heightCm: '',
};

const ArtistDashboard = () => {
    const { user } = useAuth();
    const { fetchArtworks } = useGallery();
    const { socket } = useChat();
    const fileInputRef = useRef(null);

    // Sale notification banner
    const [saleNotif, setSaleNotif] = useState(null);

    // Artist's own artworks (all, including sold) — fetched from /my endpoint
    const [myArtworks, setMyArtworks] = useState([]);
    const [loadingArtworks, setLoadingArtworks] = useState(true);

    // Form state — shared between create and edit
    const [showForm, setShowForm] = useState(false);
    const [editingArtwork, setEditingArtwork] = useState(null);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [imagePreview, setImagePreview] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    // Delete confirmation state
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Sold toggle loading per artwork id
    const [togglingId, setTogglingId] = useState(null);

    // Orders containing this artist's artworks
    const [myOrders, setMyOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [updatingOrderId, setUpdatingOrderId] = useState(null);

    if (user?.role !== 'artist') {
        return <div className="page-content container">Access Denied. Artist only area.</div>;
    }

    // ── Fetch artist's own artworks (including sold) ──────

    const fetchMyArtworks = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/artworks/my`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMyArtworks(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error('Failed to fetch my artworks:', err);
        } finally {
            setLoadingArtworks(false);
        }
    };

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        setUpdatingOrderId(orderId);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ orderStatus: newStatus })
            });
            if (res.ok) {
                const updated = await res.json();
                setMyOrders(prev => prev.map(o => o._id === orderId ? updated : o));
            } else {
                const err = await res.json();
                alert(err.message || 'Failed to update status');
            }
        } catch (err) {
            console.error('Update order status error:', err);
            alert('Network error. Please try again.');
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const fetchMyOrders = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/orders/artist-orders`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMyOrders(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error('Failed to fetch artist orders:', err);
        } finally {
            setOrdersLoading(false);
        }
    };

    useEffect(() => {
        fetchMyArtworks();
        fetchMyOrders();
    }, []);

    // Listen for artwork_sold events from the server
    useEffect(() => {
        if (!socket) return;
        const handler = (data) => {
            setSaleNotif(data);
            fetchMyArtworks();
            fetchMyOrders();
        };
        socket.on('artwork_sold', handler);
        return () => socket.off('artwork_sold', handler);
    }, [socket]);

    // ── Helpers ──────────────────────────────────────────

    const openCreateForm = () => {
        setEditingArtwork(null);
        setFormData(EMPTY_FORM);
        setImagePreview('');
        setFormError('');
        setShowForm(true);
    };

    const openEditForm = (art) => {
        setEditingArtwork(art);
        setFormData({
            title: art.title || '',
            price: art.price ?? '',
            category: art.category || 'Landscape',
            description: art.description || '',
            image: art.image || '',
            widthCm: art.widthCm ?? '',
            heightCm: art.heightCm ?? '',
        });
        setImagePreview(art.image || '');
        setFormError('');
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingArtwork(null);
        setFormData(EMPTY_FORM);
        setImagePreview('');
        setFormError('');
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
            setFormData(prev => ({ ...prev, image: reader.result }));
        };
        reader.readAsDataURL(file);
    };

    // ── Submit (Create or Edit) ───────────────────────────

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');

        if (!formData.image) {
            setFormError('Please upload an image of your artwork.');
            return;
        }
        if (!formData.title.trim() || !formData.price || !formData.description.trim()) {
            setFormError('Please fill in all fields.');
            return;
        }

        setSubmitting(true);
        const token = localStorage.getItem('token');
        const isEdit = !!editingArtwork;
        const url = isEdit
            ? `${API_URL}/artworks/${editingArtwork._id || editingArtwork.id}`
            : `${API_URL}/artworks`;
        const method = isEdit ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: formData.title.trim(),
                    description: formData.description.trim(),
                    price: Number(formData.price),
                    category: formData.category,
                    image: formData.image,
                    widthCm: formData.widthCm ? Number(formData.widthCm) : null,
                    heightCm: formData.heightCm ? Number(formData.heightCm) : null,
                })
            });

            if (res.ok) {
                await fetchMyArtworks();   // refresh dashboard
                await fetchArtworks();     // refresh public gallery
                closeForm();
            } else {
                const err = await res.json();
                setFormError(err.message || 'Something went wrong. Please try again.');
            }
        } catch (err) {
            console.error('Submit error:', err);
            setFormError('Network error. Please check your connection.');
        } finally {
            setSubmitting(false);
        }
    };

    // ── Toggle Sold Status ────────────────────────────────

    const handleToggleSold = async (art) => {
        const artId = art._id || art.id;
        setTogglingId(artId);
        const token = localStorage.getItem('token');

        try {
            const res = await fetch(`${API_URL}/artworks/${artId}/sold`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const updated = await res.json();
                // Update local state immediately without a full refetch
                setMyArtworks(prev =>
                    prev.map(a => (a._id || a.id) === artId ? { ...a, isSold: updated.isSold } : a)
                );
                await fetchArtworks(); // keep public gallery in sync
            } else {
                const err = await res.json();
                alert(err.message || 'Failed to update status.');
            }
        } catch (err) {
            console.error('Toggle sold error:', err);
            alert('Network error. Please try again.');
        } finally {
            setTogglingId(null);
        }
    };

    // ── Delete ────────────────────────────────────────────

    const handleDeleteConfirm = async () => {
        if (!confirmDelete) return;
        setDeleting(true);
        const token = localStorage.getItem('token');
        const artId = confirmDelete._id || confirmDelete.id;

        try {
            const res = await fetch(`${API_URL}/artworks/${artId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                setMyArtworks(prev => prev.filter(a => (a._id || a.id) !== artId));
                await fetchArtworks();
                setConfirmDelete(null);
            } else {
                const err = await res.json();
                alert(err.message || 'Failed to delete artwork.');
            }
        } catch (err) {
            console.error('Delete error:', err);
            alert('Network error. Please try again.');
        } finally {
            setDeleting(false);
        }
    };

    // ── Render ────────────────────────────────────────────

    const isEditing = !!editingArtwork;
    const formTitle = isEditing ? 'Edit Artwork' : 'Upload New Artwork';
    const submitLabel = submitting
        ? (isEditing ? 'Saving...' : 'Uploading...')
        : (isEditing ? 'Save Changes' : 'Publish Artwork');

    const soldCount = myArtworks.filter(a => a.isSold).length;

    return (
        <div className="page-content container dashboard-page">

            {/* Delete Confirmation Modal */}
            {confirmDelete && (
                <div className="delete-modal-overlay" onClick={() => !deleting && setConfirmDelete(null)}>
                    <div className="delete-modal" onClick={e => e.stopPropagation()}>
                        <div className="delete-modal-icon">
                            <AlertTriangle size={32} />
                        </div>
                        <h3>Delete Artwork?</h3>
                        <p>Are you sure you want to delete <strong>"{confirmDelete.title}"</strong>? This cannot be undone.</p>
                        <div className="delete-modal-actions">
                            <button className="btn-cancel-delete" onClick={() => setConfirmDelete(null)} disabled={deleting}>
                                Cancel
                            </button>
                            <button className="btn-confirm-delete" onClick={handleDeleteConfirm} disabled={deleting}>
                                {deleting ? 'Deleting...' : 'Yes, Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sale notification banner */}
            {saleNotif && (
                <div className="sale-notif-banner">
                    <Bell size={18} />
                    <span>
                        <strong>New Sale!</strong> "{saleNotif.artworkTitle}" was purchased by {saleNotif.buyerName} for NRP {Number(saleNotif.artworkPrice).toLocaleString('en-IN')}
                    </span>
                    <button className="sale-notif-close" onClick={() => setSaleNotif(null)}>
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Header */}
            <header className="dashboard-header">
                <div>
                    <p>✦ Chitrakala Studio</p>
                    <h1>Artist Dashboard</h1>
                </div>
                {!showForm && (
                    <Button onClick={openCreateForm}>
                        <Plus size={18} style={{ marginRight: '6px' }} /> Upload New Art
                    </Button>
                )}
            </header>

            {/* Create / Edit Form */}
            {showForm && (
                <div className="upload-form-container animate-fade-in">
                    <div className="form-header-row">
                        <h2>{formTitle}</h2>
                        <button className="form-close-btn" onClick={closeForm} title="Close">
                            <X size={20} />
                        </button>
                    </div>

                    {formError && <div className="form-error-msg">{formError}</div>}

                    <form onSubmit={handleSubmit} className="upload-form">
                        <Input
                            label="Artwork Title"
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />

                        <div className="form-row-2col">
                            <div className="form-group">
                                <label className="form-label">Category</label>
                                <select
                                    className="form-select"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option>Landscape</option>
                                    <option>Cityscape</option>
                                    <option>Traditional</option>
                                    <option>Abstract</option>
                                    <option>Digital</option>
                                </select>
                            </div>
                            <Input
                                label="Price (NRP)"
                                id="price"
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-row-2col">
                            <Input
                                label="Width (cm)"
                                id="widthCm"
                                type="number"
                                placeholder="e.g. 60"
                                value={formData.widthCm}
                                onChange={(e) => setFormData({ ...formData, widthCm: e.target.value })}
                            />
                            <Input
                                label="Height (cm)"
                                id="heightCm"
                                type="number"
                                placeholder="e.g. 90"
                                value={formData.heightCm}
                                onChange={(e) => setFormData({ ...formData, heightCm: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea
                                className="form-textarea"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe your artwork..."
                                rows="3"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Artwork Image</label>
                            <div className="image-upload-area" onClick={() => fileInputRef.current?.click()}>
                                {imagePreview ? (
                                    <div className="preview-container">
                                        <img src={imagePreview} alt="Preview" className="image-preview" />
                                        <div className="preview-overlay">Change Image</div>
                                    </div>
                                ) : (
                                    <div className="upload-placeholder">
                                        <Upload size={28} />
                                        <p>Click to upload image</p>
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                        </div>

                        <div className="form-actions">
                            <Button variant="outline" type="button" onClick={closeForm} disabled={submitting}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={submitting}>
                                {submitLabel}
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {/* Stats */}
            <div className="dashboard-stats">
                <div className="stat-card">
                    <h3>Total Artworks</h3>
                    <p className="stat-value">{myArtworks.length}</p>
                </div>
                <div className="stat-card">
                    <h3>Available</h3>
                    <p className="stat-value">{myArtworks.length - soldCount}</p>
                </div>
                <div className="stat-card">
                    <h3>Sold</h3>
                    <p className="stat-value">{soldCount}</p>
                </div>
            </div>

            {/* Portfolio Grid */}
            <h2 className="section-title">My Portfolio</h2>

            {loadingArtworks ? (
                <p className="no-art" style={{ border: 'none' }}>Loading your artworks…</p>
            ) : (
                <div className="artwork-grid">
                    {myArtworks.length > 0 ? myArtworks.map(art => {
                            const artId = art._id || art.id;
                            const displayPrice = typeof art.price === 'number'
                                ? `NRP ${art.price.toLocaleString('en-IN')}`
                                : art.price;
                            const isToggling = togglingId === artId;

                            return (
                                <div key={artId} className={`dashboard-art-card ${art.isSold ? 'is-sold' : ''}`}>
                                    <div className="dashboard-card-img-wrap">
                                        <img src={art.image} alt={art.title} />
                                        {art.isSold && (
                                            <div className="sold-overlay-badge">SOLD</div>
                                        )}
                                    </div>
                                    <div className="dashboard-card-body">
                                        <div className="dashboard-card-info">
                                            <h3>{art.title}</h3>
                                            <span className="dashboard-card-category">{art.category}</span>
                                            <p className="dashboard-card-price">{displayPrice}</p>
                                        </div>
                                        <div className="dashboard-card-badge-row">
                                            {art.isSold ? (
                                                <span className="status-badge sold-badge">Sold</span>
                                            ) : (
                                                <span className="status-badge">Available</span>
                                            )}
                                        </div>
                                        {/* Mark as Sold / Relist toggle */}
                                        <button
                                            className={`btn-sold-toggle ${art.isSold ? 'relist' : 'mark-sold'}`}
                                            onClick={() => handleToggleSold(art)}
                                            disabled={isToggling}
                                        >
                                            <Tag size={13} />
                                            {isToggling
                                                ? 'Updating…'
                                                : art.isSold ? 'Relist as Available' : 'Mark as Sold'}
                                        </button>
                                        <div className="dashboard-card-actions">
                                            <button
                                                className="card-action-btn edit-btn"
                                                onClick={() => openEditForm(art)}
                                                title="Edit artwork"
                                            >
                                                <Pencil size={15} />
                                                Edit
                                            </button>
                                            <button
                                                className="card-action-btn delete-btn"
                                                onClick={() => setConfirmDelete(art)}
                                                title="Delete artwork"
                                            >
                                                <Trash2 size={15} />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    : (
                        <p className="no-art">You haven't uploaded any artwork yet.</p>
                    )}
                </div>
            )}

            {/* ── Orders Section ── */}
            <h2 className="section-title" style={{ marginTop: '3rem' }}>Sales & Orders</h2>

            {ordersLoading ? (
                <p className="no-art" style={{ border: 'none' }}>Loading orders…</p>
            ) : myOrders.length === 0 ? (
                <div className="artist-orders-empty">
                    <Package size={36} />
                    <p>No orders yet — your artworks haven't been purchased.</p>
                </div>
            ) : (
                <div className="artist-orders-list">
                    {myOrders.map(order => {
                        const cfg = ORDER_STATUS_CONFIG[order.orderStatus] || ORDER_STATUS_CONFIG.Processing;
                        const date = new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'short', day: 'numeric'
                        });
                        const shortId = order._id?.slice(-8).toUpperCase();

                        return (
                            <div key={order._id} className="artist-order-card">
                                <div className="artist-order-header">
                                    <div className="artist-order-meta">
                                        <span className="artist-order-id">#{shortId}</span>
                                        <span className="artist-order-date">{date}</span>
                                        <span className="artist-order-buyer">
                                            {order.user?.name || 'Unknown Buyer'}
                                        </span>
                                        {order.user?.email && (
                                            <span className="artist-order-buyer-email">
                                                {order.user.email}
                                            </span>
                                        )}
                                    </div>
                                    <div className="artist-order-status-wrap">
                                        <select
                                            className="artist-order-status-select"
                                            value={order.orderStatus || 'Processing'}
                                            onChange={e => handleUpdateOrderStatus(order._id, e.target.value)}
                                            disabled={updatingOrderId === order._id || order.orderStatus === 'Delivered'}
                                            style={{ color: cfg.color, borderColor: cfg.border, background: cfg.bg }}
                                        >
                                            <option value="Processing">Processing</option>
                                            <option value="Shipped">Shipped</option>
                                            <option value="Delivered">Delivered</option>
                                        </select>
                                        {updatingOrderId === order._id && (
                                            <span className="artist-order-updating">Saving…</span>
                                        )}
                                    </div>
                                </div>

                                <div className="artist-order-artworks">
                                    {order.artworks.map((art, idx) => (
                                        <div key={art._id || idx} className="artist-order-artwork-row">
                                            <img src={art.image} alt={art.title} className="artist-order-thumb" />
                                            <div className="artist-order-artwork-info">
                                                <span className="artist-order-artwork-title">{art.title}</span>
                                                <span className="artist-order-artwork-price">
                                                    NRP {art.price?.toLocaleString('en-IN')}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="artist-order-footer">
                                    <span className="artist-order-total">
                                        Total: NRP {order.totalAmount?.toLocaleString('en-IN')}
                                    </span>
                                </div>

                                {/* Delivery Details */}
                                {order.deliveryDetails ? (
                                    <div className="artist-delivery-details">
                                        <span className="delivery-details-label">Delivery Details</span>
                                        <div className="delivery-details-grid">
                                            <div className="delivery-detail-row">
                                                <User size={13} />
                                                <span>{order.deliveryDetails.name}</span>
                                            </div>
                                            <div className="delivery-detail-row">
                                                <Phone size={13} />
                                                <span>{order.deliveryDetails.phone}</span>
                                            </div>
                                            <div className="delivery-detail-row">
                                                <MapPin size={13} />
                                                <span>{order.deliveryDetails.address}, {order.deliveryDetails.city}</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : order.shippingAddress ? (
                                    <div className="artist-delivery-details">
                                        <span className="delivery-details-label">Delivery Details</span>
                                        <div className="delivery-detail-row">
                                            <MapPin size={13} />
                                            <span>{order.shippingAddress}</span>
                                        </div>
                                    </div>
                                ) : null}

                                {/* Delivery progress */}
                                <div className="artist-order-progress">
                                    {['Processing', 'Shipped', 'Delivered'].map((step, i, arr) => {
                                        const steps = ['Processing', 'Shipped', 'Delivered'];
                                        const currentIdx = steps.indexOf(order.orderStatus);
                                        const isDone = i <= currentIdx;
                                        return (
                                            <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i < arr.length - 1 ? 1 : 0 }}>
                                                <div className={`aop-step ${isDone ? 'done' : ''}`}>
                                                    <div className="aop-dot" />
                                                    <span>{step}</span>
                                                </div>
                                                {i < arr.length - 1 && <div className={`aop-line ${isDone ? 'done' : ''}`} />}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ArtistDashboard;
