import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { Lock, User, ArrowLeft, Save, Eye, EyeOff, CheckCircle } from 'lucide-react';
import './Settings.css';

const Settings = () => {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();

    // Profile section
    const [profileForm, setProfileForm] = useState({ name: user?.name || '', bio: user?.bio || '' });
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileMsg, setProfileMsg] = useState('');
    const [profileErr, setProfileErr] = useState('');

    // Password section
    const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [pwSaving, setPwSaving] = useState(false);
    const [pwMsg, setPwMsg] = useState('');
    const [pwErr, setPwErr] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);

    const isGoogleUser = user && !user.hasPassword;

    const authHeaders = () => ({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
    });

    const handleProfileSave = async (e) => {
        e.preventDefault();
        setProfileMsg('');
        setProfileErr('');
        if (!profileForm.name.trim()) { setProfileErr('Name cannot be empty.'); return; }
        setProfileSaving(true);
        try {
            const res = await fetch(`${API_URL}/auth/profile`, {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify({ name: profileForm.name.trim(), bio: profileForm.bio }),
            });
            const data = await res.json();
            if (res.ok) {
                setUser(prev => ({ ...prev, name: data.name, bio: data.bio }));
                setProfileMsg('Profile updated successfully.');
            } else {
                setProfileErr(data.message || 'Failed to update profile.');
            }
        } catch {
            setProfileErr('Network error. Please try again.');
        } finally {
            setProfileSaving(false);
        }
    };

    const handlePasswordSave = async (e) => {
        e.preventDefault();
        setPwMsg('');
        setPwErr('');
        if (pwForm.newPassword !== pwForm.confirmPassword) {
            setPwErr('New passwords do not match.');
            return;
        }
        if (pwForm.newPassword.length < 8) {
            setPwErr('Password must be at least 8 characters.');
            return;
        }
        if (!/[A-Z]/.test(pwForm.newPassword)) {
            setPwErr('Password must contain at least one uppercase letter.');
            return;
        }
        if (!/[0-9]/.test(pwForm.newPassword)) {
            setPwErr('Password must contain at least one number.');
            return;
        }
        setPwSaving(true);
        try {
            const res = await fetch(`${API_URL}/auth/change-password`, {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify({
                    currentPassword: pwForm.currentPassword,
                    newPassword: pwForm.newPassword,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setPwMsg('Password changed successfully.');
                setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                setPwErr(data.message || 'Failed to change password.');
            }
        } catch {
            setPwErr('Network error. Please try again.');
        } finally {
            setPwSaving(false);
        }
    };

    return (
        <div className="settings-page">
            <div className="container settings-container">
                <button className="settings-back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={16} /> Back
                </button>

                <div className="settings-header">
                    <h1>Settings</h1>
                    <p>Manage your account preferences</p>
                </div>

                {/* Profile Section */}
                <div className="settings-card">
                    <div className="settings-card-header">
                        <div className="settings-card-icon"><User size={18} /></div>
                        <div>
                            <h2>Profile Information</h2>
                            <p>Update your display name and bio</p>
                        </div>
                    </div>

                    <form onSubmit={handleProfileSave} className="settings-form">
                        <div className="settings-field">
                            <label>Display Name</label>
                            <input
                                type="text"
                                value={profileForm.name}
                                onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
                                placeholder="Your name"
                                required
                            />
                        </div>
                        <div className="settings-field">
                            <label>Bio</label>
                            <textarea
                                value={profileForm.bio}
                                onChange={e => setProfileForm(f => ({ ...f, bio: e.target.value }))}
                                placeholder="Tell collectors about yourself…"
                                rows={3}
                            />
                        </div>

                        {profileErr && <p className="settings-err">{profileErr}</p>}
                        {profileMsg && (
                            <p className="settings-success">
                                <CheckCircle size={14} /> {profileMsg}
                            </p>
                        )}

                        <div className="settings-field">
                            <label>Email</label>
                            <input type="email" value={user?.email || ''} disabled className="settings-input-disabled" />
                            <span className="settings-hint">Email cannot be changed.</span>
                        </div>

                        <div className="settings-field">
                            <label>Role</label>
                            <input type="text" value={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''} disabled className="settings-input-disabled" />
                        </div>

                        <button type="submit" className="settings-save-btn" disabled={profileSaving}>
                            <Save size={15} /> {profileSaving ? 'Saving…' : 'Save Profile'}
                        </button>
                    </form>
                </div>

                {/* Password Section */}
                <div className="settings-card">
                    <div className="settings-card-header">
                        <div className="settings-card-icon"><Lock size={18} /></div>
                        <div>
                            <h2>Change Password</h2>
                            <p>{isGoogleUser ? 'Not available for Google Sign-In accounts' : 'Update your login password'}</p>
                        </div>
                    </div>

                    {isGoogleUser ? (
                        <div className="settings-google-note">
                            Your account is linked with Google. Password management is handled by Google.
                        </div>
                    ) : (
                        <form onSubmit={handlePasswordSave} className="settings-form">
                            <div className="settings-field">
                                <label>Current Password</label>
                                <div className="settings-pw-wrap">
                                    <input
                                        type={showCurrent ? 'text' : 'password'}
                                        value={pwForm.currentPassword}
                                        onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button type="button" onClick={() => setShowCurrent(v => !v)}>
                                        {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div className="settings-field">
                                <label>New Password</label>
                                <div className="settings-pw-wrap">
                                    <input
                                        type={showNew ? 'text' : 'password'}
                                        value={pwForm.newPassword}
                                        onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button type="button" onClick={() => setShowNew(v => !v)}>
                                        {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                <span className="settings-hint">8+ chars, 1 uppercase, 1 number.</span>
                            </div>
                            <div className="settings-field">
                                <label>Confirm New Password</label>
                                <input
                                    type="password"
                                    value={pwForm.confirmPassword}
                                    onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            {pwErr && <p className="settings-err">{pwErr}</p>}
                            {pwMsg && (
                                <p className="settings-success">
                                    <CheckCircle size={14} /> {pwMsg}
                                </p>
                            )}

                            <button type="submit" className="settings-save-btn" disabled={pwSaving}>
                                <Save size={15} /> {pwSaving ? 'Updating…' : 'Update Password'}
                            </button>
                        </form>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Settings;
