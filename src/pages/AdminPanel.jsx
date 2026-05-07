import { useState, useEffect } from 'react'
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'

export default function AdminPanel() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [bulkLoading, setBulkLoading] = useState(false)
  const navigate = useNavigate()
  const { currentUser } = useAuth()

  // Admin protection
  useEffect(() => {
    if (currentUser?.email !== 'rasemetselebohang24@gmail.com') {
      navigate('/')
    }
  }, [currentUser, navigate])

  // Fetch ALL users
  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const querySnapshot = await getDocs(collection(db, 'users'))
      const usersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setUsers(usersData)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleVerified = async (userId, currentStatus) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        verified: !currentStatus
      })
      fetchUsers()
    } catch (error) {
      console.error('Error updating verification:', error)
      alert('Failed to update verification status')
    }
  }

  const togglePaid = async (userId, currentStatus) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        paid: !currentStatus
      })
      fetchUsers()
    } catch (error) {
      console.error('Error updating payment status:', error)
      alert('Failed to update payment status')
    }
  }

  const handleBulkRevoke = async () => {
    if (!window.confirm('Are you sure? This will remove payment access from ALL providers on 31 July 2026.')) {
      return
    }
    
    setBulkLoading(true)
    try {
      const providerUsers = users.filter(u => 
        (u.accountType === 'individual' || u.accountType === 'business') && u.paid === true
      )
      
      for (const user of providerUsers) {
        await updateDoc(doc(db, 'users', user.id), { paid: false })
      }
      
      alert(`Successfully revoked payment for ${providerUsers.length} providers`)
      fetchUsers()
    } catch (error) {
      console.error('Error in bulk revoke:', error)
      alert('Failed to bulk revoke payments')
    } finally {
      setBulkLoading(false)
    }
  }

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/login')
  }

  if (loading) return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">Loading users...</div>

  const providers = users.filter(u => u.accountType === 'individual' || u.accountType === 'business')
  const clients = users.filter(u => u.accountType === 'client')
  const paidProviders = providers.filter(u => u.paid === true)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-10">
        
        {/* Header Card */}
        <div className="bg-white border-gray-200 rounded-3xl shadow-xl p-8 mb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl shadow-lg flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-gray-600 mt-1">Manage all providers and clients</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link 
                to="/"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-3 rounded-xl font-semibold transition"
              >
                ← Back to Dashboard
              </Link>
              <button 
                onClick={handleLogout}
                className="bg-red-50 hover:bg-red-100 text-red-700 px-5 py-3 rounded-xl font-semibold transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-5 mb-8">
          <div className="bg-white border-gray-200 rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-gray-600 text-sm font-medium">Total Providers</p>
            </div>
            <p className="text-4xl font-bold text-gray-900">{providers.length}</p>
          </div>

          <div className="bg-white border-gray-200 rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-600 text-sm font-medium">Paid Providers</p>
            </div>
            <p className="text-4xl font-bold text-gray-900">{paidProviders.length}</p>
          </div>

          <div className="bg-white border-gray-200 rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <p className="text-gray-600 text-sm font-medium">Total Clients</p>
            </div>
            <p className="text-4xl font-bold text-gray-900">{clients.length}</p>
          </div>
        </div>

        {/* Bulk Revoke Card */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200 rounded-3xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-red-900 text-lg mb-1">Bulk Revoke - 31 July 2026</h3>
              <p className="text-red-800 text-sm">Remove payment access from all {paidProviders.length} paid providers</p>
            </div>
            <button
              onClick={handleBulkRevoke}
              disabled={bulkLoading || paidProviders.length === 0}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3.5 rounded-xl font-semibold shadow-lg shadow-red-600/30 transition transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {bulkLoading ? 'Processing...' : `Bulk Revoke (${paidProviders.length})`}
            </button>
          </div>
        </div>

        {/* Providers Table Card */}
        <div className="bg-white border-gray-200 rounded-3xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-8 py-5 border-b border-purple-200">
            <h2 className="text-xl font-bold text-purple-900">All Providers</h2>
            <p className="text-purple-800 text-sm mt-1">Verify new providers and manage payments</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Provider</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Location</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">ID Document</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Verified</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Paid</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Skills</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {providers.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{u.name} {u.surname}</p>
                        <p className="text-sm text-gray-500">{u.email}</p>
                        <p className="text-xs text-gray-400 font-mono mt-1">{u.id}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg">{u.accountType}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{u.location || '-'}</td>
                    
                    {/* ID Document Column */}
                    <td className="px-6 py-4">
                      {u.idDocumentURL ? (
                        <a 
                          href={u.idDocumentURL} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm underline"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View ID
                        </a>
                      ) : (
                        <span className="text-gray-400 text-sm">Not uploaded</span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleVerified(u.id, u.verified)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition transform hover:scale-105 ${
                          u.verified 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        {u.verified ? '✓ Verified' : 'Unverified'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => togglePaid(u.id, u.paid)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition transform hover:scale-105 ${
                          u.paid 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        {u.paid ? '✓ Paid' : 'Unpaid'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {u.skills ? u.skills.join(', ') : 'No skills'}
                      </span>
                    </td>
                  </tr>
                ))}
                {providers.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      No providers yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Clients Table Card */}
        <div className="bg-white border-gray-200 rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-8 py-5 border-b border-blue-200">
            <h2 className="text-xl font-bold text-blue-900">All Clients</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Phone</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {clients.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-semibold text-gray-900">{u.name} {u.surname}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{u.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{u.phone || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{u.location || '-'}</td>
                  </tr>
                ))}
                {clients.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                      No clients yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}