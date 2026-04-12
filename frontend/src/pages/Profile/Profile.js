import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import { toast } from 'react-toastify';
import './Profile.css';

const Profile = () => {
    const [form, setForm] = useState({ name: '', phone: '', address: '', city: '', state: '', pincode: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data } = await API.get('/api/auth.php?action=profile');
                setForm({ name: data.name || '', phone: data.phone || '', address: data.address || '', city: data.city || '', state: data.state || '', pincode: data.pincode || '' });
            } catch (err) { console.error(err); }
            setLoading(false);
        };
        fetch();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try { await API.put('/api/auth.php?action=profile', form); toast.success('Profile updated!'); }
        catch (err) { toast.error('Error updating profile'); }
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="profile-page">
            <div className="profile-card">
                <h2>My Profile</h2>
                <form onSubmit={handleSubmit}>
                    <input placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                    <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    <input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                    <div className="form-row">
                        <input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                        <input placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
                    </div>
                    <input placeholder="Pincode" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
                    <button type="submit">Update Profile</button>
                </form>
            </div>
        </div>
    );
};

export default Profile;
