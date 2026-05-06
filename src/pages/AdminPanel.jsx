import { useState, useEffect } from 'react'
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore'
import { db } from '../firebase'

export default function AdminPanel() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [bulkLoading, setBulkLoading] = useState(false)

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

  const paidUsers = users.filter(u => u.paid === true)
  const verifiedUsers = users.filter(u => u.verified === true)
  const pendingUsers = users.filter(u => !u.verified && u.profileComplete)

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm">Total Users</p>
          <p className="text-2xl font-bold">{users.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm">Verified</p>
          <p className="text-2xl font-bold">{verifiedUsers.length}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm">Paid Active</p>
          <p className="text-2xl font-bold">{paidUsers.length}</p>
        </div>
      </div>

      {/* Bulk Action - Only shows if there are paid users */}
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

      {/* Pending Verification */}
      {pendingUsers.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Pending Verification ({pendingUsers.length})</h2>
          <div className="space-y-3">
            {pendingUsers.map(user => (
              <div key={user.id} className="border p-4 rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-semibold">{user.name} {user.surname}</p>
                  <p className="text-sm text-gray-600">{user.email} • {user.accountType}</p>
                  <p className="text-sm text-gray-600">Skills: {user.skills?.join(', ')}</p>
                </div>
                <button
                  onClick={() => toggleVerify(user.id, false)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Verify
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Users */}
      <div>
        <h2 className="text-xl font-semibold mb-4">All Users</h2>
        <div className="space-y-3">
          {users.map(user => (
            <div key={user.id} className="border p-4 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold">{user.name} {user.surname}</p>
                  <p className="text-sm text-gray-600">{user.email} • {user.accountType}</p>
                  <p className="text-sm text-gray-600">UID: {user.id}</p>
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm ${user.verified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {user.verified ? 'Verified' : 'Not Verified'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm ${user.paid ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {user.paid ? 'Paid' : 'Unpaid'}
                  </span>
                </div>
              </div>
              
              {/* Payment Controls */}
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => toggleVerify(user.id, user.verified)}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                >
                  {user.verified ? 'Revoke Verify' : 'Verify'}
                </button>
                
                {user.paid ? (
                  <button
                    onClick={() => revokePayment(user.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                  >
                    Revoke Payment
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Paystack reference"
                      id={`ref-${user.id}`}
                      className="border px-2 py-1 rounded text-sm"
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
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}