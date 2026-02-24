// src/pages/Admin.jsx — Admin dashboard for product management. Route: /admin

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../hooks/useProducts';
import ProductForm from '../components/admin/ProductForm';
import { createProduct, updateProduct, toggleProductActive, deleteProduct } from '../services/productService';
import { getFirebaseInfo } from '../firebase/firebaseConfig';

const Admin = () => {
  const { products, loading, refetch, error } = useProducts(true);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [view,    setView]    = useState('list'); // 'list' | 'add' | 'edit'
  const [editing, setEditing] = useState(null);
  const [saving,  setSaving]  = useState(false);
  const [toast,   setToast]   = useState('');
  const [search,  setSearch]  = useState('');

  const firebaseInfo = getFirebaseInfo();

  const notify = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleSave = async (formData) => {
    setSaving(true);
    try {
      if (editing) { await updateProduct(editing.id, formData); notify('Product updated ✓'); }
      else         { await createProduct(formData);             notify('Product added ✓');   }
      await refetch(); setView('list'); setEditing(null);
    } catch (err) { notify('Error: ' + err.message); }
    finally { setSaving(false); }
  };

  const handleToggle = async (p) => {
    try { await toggleProductActive(p.id, p.isActive); notify(`Product ${p.isActive ? 'disabled' : 'enabled'} ✓`); await refetch(); }
    catch (err) { notify('Error: ' + err.message); }
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try { await deleteProduct(p.id, p.images || []); notify('Deleted ✓'); await refetch(); }
    catch (err) { notify('Error: ' + err.message); }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const stats = [
    { label: 'Total',    value: products.length,                          color: 'bg-blue-50   text-blue-800'  },
    { label: 'Active',   value: products.filter(p=>p.isActive).length,   color: 'bg-green-50  text-green-800' },
    { label: 'Disabled', value: products.filter(p=>!p.isActive).length,  color: 'bg-red-50    text-red-800'   },
    { label: 'Low Stock (<10)', value: products.filter(p=>p.stock<10).length, color: 'bg-yellow-50 text-yellow-800' },
  ];

  /* ── Add/Edit view ─────────────────────────────────────────────────────── */
  if (view === 'add' || view === 'edit') return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-neutral-900 text-white px-6 py-4 flex items-center gap-4">
        <button onClick={() => { setView('list'); setEditing(null); }} className="text-neutral-300 hover:text-white text-sm">← Back</button>
        <h1 className="text-xl font-black uppercase">{view === 'add' ? 'Add New Product' : `Edit: ${editing?.name}`}</h1>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <ProductForm initial={editing} onSave={handleSave} onCancel={() => { setView('list'); setEditing(null); }} loading={saving} />
        </div>
      </div>
    </div>
  );

  /* ── List view ─────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Sticky header */}
      <div className="bg-neutral-900 text-white px-6 py-4 sticky top-0 z-30 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black uppercase">BuildMart Admin</h1>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-xs text-neutral-400">
              🔴 Live Firestore · Project: {firebaseInfo.projectId}
            </p>
            <p className="text-xs text-green-400">
              👤 {user?.email}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setEditing(null); setView('add'); }}
            className="bg-construction-yellow text-neutral-900 font-bold px-4 py-2 rounded-lg text-sm hover:bg-construction-orange transition-colors border-2 border-neutral-900">
            + Add Product
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors border-2 border-red-800">
            Logout
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 bg-neutral-900 text-white px-4 py-3 rounded-lg shadow-xl text-sm">
          {toast}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-2 border-red-500 text-red-700 px-6 py-4 rounded-xl">
            <p className="font-bold mb-2">⚠️ Error Loading Products</p>
            <p className="text-sm">{error}</p>
            <button 
              onClick={refetch}
              className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold">
              Retry
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(s => (
            <div key={s.label} className={`rounded-xl p-4 border ${s.color}`}>
              <p className="text-3xl font-black">{s.value}</p>
              <p className="text-sm font-semibold mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <input className="w-full border-2 border-neutral-200 rounded-lg px-4 py-2 text-sm focus:border-construction-yellow focus:outline-none"
          placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} />

        {/* Table */}
        {loading ? (
          <div className="text-center py-12 text-neutral-400">Loading…</div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200 text-left">
                    {['','Name','Category','Price (incl. GST)','Stock','Status','Actions'].map(h => (
                      <th key={h} className="px-4 py-3 font-bold text-neutral-700 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => {
                    const total    = p.basePrice * (1 + p.gstPercentage / 100);
                    const lowStock = p.stock < 10;
                    return (
                      <tr key={p.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                        <td className="px-4 py-3">
                          {p.images && p.images.length > 0
                            ? <img src={p.images[0].url} alt={p.name} className="w-12 h-12 object-cover rounded-lg" loading="lazy" />
                            : p.imageUrl
                            ? <img src={p.imageUrl} alt={p.name} className="w-12 h-12 object-cover rounded-lg" loading="lazy" />
                            : <div className="w-12 h-12 bg-neutral-200 rounded-lg flex items-center justify-center text-xl">📦</div>
                          }
                        </td>
                        <td className="px-4 py-3 max-w-xs">
                          <p className="font-semibold text-neutral-900 truncate">{p.name}</p>
                          <p className="text-xs text-neutral-400">{p.unit}</p>
                        </td>
                        <td className="px-4 py-3 text-neutral-600 whitespace-nowrap">{p.category}</td>
                        <td className="px-4 py-3">
                          <p className="font-bold">₹{total.toFixed(0)}</p>
                          <p className="text-xs text-neutral-400">₹{p.basePrice} + {p.gstPercentage}% GST</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`font-bold ${lowStock ? 'text-red-600' : 'text-green-600'}`}>{p.stock}</span>
                          {lowStock && <p className="text-xs text-red-500">Low stock</p>}
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => handleToggle(p)}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${p.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300'}`}>
                            {p.isActive ? '● Active' : '○ Disabled'}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => { setEditing(p); setView('edit'); }}
                              className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1.5 rounded-lg font-semibold">Edit</button>
                            <button onClick={() => handleDelete(p)}
                              className="text-xs bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1.5 rounded-lg font-semibold">Delete</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={7} className="text-center py-12 text-neutral-400">
                      No products found.{' '}
                      <button onClick={() => { setEditing(null); setView('add'); }} className="text-construction-yellow font-semibold underline">Add one</button>
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
