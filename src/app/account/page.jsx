'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { HiOutlineUser, HiOutlinePhone, HiOutlineMail, HiOutlineLocationMarker, HiOutlinePlus, HiTrash, HiPencil } from 'react-icons/hi';

export default function MyAccountPage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [editingProfile, setEditingProfile] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);

  const { register: profileReg, handleSubmit: handleProfileSubmit, reset: resetProfile } = useForm();
  const { register: addressReg, handleSubmit: handleAddressSubmit, reset: resetAddress, setValue: setAddressValue } = useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profileRes, addrRes] = await Promise.all([
        fetch('/api/user/profile'),
        fetch('/api/user/addresses')
      ]);

      if (!profileRes.ok) {
        if (profileRes.status === 401) router.push('/auth/login');
        throw new Error('Failed to fetch profile');
      }

      const profileData = await profileRes.json();
      const addrData = addrRes.ok ? await addrRes.json() : [];

      setProfile(profileData);
      resetProfile({ name: profileData.name || '', phone: profileData.phone || '' });
      setAddresses(addrData);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load account details');
    } finally {
      setLoading(false);
    }
  };

  const onProfileSubmit = async (data) => {
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Failed to update profile');
      
      const updated = await res.json();
      setProfile(updated);
      setEditingProfile(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update profile');
    }
  };

  const onAddressSubmit = async (data) => {
    try {
      const url = editingAddressId ? `/api/user/addresses/${editingAddressId}` : '/api/user/addresses';
      const method = editingAddressId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Failed to save address');
      
      toast.success(`Address ${editingAddressId ? 'updated' : 'added'} successfully`);
      setShowAddressForm(false);
      setEditingAddressId(null);
      resetAddress();
      fetchData(); // refresh list
    } catch (error) {
      console.error(error);
      toast.error('Failed to save address');
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      const res = await fetch(`/api/user/addresses/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Address deleted');
      setAddresses(addresses.filter(a => a.id !== id));
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete address');
    }
  };

  const handleEditAddress = (addr) => {
    setEditingAddressId(addr.id);
    Object.keys(addr).forEach(key => setAddressValue(key, addr[key]));
    setShowAddressForm(true);
  };

  if (loading) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="pt-24 min-h-screen pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold text-white mb-8">My Account</h1>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="md:col-span-1 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-6 border border-white/10 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-primary-500/20 to-purple-500/20 z-0" />
              <div className="relative z-10">
                <div className="w-24 h-24 mx-auto rounded-full bg-white/10 border-4 border-white/5 overflow-hidden mb-4 mt-6">
                  {profile.image ? (
                    <Image src={profile.image} alt={profile.name} width={96} height={96} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white/50">
                      {profile.name?.[0] || 'U'}
                    </div>
                  )}
                </div>
                <h2 className="text-xl font-bold text-white">{profile.name || 'User'}</h2>
                <p className="text-sm text-white/50 mb-4">{profile.email}</p>
                <div className="text-xs text-white/30 uppercase tracking-widest font-semibold mb-2">Member Since</div>
                <div className="text-sm text-white/70">
                  {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-3xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-white">Personal Details</h3>
                {!editingProfile && (
                  <button onClick={() => setEditingProfile(true)} className="text-primary-400 hover:text-primary-300 text-sm font-medium">Edit</button>
                )}
              </div>

              {editingProfile ? (
                <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1">Full Name</label>
                    <input {...profileReg('name')} className="w-full px-4 py-2 glass rounded-xl text-white border border-white/10 focus:border-primary-500 focus:outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1">Phone Number</label>
                    <input {...profileReg('phone')} className="w-full px-4 py-2 glass rounded-xl text-white border border-white/10 focus:border-primary-500 focus:outline-none text-sm" />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button type="submit" className="flex-1 py-2 gradient-primary rounded-xl text-white text-sm font-medium">Save</button>
                    <button type="button" onClick={() => setEditingProfile(false)} className="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white text-sm font-medium">Cancel</button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-white/70">
                    <HiOutlineUser className="w-5 h-5 text-white/40" />
                    <span className="text-sm">{profile.name || 'Not set'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/70">
                    <HiOutlineMail className="w-5 h-5 text-white/40" />
                    <span className="text-sm">{profile.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/70">
                    <HiOutlinePhone className="w-5 h-5 text-white/40" />
                    <span className="text-sm">{profile.phone || 'Not set'}</span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Addresses Section */}
          <div className="md:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass rounded-3xl p-6 sm:p-8 border border-white/10">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <HiOutlineLocationMarker className="w-6 h-6 text-primary-400" />
                  Saved Addresses
                </h2>
                {!showAddressForm && (
                  <button 
                    onClick={() => { resetAddress({ isDefault: false }); setEditingAddressId(null); setShowAddressForm(true); }}
                    className="flex items-center gap-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white text-sm font-medium transition-all"
                  >
                    <HiOutlinePlus className="w-4 h-4" /> Add New
                  </button>
                )}
              </div>

              {showAddressForm ? (
                <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} onSubmit={handleAddressSubmit(onAddressSubmit)} className="space-y-4 mb-8 pb-8 border-b border-white/10">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-white/50 mb-1">Title (e.g. Home, Office)</label>
                      <input {...addressReg('title')} required className="w-full px-4 py-2.5 glass rounded-xl text-white border border-white/10 focus:border-primary-500 focus:outline-none text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-white/50 mb-1">Full Name</label>
                      <input {...addressReg('fullName')} required className="w-full px-4 py-2.5 glass rounded-xl text-white border border-white/10 focus:border-primary-500 focus:outline-none text-sm" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1">Phone Number</label>
                    <input {...addressReg('phone')} required className="w-full px-4 py-2.5 glass rounded-xl text-white border border-white/10 focus:border-primary-500 focus:outline-none text-sm" />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1">Full Address</label>
                    <textarea {...addressReg('address')} required rows={3} className="w-full px-4 py-2.5 glass rounded-xl text-white border border-white/10 focus:border-primary-500 focus:outline-none text-sm resize-none" />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-white/50 mb-1">City</label>
                      <input {...addressReg('city')} required className="w-full px-4 py-2.5 glass rounded-xl text-white border border-white/10 focus:border-primary-500 focus:outline-none text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-white/50 mb-1">State</label>
                      <input {...addressReg('state')} required className="w-full px-4 py-2.5 glass rounded-xl text-white border border-white/10 focus:border-primary-500 focus:outline-none text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-white/50 mb-1">Pincode</label>
                      <input {...addressReg('pincode')} required className="w-full px-4 py-2.5 glass rounded-xl text-white border border-white/10 focus:border-primary-500 focus:outline-none text-sm" />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <input type="checkbox" id="isDefault" {...addressReg('isDefault')} className="w-4 h-4 rounded bg-white/10 border-white/20 text-primary-500 focus:ring-primary-500 focus:ring-offset-0" />
                    <label htmlFor="isDefault" className="text-sm text-white/70">Set as default address</label>
                  </div>

                  <div className="flex gap-3 pt-4 mt-4 border-t border-white/10">
                    <button type="submit" className="px-6 py-2.5 gradient-primary rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all glow">
                      {editingAddressId ? 'Update Address' : 'Save Address'}
                    </button>
                    <button type="button" onClick={() => setShowAddressForm(false)} className="px-6 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white text-sm font-semibold transition-all">
                      Cancel
                    </button>
                  </div>
                </motion.form>
              ) : null}

              {addresses.length === 0 && !showAddressForm ? (
                <div className="text-center py-10 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-white/50 mb-4 text-sm">No saved addresses found.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div key={addr.id} className={`p-5 rounded-2xl border ${addr.isDefault ? 'bg-primary-500/10 border-primary-500/30' : 'bg-white/5 border-white/10'}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{addr.title || 'Address'}</span>
                          {addr.isDefault && <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary-500/20 text-primary-400">Default</span>}
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleEditAddress(addr)} className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                            <HiPencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteAddress(addr.id)} className="p-1.5 text-red-400/60 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                            <HiTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="text-sm text-white/60 space-y-1">
                        <div className="text-white/80 font-medium">{addr.fullName}</div>
                        <div>{addr.address}</div>
                        <div>{addr.city}, {addr.state} {addr.pincode}</div>
                        <div className="pt-2 text-white/50">Phone: {addr.phone}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
