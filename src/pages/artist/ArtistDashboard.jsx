import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useGallery } from '../../context/GalleryContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Plus, Image as ImageIcon, Upload } from 'lucide-react';
import { API_URL } from '../../config';
import './ArtistDashboard.css';

const ArtistDashboard = () => {
    const { user } = useAuth();
    const { fetchArtworks, artworks } = useGallery();
    const [showForm, setShowForm] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState('');
    const fileInputRef = useRef(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        price: '',
        category: 'Landscape',
        description: '',
        image: ''
    });

    const myArtworks = artworks.filter(art => {
        // Handle both old localStorage format and new API format
        return art.artist === user?.name || (art.artist && art.artist._id === user?._id);
    });

    if (user?.role !== 'artist') {
        return <div className="page-content container">Access Denied. Artist only area.</div>;
    }

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Show preview
            const previewReader = new FileReader();
            previewReader.onloadend = () => {
                setImagePreview(previewReader.result);
            };
            previewReader.readAsDataURL(file);

            // Store file for upload
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, image: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.image) {
            alert("Please upload an image of your artwork.");
            return;
        }

        if (!formData.title || !formData.price || !formData.description) {
            alert("Please fill in all fields.");
            return;
        }

        setUploading(true);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/artworks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description,
                    price: Number(formData.price),
                    category: formData.category,
                    image: formData.image // Send base64 image
                })
            });

            if (res.ok) {
                const artwork = await res.json();
                console.log("Artwork uploaded successfully:", artwork);
                
                // Refresh artworks list
                fetchArtworks();
                
                setFormData({ title: '', price: '', category: 'Landscape', description: '', image: '' });
                setImagePreview('');
                setShowForm(false);
                alert('Artwork uploaded successfully!');
            } else {
                const error = await res.json();
                alert(`Error: ${error.message}`);
            }
        } catch (error) {
            console.error("Upload error:", error);
            alert('Failed to upload artwork. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="page-content container dashboard-page">
            <header className="dashboard-header">
                <div>
                    <h1>Artist Dashboard</h1>
                    <p>Welcome back, {user.name}</p>
                </div>
                <Button onClick={() => setShowForm(!showForm)}>
                    <Plus size={20} className="mr-2" /> Upload New Art
                </Button>
            </header>

            {showForm && (
                <div className="upload-form-container glass-card animate-fade-in">
                    <h2>Upload New Artwork</h2>
                    <form onSubmit={handleSubmit} className="upload-form">
                        <Input
                            label="Artwork Title"
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
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
                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea
                                className="form-textarea"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe your artwork..."
                                rows="4"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Artwork Image</label>
                            <div
                                className="image-upload-area"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {formData.image ? (
                                    <div className="preview-container">
                                        <img src={formData.image} alt="Preview" className="image-preview" />
                                        <div className="preview-overlay">Change Image</div>
                                    </div>
                                ) : (
                                    <div className="upload-placeholder">
                                        <Upload size={32} />
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
                            <Button variant="outline" onClick={() => setShowForm(false)} disabled={uploading}>Cancel</Button>
                            <Button type="submit" disabled={uploading}>{uploading ? 'Uploading...' : 'Publish Artwork'}</Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="dashboard-stats">
                <div className="stat-card">
                    <h3>Total Artworks</h3>
                    <p className="stat-value">{myArtworks.length}</p>
                </div>
                <div className="stat-card">
                    <h3>Total Sales</h3>
                    <p className="stat-value">NRP 0</p>
                    <span className="stat-sub">Coming Soon</span>
                </div>
            </div>

            <h2 className="section-title">My Portfolio</h2>
            <div className="artwork-grid">
                {myArtworks.length > 0 ? (
                    myArtworks.map(art => (
                        <div key={art.id} className="dashboard-art-card glass-card">
                            <img src={art.image} alt={art.title} />
                            <div className="p-4">
                                <h3>{art.title}</h3>
                                <p>NRP {art.price}</p>
                                <span className="status-badge">Active</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="no-art">You haven't uploaded any artwork yet.</p>
                )}
            </div>
        </div>
    );
};

export default ArtistDashboard;
