import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Home, Users, CheckCircle, XCircle, LogOut, TrendingUp, DollarSign } from 'lucide-react';

// Make sure backend is running on 5000
const API_URL = 'http://localhost:5000/api';

export default function Dashboard({ onLogout }) {
  const [hostels, setHostels] = useState([]);
  const [stats, setStats] = useState({ total: 0, premium: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHostels();
  }, []);

  const fetchHostels = async () => {
    try {
      const res = await axios.get(`${API_URL}/hostels`);
      if (res.data.success) {
        const data = res.data.hostels;
        setHostels(data);
        
        // Calculate basic stats
        const premiumCount = data.filter(h => h.isPremium).length;
        // Mock revenue: ₹499 per premium listing per month
        const monthlyRevenue = premiumCount * 499;
        
        setStats({
          total: data.length,
          premium: premiumCount,
          revenue: monthlyRevenue
        });
      }
    } catch (err) {
      console.error('Failed to fetch hostels', err);
    } finally {
      setLoading(false);
    }
  };

  const togglePremium = async (id, currentStatus) => {
    try {
      // In production this requires an admin token header
      await axios.put(`${API_URL}/hostels/${id}`, { isPremium: !currentStatus });
      fetchHostels();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteHostel = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing permanently?')) return;
    try {
      await axios.delete(`${API_URL}/hostels/${id}`);
      fetchHostels();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f6fc] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col shadow-sm">
        <div className="p-6 flex items-center gap-3 border-b border-gray-50">
          <div className="w-8 h-8 bg-primary text-white rounded flex items-center justify-center font-bold">
            H
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">HostelSathi</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <a href="#" className="flex items-center gap-3 bg-purple-50 text-primary px-4 py-3 rounded-lg font-medium">
            <Home size={20} />
            Listings
          </a>
          <a href="#" className="flex items-center gap-3 text-gray-500 hover:bg-gray-50 px-4 py-3 rounded-lg font-medium transition-colors">
            <Users size={20} />
            Users
          </a>
        </nav>

        <div className="p-4 border-t border-gray-50">
          <button 
            onClick={onLogout}
            className="flex items-center gap-3 text-gray-500 hover:text-red-600 px-4 py-2 w-full transition-colors font-medium"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1">Manage platform listings and monitor revenue.</p>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
              <Home size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Listings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium">Premium Listings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.premium}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium">MRR (Premium)</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.revenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Listings Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Active Hostels</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">Hostel Name</th>
                  <th className="px-6 py-4 font-medium">Owner</th>
                  <th className="px-6 py-4 font-medium">Rent (Start)</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">Loading listings...</td>
                  </tr>
                ) : hostels.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No hostels found.</td>
                  </tr>
                ) : (
                  hostels.map(hostel => (
                    <tr key={hostel._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{hostel.name}</div>
                        <div className="text-sm text-gray-500">{hostel.address.substring(0, 30)}...</div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{hostel.ownerName || 'Unknown'}</td>
                      <td className="px-6 py-4 text-gray-700 font-medium">
                        ₹{hostel.rent?.sharing2 || hostel.rent?.single || 0}
                      </td>
                      <td className="px-6 py-4">
                        {hostel.isPremium ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                            <CheckCircle size={14} /> Premium
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                            Standard
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => togglePremium(hostel._id, hostel.isPremium)}
                          className="text-sm font-medium text-primary hover:text-secondary mr-4"
                        >
                          Toggle Premium
                        </button>
                        <button 
                          onClick={() => deleteHostel(hostel._id)}
                          className="text-sm font-medium text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
