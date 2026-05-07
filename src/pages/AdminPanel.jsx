import { useState, useEffect } from 'react'
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useNavigate, Link } from 'react-router-dom'

export default function AdminPanel() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [filter, setFilter] = useState('all')
  const navigate = useNavigate()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    const snapshot = await getDocs(collection(db, 'users'))
    setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    setLoading(false)
  }

  const toggleVerify = async (userId, currentStatus) => {
    await updateDoc(doc(db, 'users', userId), { verified: !currentStatus })
    fetchUsers()
  }

  const markPaid = async (userId, reference) => {
    if (!reference.trim()) {
      alert('Please enter Paystack reference')
      return
    }
    const paidUntil = new Date('2026-07-31')
    await updateDoc(doc(db, 'users', userId), {
      paid: true,
      paidUntil: paidUntil,
      paymentReference: reference.trim()
    })
    fetchUsers()
  }

  const revokePayment = async (userId) => {
    await updateDoc(doc(db, 'users', userId), {
      paid: false,
      paidUntil: null,
      paymentReference: null
    })
    fetchUsers()
  }

  const revokeAllPayments = async () => {
    if (!confirm('Are you sure? This will revoke payment for ALL providers. This cannot be undone.')) {
      return
    }
    
    setBulkLoading(true)
    const paidUsers = users.filter(u => u.paid === true)
    
    try {
      const promises = paidUsers.map(user => 
        updateDoc(doc(db, 'users', user.id), {
          paid: false,
          paidUntil: null,
          paymentReference: null
        })
      )
      await Promise.all(promises)
      alert(`Successfully revoked payment for ${paidUsers.length} providers`)
      fetchUsers()
    } catch (error) {
      alert('Error: ' + error.message)
    } finally {
      setBulkLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    if (filter === 'pending') return !user.verified && user.profileComplete
    if (filter === 'verified') return user.verified && !user.paid
    if (filter === 'paid') return user.paid === true
    if (filter === 'unpaid') return !user.paid
    return true
  })

  const paidUsers = users.filter(u => u.paid === true)
  const verifiedUsers = users.filter(u => u.verified === true)
  const pendingUsers = users.filter(u => !user.verified && user.profileComplete)

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header with Back Button - Using Link instead of navigate for reliability */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Shimla Admin Panel</h1>
          <p className="text-gray-600">Manage providers, verification, and payments</p>
        </div>
        <Link 
          to="/"
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 inline-block"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm">Total Providers</p>
          <p className="text-2xl font-bold">{users.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm">Verified</p>
          <p className="text-2xl font-bold">{verifiedUsers.length}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm">Paid</p>
          <p className="text-2xl font-bold">{paidUsers.length}</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm">Pending Review</p>
          <p className="text-2xl font-bold">{pendingUsers.length}</p>
        </div>
      </div>

      {/* Bulk Action */}
      {paidUsers.length > 0 && (
        <div className="bg-red-50 border-red-200 p-4 rounded-lg mb-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold text-red-900">31 July Expiry Action</p>
              <p className="text-sm text-red-700">{paidUsers.length} providers have active payments</p>
            </div>
            <button
              onClick={revokeAllPayments}
              disabled={bulkLoading}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400"
            >
              {bulkLoading ? 'Processing...' : 'Revoke All Payments'}
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        {['all', 'pending', 'verified', 'paid', 'unpaid'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg capitalize ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Users Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Provider</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Location</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Payment</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} className="border-t">
                <td className="px-4 py-3">
                  <p className="font-semibold">{user.name} {user.surname}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-xs text-gray-500">{user.id.substring(0, 8)}...</p>
                </td>
                <td className="px-4 py-3 capitalize">{user.accountType || 'N/A'}</td>
                <td className="px-4 py-3">{user.location || 'N/A'}</td>
                <td className="px-4 py-3">
                  <span className={`px-3 py-1 rounded-full text-sm ${user.verified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {user.verified ? 'Verified' : 'Pending'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {user.paid ? (
                    <div>
                      <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">Paid</span>
                      <p className="text-xs text-gray-500 mt-1">Until 30 Jul</p>
                    </div>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">Unpaid</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 flex-wrap">
                    {!user.verified && user.profileComplete && (
                      <button
                        onClick={() => toggleVerify(user.id, false)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        Verify
                      </button>
                    )}
                    {user.verified && (
                      <button
                        onClick={() => toggleVerify(user.id, true)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                      >
                        Revoke
                      </button>
                    )}
                    {user.paid ? (
                      <button
                        onClick={() => revokePayment(user.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                      >
                        Mark Unpaid
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Paystack ref"
                          id={`ref-${user.id}`}
                          className="border px-2 py-1 rounded text-sm w-28"
                        />
                        <button
                          onClick={() => markPaid(user.id, document.getElementById(`ref-${user.id}`).value)}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        >
                          Mark Paid
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Beta Payment Workflow */}
      <div className="mt-8 bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Beta Payment Workflow</h3>
        <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
          <li>Provider pays R10 via Paystack and sends you receipt + Firebase UID on WhatsApp</li>
          <li>Find provider in this table using their email or UID</li>
          <li>Click “Mark Paid” button</li>
          <li>Provider’s dashboard updates instantly - green badge shows, R10 banner disappears</li>
          <li>Payment is valid until 30 July 2026</li>
        </ol>
      </div>
    </div>
  )
}