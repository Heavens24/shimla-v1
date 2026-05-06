import { useState, useEffect } from 'react'
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

function AdminPanel() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, pending, verified, paid, unpaid
  const [updating, setUpdating] = useState(null) // stores UID of user being updated

  const ADMIN_EMAIL = 'rasemetselebohang24@gmail.com'

  useEffect(() => {
    if (!currentUser || currentUser.email !== ADMIN_EMAIL) {
      navigate('/dashboard')
      return
    }
    fetchUsers()
  }, [currentUser, navigate])

  async function fetchUsers() {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'))
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setUsers(usersData)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching users:', error)
      setLoading(false)
    }
  }

  async function toggleVerification(userId, currentStatus) {
    setUpdating(userId)
    try {
      await updateDoc(doc(db, 'users', userId), {
        verified: !currentStatus
      })
      setUsers(users.map(user => 
        user.id === userId ? { ...user, verified: !currentStatus } : user
      ))
    } catch (error) {
      console.error('Error updating verification:', error)
      alert('Failed to update. Try again.')
    }
    setUpdating(null)
  }

  async function markAsPaid(userId) {
    setUpdating(userId)
    const paidUntil = '2026-07-30' // 1 month from 30 June 2026
    try {
      await updateDoc(doc(db, 'users', userId), {
        paid: true,
        paidUntil: paidUntil
      })
      setUsers(users.map(user => 
        user.id === userId ? { ...user, paid: true, paidUntil: paidUntil } : user
      ))
      alert('Provider marked as paid until 30 July 2026')
    } catch (error) {
      console.error('Error marking as paid:', error)
      alert('Failed to update. Try again.')
    }
    setUpdating(null)
  }

  async function markAsUnpaid(userId) {
    setUpdating(userId)
    try {
      await updateDoc(doc(db, 'users', userId), {
        paid: false,
        paidUntil: null
      })
      setUsers(users.map(user => 
        user.id === userId ? { ...user, paid: false, paidUntil: null } : user
      ))
      alert('Provider marked as unpaid')
    } catch (error) {
      console.error('Error marking as unpaid:', error)
      alert('Failed to update. Try again.')
    }
    setUpdating(null)
  }

  // Filter users based on selected filter
  const filteredUsers = users.filter(user => {
    if (filter === 'pending') return !user.verified && user.accountType !== 'client'
    if (filter === 'verified') return user.verified && user.accountType !== 'client'
    if (filter === 'paid') return user.paid === true
    if (filter === 'unpaid') return (user.accountType === 'individual' || user.accountType === 'business') && user.paid !== true
    return true
  })

  // Stats
  const totalProviders = users.filter(u => u.accountType === 'individual' || u.accountType === 'business').length
  const verifiedProviders = users.filter(u => u.verified && u.accountType !== 'client').length
  const paidProviders = users.filter(u => u.paid === true).length
  const pendingVerification = users.filter(u => !u.verified && u.accountType !== 'client').length

  if (loading) return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-400">Loading admin panel...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Shimla Admin Panel</h1>
            <p className="text-slate-400">Manage providers, verification, and payments</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg font-semibold transition"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800 border-slate-700 rounded-2xl p-4">
            <p className="text-slate-400 text-sm">Total Providers</p>
            <p className="text-3xl font-bold mt-1">{totalProviders}</p>
          </div>
          <div className="bg-slate-800 border-slate-700 rounded-2xl p-4">
            <p className="text-slate-400 text-sm">Verified</p>
            <p className="text-3xl font-bold mt-1 text-green-400">{verifiedProviders}</p>
          </div>
          <div className="bg-slate-800 border-slate-700 rounded-2xl p-4">
            <p className="text-slate-400 text-sm">Paid</p>
            <p className="text-3xl font-bold mt-1 text-blue-400">{paidProviders}</p>
          </div>
          <div className="bg-slate-800 border-slate-700 rounded-2xl p-4">
            <p className="text-slate-400 text-sm">Pending Review</p>
            <p className="text-3xl font-bold mt-1 text-yellow-400">{pendingVerification}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['all', 'pending', 'verified', 'paid', 'unpaid'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-semibold transition capitalize ${
                filter === f 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Users Table */}
        <div className="bg-slate-800 border-slate-700 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900 border-b border-slate-700">
                <tr>
                  <th className="text-left p-4 font-semibold">Provider</th>
                  <th className="text-left p-4 font-semibold">Type</th>
                  <th className="text-left p-4 font-semibold">Location</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                  <th className="text-left p-4 font-semibold">Payment</th>
                  <th className="text-left p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id} className="border-b border-slate-700 hover:bg-slate-750 transition">
                    <td className="p-4">
                      <div>
                        <p className="font-semibold">{user.companyName || user.email}</p>
                        <p className="text-slate-400 text-xs">{user.email}</p>
                        <p className="text-slate-500 text-xs font-mono">{user.id.slice(0, 8)}...</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-slate-300 capitalize">{user.accountType || 'N/A'}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-slate-300">{user.location || 'N/A'}</span>
                    </td>
                    <td className="p-4">
                      {user.verified ? (
                        <span className="bg-green-600/20 text-green-400 px-3 py-1 rounded-full text-xs font-semibold">
                          Verified
                        </span>
                      ) : (
                        <span className="bg-yellow-600/20 text-yellow-400 px-3 py-1 rounded-full text-xs font-semibold">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {user.paid ? (
                        <div>
                          <span className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-xs font-semibold">
                            Paid
                          </span>
                          <p className="text-slate-400 text-xs mt-1">
                            Until {new Date(user.paidUntil).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      ) : (
                        <span className="bg-slate-700 text-slate-400 px-3 py-1 rounded-full text-xs font-semibold">
                          Unpaid
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        {/* Verification Toggle */}
                        {user.accountType !== 'client' && (
                          <button
                            onClick={() => toggleVerification(user.id, user.verified)}
                            disabled={updating === user.id}
                            className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                              user.verified 
                                ? 'bg-red-600 hover:bg-red-700' 
                                : 'bg-green-600 hover:bg-green-700'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {updating === user.id ? '...' : user.verified ? 'Revoke' : 'Verify'}
                          </button>
                        )}
                        
                        {/* Payment Toggle - Only for Providers */}
                        {(user.accountType === 'individual' || user.accountType === 'business') && (
                          user.paid ? (
                            <button
                              onClick={() => markAsUnpaid(user.id)}
                              disabled={updating === user.id}
                              className="px-3 py-2 rounded-lg text-sm font-semibold transition bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {updating === user.id ? '...' : 'Mark Unpaid'}
                            </button>
                          ) : (
                            <button
                              onClick={() => markAsPaid(user.id)}
                              disabled={updating === user.id}
                              className="px-3 py-2 rounded-lg text-sm font-semibold transition bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {updating === user.id ? '...' : 'Mark Paid'}
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-slate-400">No users found for this filter.</p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-slate-800 border-slate-700 rounded-2xl p-5">
          <h3 className="text-lg font-bold mb-3">Beta Payment Workflow</h3>
          <ol className="text-slate-300 text-sm space-y-2 list-decimal list-inside">
            <li>Provider pays R10 via Paystack and sends you receipt + Firebase UID on WhatsApp</li>
            <li>Find provider in this table using their email or UID</li>
            <li>Click <span className="text-blue-400 font-semibold">“Mark Paid”</span> button</li>
            <li>Provider’s dashboard updates instantly - green badge shows, R10 banner disappears</li>
            <li>Payment is valid until <span className="text-green-400 font-semibold">30 July 2026</span></li>
          </ol>
        </div>
      </div>
    </div>
  )
}

export default AdminPanel