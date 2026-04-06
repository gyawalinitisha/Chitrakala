import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    Shield, Users, Image, ShoppingBag, Trash2, CheckCircle,
    XCircle, Search, X, AlertTriangle, TrendingUp, Package,
    ChevronDown, User, DollarSign, Clock,
} from 'lucide-react';
import { API_URL } from '../../config';
import './AdminDashboard.css';

// ── helpers ──────────────────────────────────────────────────────────────────

const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
});

const fmt = (n) => Number(n || 0).toLocaleString('en-IN');

function StatusBadge({ status }) {
    const map = {
        Processing: 'badge-processing',
        Shipped:    'badge-shipped',
        Delivered:  'badge-delivered',
        Completed:  'badge-delivered',
        Pending:    'badge-processing',
        Failed:     'badge-rejected',
    };
    return <span className={`adm-badge ${map[status] || 'badge-processing'}`}>{status}</span>;
}

// ── Delete confirmation modal ─────────────────────────────────────────────────

function ConfirmModal({ title, message, onConfirm, onCancel, loading }) {
    return (
        <div className="adm-modal-overlay" onClick={() => !loading && onCancel()}>
            <div className="adm-modal" onClick={e => e.stopPropagation()}>
                <div className="adm-modal-icon"><AlertTriangle size={30} /></div>
                <h3>{title}</h3>
                <p>{message}</p>
                <div className="adm-modal-actions">
                    <button className="adm-btn-cancel" onClick={onCancel} disabled={loading}>Cancel</button>
                    <button className="adm-btn-danger" onClick={onConfirm} disabled={loading}>
                        {loading ? 'Deleting…' : 'Yes, Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Users tab ─────────────────────────────────────────────────────────────────

function UsersTab({ users, onDelete }) {
    const [search, setSearch]       = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [confirm, setConfirm]     = useState(null);
    const [deleting, setDeleting]   = useState(false);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return users.filter(u => {
            const matchesRole   = roleFilter === 'all' || u.role === roleFilter;
            const matchesSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
            return matchesRole && matchesSearch;
        });
    }, [users, search, roleFilter]);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            const res = await fetch(`${API_URL}/admin/users/${confirm._id}`, {
                method: 'DELETE', headers: authHeaders(),
            });
            if (res.ok) {
                onDelete(confirm._id);
                setConfirm(null);
            } else {
                const err = await res.json();
                alert(err.message || 'Delete failed');
            }
        } catch { alert('Network error'); }
        finally { setDeleting(false); }
    };

    return (
        <div>
            {confirm && (
                <ConfirmModal
                    title="Delete User?"
                    message={<>Remove <strong>{confirm.name}</strong> permanently? All their data will be lost.</>}
                    onConfirm={handleDelete}
                    onCancel={() => setConfirm(null)}
                    loading={deleting}
                />
            )}

            <div className="adm-toolbar">
                <div className="adm-search-box">
                    <Search size={15} />
                    <input
                        placeholder="Search by name or email…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    {search && <button onClick={() => setSearch('')}><X size={13} /></button>}
                </div>
                <div className="adm-filter-group">
                    <label>Role</label>
                    <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                        <option value="all">All Roles</option>
                        <option value="collector">Collector</option>
                        <option value="artist">Artist</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <span className="adm-result-count">{filtered.length} user{filtered.length !== 1 ? 's' : ''}</span>
            </div>

            <div className="adm-table-wrap">
                <table className="adm-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Joined</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length > 0 ? filtered.map(u => (
                            <tr key={u._id}>
                                <td>
                                    <div className="adm-user-cell">
                                        <div className="adm-avatar">
                                            {u.profileImage
                                                ? <img src={u.profileImage} alt={u.name} />
                                                : <User size={14} />}
                                        </div>
                                        <span>{u.name}</span>
                                    </div>
                                </td>
                                <td className="adm-muted">{u.email}</td>
                                <td><span className={`adm-role-badge role-${u.role}`}>{u.role}</span></td>
                                <td className="adm-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                                <td>
                                    {u.role !== 'admin' ? (
                                        <button
                                            className="adm-icon-btn danger"
                                            title="Delete user"
                                            onClick={() => setConfirm(u)}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    ) : (
                                        <span className="adm-muted" style={{ fontSize: '0.75rem' }}>Protected</span>
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="5" className="adm-empty-row">No users match your search.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ── Artworks tab ──────────────────────────────────────────────────────────────

function ArtworksTab({ artworks, onDelete, onToggleApproval }) {
    const [search, setSearch]           = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [confirm, setConfirm]         = useState(null);
    const [deleting, setDeleting]       = useState(false);
    const [togglingId, setTogglingId]   = useState(null);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return artworks.filter(a => {
            const artistName = typeof a.artist === 'string' ? a.artist : a.artist?.name || '';
            const matchesSearch = !q || a.title.toLowerCase().includes(q) || artistName.toLowerCase().includes(q);
            const matchesStatus =
                statusFilter === 'all'      ? true :
                statusFilter === 'sold'     ? a.isSold :
                statusFilter === 'available'? !a.isSold && a.isApproved :
                statusFilter === 'rejected' ? !a.isApproved : true;
            return matchesSearch && matchesStatus;
        });
    }, [artworks, search, statusFilter]);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            const res = await fetch(`${API_URL}/admin/artworks/${confirm._id}`, {
                method: 'DELETE', headers: authHeaders(),
            });
            if (res.ok) { onDelete(confirm._id); setConfirm(null); }
            else { const e = await res.json(); alert(e.message || 'Delete failed'); }
        } catch { alert('Network error'); }
        finally { setDeleting(false); }
    };

    const handleToggle = async (art) => {
        setTogglingId(art._id);
        try {
            const res = await fetch(`${API_URL}/admin/artworks/${art._id}/approve`, {
                method: 'PATCH', headers: authHeaders(),
            });
            if (res.ok) { const updated = await res.json(); onToggleApproval(updated); }
            else { const e = await res.json(); alert(e.message || 'Update failed'); }
        } catch { alert('Network error'); }
        finally { setTogglingId(null); }
    };

    return (
        <div>
            {confirm && (
                <ConfirmModal
                    title="Delete Artwork?"
                    message={<>Permanently delete <strong>"{confirm.title}"</strong>? This cannot be undone.</>}
                    onConfirm={handleDelete}
                    onCancel={() => setConfirm(null)}
                    loading={deleting}
                />
            )}

            <div className="adm-toolbar">
                <div className="adm-search-box">
                    <Search size={15} />
                    <input
                        placeholder="Search by title or artist…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    {search && <button onClick={() => setSearch('')}><X size={13} /></button>}
                </div>
                <div className="adm-filter-group">
                    <label>Status</label>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                        <option value="all">All</option>
                        <option value="available">Available</option>
                        <option value="sold">Sold</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
                <span className="adm-result-count">{filtered.length} artwork{filtered.length !== 1 ? 's' : ''}</span>
            </div>

            <div className="adm-table-wrap">
                <table className="adm-table">
                    <thead>
                        <tr>
                            <th>Artwork</th>
                            <th>Artist</th>
                            <th>Price</th>
                            <th>Category</th>
                            <th>Status</th>
                            <th>Approval</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length > 0 ? filtered.map(art => {
                            const artistName = typeof art.artist === 'string' ? art.artist : art.artist?.name || '—';
                            const isToggling = togglingId === art._id;
                            return (
                                <tr key={art._id} className={!art.isApproved ? 'row-rejected' : ''}>
                                    <td>
                                        <div className="adm-artwork-cell">
                                            <img src={art.image} alt={art.title} className="adm-thumb" />
                                            <span className="adm-artwork-title">{art.title}</span>
                                        </div>
                                    </td>
                                    <td className="adm-muted">{artistName}</td>
                                    <td>NPR {fmt(art.price)}</td>
                                    <td className="adm-muted">{art.category}</td>
                                    <td>
                                        {art.isSold
                                            ? <span className="adm-badge badge-sold">Sold</span>
                                            : <span className="adm-badge badge-available">Available</span>}
                                    </td>
                                    <td>
                                        {art.isApproved
                                            ? <span className="adm-badge badge-delivered">Approved</span>
                                            : <span className="adm-badge badge-rejected">Rejected</span>}
                                    </td>
                                    <td>
                                        <div className="adm-actions-row">
                                            <button
                                                className={`adm-icon-btn ${art.isApproved ? 'warn' : 'success'}`}
                                                title={art.isApproved ? 'Reject artwork' : 'Approve artwork'}
                                                onClick={() => handleToggle(art)}
                                                disabled={isToggling}
                                            >
                                                {art.isApproved ? <XCircle size={16} /> : <CheckCircle size={16} />}
                                            </button>
                                            <button
                                                className="adm-icon-btn danger"
                                                title="Delete artwork"
                                                onClick={() => setConfirm(art)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr><td colSpan="7" className="adm-empty-row">No artworks match your search.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ── Orders tab ────────────────────────────────────────────────────────────────

function OrdersTab({ orders, onStatusChange }) {
    const [statusFilter, setStatusFilter] = useState('all');
    const [updatingId, setUpdatingId]     = useState(null);

    const filtered = useMemo(() => {
        if (statusFilter === 'all') return orders;
        return orders.filter(o => o.orderStatus === statusFilter);
    }, [orders, statusFilter]);

    const handleStatusChange = async (orderId, newStatus) => {
        setUpdatingId(orderId);
        try {
            const res = await fetch(`${API_URL}/admin/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: authHeaders(),
                body: JSON.stringify({ orderStatus: newStatus }),
            });
            if (res.ok) { const updated = await res.json(); onStatusChange(updated); }
            else { const e = await res.json(); alert(e.message || 'Update failed'); }
        } catch { alert('Network error'); }
        finally { setUpdatingId(null); }
    };

    return (
        <div>
            <div className="adm-toolbar">
                <div className="adm-filter-group">
                    <label>Order Status</label>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                        <option value="all">All Orders</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                    </select>
                </div>
                <span className="adm-result-count">{filtered.length} order{filtered.length !== 1 ? 's' : ''}</span>
            </div>

            <div className="adm-table-wrap">
                <table className="adm-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Buyer</th>
                            <th>Artworks</th>
                            <th>Amount</th>
                            <th>Payment</th>
                            <th>Order Status</th>
                            <th>Date</th>
                            <th>Update Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length > 0 ? filtered.map(order => {
                            const isUpdating = updatingId === order._id;
                            return (
                                <tr key={order._id}>
                                    <td className="adm-order-id adm-muted">
                                        #{order._id.slice(-6).toUpperCase()}
                                    </td>
                                    <td>
                                        <div className="adm-order-buyer">
                                            <span>{order.user?.name || order.deliveryDetails?.name || '—'}</span>
                                            <span className="adm-muted" style={{ fontSize: '0.75rem' }}>
                                                {order.user?.email || ''}
                                            </span>
                                            {order.deliveryDetails && (
                                                <div className="adm-delivery-details">
                                                    <span>📞 {order.deliveryDetails.phone}</span>
                                                    <span>📍 {order.deliveryDetails.address}, {order.deliveryDetails.city}</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="adm-artwork-list">
                                            {(order.artworks || []).map((art, i) => (
                                                <div key={i} className="adm-artwork-pill">
                                                    {art.image && <img src={art.image} alt={art.title} />}
                                                    <span>{art.title || '—'}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td><strong>NPR {fmt(order.totalAmount)}</strong></td>
                                    <td className="adm-muted">{order.paymentMethod}</td>
                                    <td><StatusBadge status={order.orderStatus || 'Processing'} /></td>
                                    <td className="adm-muted">{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <div className="adm-select-wrap">
                                            <select
                                                value={order.orderStatus || 'Processing'}
                                                onChange={e => handleStatusChange(order._id, e.target.value)}
                                                disabled={isUpdating || order.orderStatus === 'Delivered'}
                                                className="adm-status-select"
                                            >
                                                <option value="Processing">Processing</option>
                                                <option value="Shipped">Shipped</option>
                                                <option value="Delivered">Delivered</option>
                                            </select>
                                            <ChevronDown size={12} className="adm-select-icon" />
                                        </div>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr><td colSpan="8" className="adm-empty-row">No orders found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

const TABS = [
    { id: 'users',    label: 'Users',    icon: Users },
    { id: 'artworks', label: 'Artworks', icon: Image },
    { id: 'orders',   label: 'Orders',   icon: ShoppingBag },
];

const AdminDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('users');
    const [stats, setStats]         = useState({});
    const [users, setUsers]         = useState([]);
    const [artworks, setArtworks]   = useState([]);
    const [orders, setOrders]       = useState([]);
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState('');

    useEffect(() => {
        if (user?.role !== 'admin') return;
        const h = authHeaders();

        const fetchAll = async () => {
            setLoading(true);
            setError('');
            try {
                const [statsRes, usersRes, artworksRes, ordersRes] = await Promise.all([
                    fetch(`${API_URL}/admin/stats`,    { headers: h }),
                    fetch(`${API_URL}/admin/users`,    { headers: h }),
                    fetch(`${API_URL}/admin/artworks`, { headers: h }),
                    fetch(`${API_URL}/admin/orders`,   { headers: h }),
                ]);

                if (statsRes.ok)    setStats(await statsRes.json());
                if (usersRes.ok)    setUsers(await usersRes.json());
                if (artworksRes.ok) setArtworks(await artworksRes.json());
                if (ordersRes.ok)   setOrders(await ordersRes.json());
            } catch (err) {
                setError('Failed to load dashboard data. Is the server running?');
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [user]);

    if (user?.role !== 'admin') {
        return (
            <div className="page-content container" style={{ paddingTop: '10rem', textAlign: 'center' }}>
                <Shield size={48} style={{ color: '#dc2626', marginBottom: '1rem' }} />
                <h2>Access Denied</h2>
                <p style={{ color: '#666' }}>This area is restricted to admins only.</p>
            </div>
        );
    }

    const statCards = [
        { label: 'Total Users',        value: stats.userCount        ?? '—', icon: Users,       color: '#6366f1' },
        { label: 'Artists',            value: stats.artistCount      ?? '—', icon: TrendingUp,  color: '#d4af37' },
        { label: 'Artworks',           value: stats.artworkCount     ?? '—', icon: Image,       color: '#8b5cf6' },
        { label: 'Sold Artworks',      value: stats.soldCount        ?? '—', icon: CheckCircle, color: '#10b981' },
        { label: 'Total Orders',       value: stats.orderCount       ?? '—', icon: Package,     color: '#f59e0b' },
        { label: 'Pending Orders',     value: stats.pendingOrders    ?? '—', icon: ShoppingBag, color: '#ef4444' },
        { label: 'Pending Approvals',  value: stats.pendingApprovals ?? '—', icon: Clock,       color: '#f97316' },
        {
            label: 'Total Revenue',
            value: stats.totalRevenue != null ? `NPR ${fmt(stats.totalRevenue)}` : '—',
            icon: DollarSign,
            color: '#22c55e',
        },
    ];

    return (
        <div className="page-content container adm-page">

            {/* Header */}
            <header className="adm-header">
                <div>
                    <p className="adm-header-label">✦ Chitrakala</p>
                    <h1 className="adm-header-title">Admin Console</h1>
                </div>
                <div className="adm-super-badge">
                    <Shield size={14} /> Super Admin
                </div>
            </header>

            {error && <div className="adm-error-banner">{error}</div>}

            {/* Stats */}
            <div className="adm-stats-grid">
                {statCards.map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="adm-stat-card">
                        <div className="adm-stat-icon" style={{ background: `${color}18`, color }}>
                            <Icon size={20} />
                        </div>
                        <div>
                            <p className="adm-stat-label">{label}</p>
                            <p className="adm-stat-value">{loading ? '…' : value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="adm-tabs">
                {TABS.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        className={`adm-tab-btn ${activeTab === id ? 'active' : ''}`}
                        onClick={() => setActiveTab(id)}
                    >
                        <Icon size={15} />
                        {label}
                        <span className="adm-tab-count">
                            {id === 'users' ? users.length : id === 'artworks' ? artworks.length : orders.length}
                        </span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="adm-panel">
                {loading ? (
                    <div className="adm-loading">
                        <div className="adm-spinner" />
                        <p>Loading data…</p>
                    </div>
                ) : (
                    <>
                        {activeTab === 'users' && (
                            <UsersTab
                                users={users}
                                onDelete={id => setUsers(prev => prev.filter(u => u._id !== id))}
                            />
                        )}
                        {activeTab === 'artworks' && (
                            <ArtworksTab
                                artworks={artworks}
                                onDelete={id => setArtworks(prev => prev.filter(a => a._id !== id))}
                                onToggleApproval={updated =>
                                    setArtworks(prev => prev.map(a => a._id === updated._id ? updated : a))
                                }
                            />
                        )}
                        {activeTab === 'orders' && (
                            <OrdersTab
                                orders={orders}
                                onStatusChange={updated =>
                                    setOrders(prev => prev.map(o => o._id === updated._id ? updated : o))
                                }
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
