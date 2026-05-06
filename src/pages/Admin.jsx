import { useEffect, useState } from 'react'
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'

function Admin() {
  const [pendingUsers, setPendingUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  // Only allow this email to access admin
  const ADMIN_EMAIL = 'rasemetselebohang24@gmail.com'

  useEffect(() => {
    if (currentUser?.email!== ADMIN_EMAIL) {
      navigate('/')
      return
    }

    async function fetchPending() {
      const q = query(
        collection(db, 'users'),
        where('profileComplete', '==', true),
        where('verified', '==', false)
      )
      const querySnapshot = await getDocs(q)
      const users = querySnapshot.docs.map(doc => ({
        id: doc.id,...doc.data()
      }))
      setPendingUsers(users)
      setLoading(false)
    }
    fetchPending()
  }, [currentUser, navigate])

  async function approveUser(userId) {
    await updateDoc(doc(db, 'users', userId), { verified: true })
    setPendingUsers(pendingUsers.filter(user => user.id!== userId))
  }

  if (currentUser?.email!== ADMIN_EMAIL) return null

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <nav className="bg-slate-800 border-b border-slate-700 p-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">Shimla Admin</Link>
        <div className="flex items-center gap-4">
          <Link to="/browse" className="text-slate-300 hover:text-white">Browse</Link>
          <button onClick={logout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold transition">
            Log Out
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Pending Verifications</h1>

        {loading? (
          <p className="text-slate-400">Loading pending users...</p>
        ) : pendingUsers.length === 0? (
          <div className="text-center py-10 bg-slate-800 rounded-lg">
            <p className="text-xl text-slate-400">No pending verifications</p>
            <p className="text-slate-500 mt-2">All caught up ✅</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingUsers.map(user => (
              <div key={user.id} className="bg-slate-800 border border-slate-700 rounded-lg p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold">{user.companyName || user.email}</h3>
                    <p className="text-slate-400 text-sm">
                      {user.accountType === 'business'? `CIPC: ${user.regNumber}` : 'Individual'}
                    </p>
                  </div>
                  <span className="text-xs bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full font-semibold">
                    PENDING
                  </span>
                </div>

                <p className="text-slate-300 mb-2">Skills: {user.skills?.join(', ')}</p>
                <p className="text-slate-400 text-sm mb-3">Phone: {user.phone}</p>
                {user.hourlyRate && <p className="text-green-400 mb-3">Rate: R{user.hourlyRate}/hr</p>}
                <p className="text-slate-400 text-sm mb-4 italic">"{user.bio}"</p>

                <button
                  onClick={() => approveUser(user.id)}
                  className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-semibold transition"
                >
                  Approve & List on Shimla
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Admin