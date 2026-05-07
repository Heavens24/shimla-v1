import { useState, useEffect } from 'react'
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'

export default function Admin() {
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

  // Fetch ALL users - not just verified ones
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
      fetchUsers() // Refresh list
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
      fetchUsers() // Refresh list
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
      fetchUsers() // Refresh list
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

  if (loading) return <div className="p-8">Loading users...</div>

  const providers = users.filter(u => u.accountType === 'individual' || u.accountType === 'business')
  const clients = users.filter(u => u.accountType === 'client')
  const paidProviders = providers.filter(u => u.paid === true)

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <div className="flex gap-3">
          <Link 
            to="/"
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            ← Back to Dashboard
          </Link>
          <button 
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 border-blue-200 p-4 rounded-lg">
          <p className="text-blue-900 text-sm font-semibold">Total Providers</p>
          <p className="text-3xl font-bold text-blue-900">{providers.length}</p>
        </div>
        <div className="bg-green-50 border-green-200 p-4 rounded-lg">
          <p className="text-green-900 text-sm font-semibold">Paid Providers</p>
          <p className="text-3xl font-bold text-green-900">{paidProviders.length}</p>
        </div>
        <div className="bg-purple-50 border-purple-200 p-4 rounded-lg">
          <p className="text-purple-900 text-sm font-semibold">Total Clients</p>
          <p className="text-3xl font-bold text-purple-900">{clients.length}</p>
        </div>
      </div>

      {/* Bulk Revoke Button */}
      <div className="bg-red-50 border-red-200 p-4 rounded-lg mb-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-semibold text-red-900">Bulk Revoke - 31 July 2026</p>
            <p className="text-red-700 text-sm">Remove payment access from all {paidProviders.length} paid providers</p>
          </div>
          <button
            onClick={handleBulkRevoke}
            disabled={bulkLoading || paidProviders.length === 0}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
          >
            {bulkLoading ? 'Processing...' : `Bulk Revoke (${paidProviders.length})`}
          </button>
        </div>
      </div>

      {/* Providers Table */}
      <div className="bg-white border rounded-lg overflow-hidden mb-8">
        <div className="bg-gray-50 px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">All Providers</h2>
          <p className="text-gray-600 text-sm">Verify new providers and manage payments</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Location</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Verified</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Paid</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {providers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{user.name} {user.surname}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <p className="text-xs text-gray-400 font-mono">{user.id}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="capitalize text-sm text-gray-700">{user.accountType}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{user.location}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleVerified(user.id, user.verified)}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        user.verified 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {user.verified ? 'Verified' : 'Unverified'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => togglePaid(user.id, user.paid)}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        user.paid 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {user.paid ? 'Paid' : 'Unpaid'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">
                      {user.skills ? user.skills.join(', ') : 'No skills'}
                    </span>
                  </td>
                </tr>
              ))}
              {providers.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No providers yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">All Clients</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {clients.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{user.name} {user.surname}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{user.phone}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{user.location}</td>
                </tr>
              ))}
              {clients.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    No clients yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}