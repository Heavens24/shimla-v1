import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'

export default function Dashboard() {
  const { currentUser, userData, loading } = useAuth()
  const navigate = useNavigate()
  const [copySuccess, setCopySuccess] = useState(false)

  useEffect(() => {
    const isAdmin = currentUser?.email === 'rasemetselebohang24@gmail.com'
    // Only redirect to onboarding if NOT admin and no userData
    if (!loading && !userData && !isAdmin) {
      navigate('/onboarding')
    }
  }, [loading, userData, currentUser, navigate])

  const copyUID = async () => {
    if (!currentUser?.uid) return
    try {
      await navigator.clipboard.writeText(currentUser.uid)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy UID:', err)
    }
  }

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/login')
  }

  if (loading) return <div className="p-8">Loading...</div>
  
  // Admin with no userData → show minimal admin dashboard
  if (!userData) {
    const isAdmin = currentUser?.email === 'rasemetselebohang24@gmail.com'
    if (isAdmin) {
      return (
        <div className="p-8 max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <div className="flex gap-3">
              <Link 
                to="/admin"
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
              >
                ← Back to Admin Panel
              </Link>
              <button 
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
          <div className="bg-blue-50 border-blue-200 p-6 rounded-lg">
            <p className="text-blue-900 font-semibold">Admin Account</p>
            <p className="text-blue-700">You don’t need to complete onboarding. Use the Admin Panel to manage providers.</p>
          </div>
        </div>
      )
    }
    return null
  }

  const isPaid = userData.paid === true
  const isVerified = userData.verified === true
  const isIndividual = userData.accountType === 'individual'
  const isBusiness = userData.accountType === 'business'
  const isClient = userData.accountType === 'client'
  const isAdmin = currentUser?.email === 'rasemetselebohang24@gmail.com'

  // VERIFICATION GATE: Workers/Businesses must be verified before seeing dashboard
  if ((isIndividual || isBusiness) && !isVerified) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800 border-slate-700 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-3">Profile Under Review</h2>
          <p className="text-slate-400 mb-6">
            Your provider profile is being reviewed by our admin team. This usually takes 24 hours.
          </p>
          <div className="bg-slate-900 border-slate-700 rounded-lg p-4 mb-6">
            <p className="text-sm text-slate-400 mb-2">Your Firebase UID</p>
            <p className="font-mono text-sm text-white break-all">{currentUser?.uid}</p>
          </div>
          <p className="text-slate-500 text-sm mb-6">
            Send this UID to the admin on WhatsApp after you complete the R10 payment.
          </p>
          <button 
            onClick={handleLogout}
            className="w-full bg-slate-700 hover:bg-slate-600 py-3 rounded-lg font-semibold transition"
          >
            Logout
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header with Admin Back Button + Logout */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-3">
          {isAdmin && (
            <Link 
              to="/admin"
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            >
              ← Back to Admin Panel
            </Link>
          )}
          <Link 
            to="/browse"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Browse Providers
          </Link>
          <button 
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Payment Status Banner - Only for Individual/Business providers */}
      {(isIndividual || isBusiness) && !isPaid && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold text-yellow-800">Payment Required - R10</p>
              <p className="text-yellow-700">Complete payment to appear in Browse for clients until 30 July 2026</p>
            </div>
            <a
              href="https://paystack.com/pay/shimla-beta-r10"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
            >
              Pay Now
            </a>
          </div>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-semibold">{userData.name} {userData.surname}</h2>
            <p className="text-gray-600 capitalize">{userData.accountType}</p>
          </div>
          <div className="flex gap-2">
            {isVerified && (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Verified</span>
            )}
            {isPaid ? (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Active until 30 Jul</span>
            ) : (
              <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">Unpaid</span>
            )}
          </div>
        </div>

        <div className="space-y-2 text-gray-700">
          <p><strong>Email:</strong> {userData.email}</p>
          <p><strong>Phone:</strong> {userData.phone}</p>
          <p><strong>Location:</strong> {userData.location}</p>
          {userData.skills && <p><strong>Skills:</strong> {userData.skills.join(', ')}</p>}
          {isBusiness && (
            <>
              <p><strong>Business:</strong> {userData.businessName}</p>
              <p><strong>Reg Number:</strong> {userData.businessRegNumber}</p>
              <p><strong>Type:</strong> {userData.businessType}</p>
            </>
          )}
        </div>
      </div>

      {/* Firebase UID Card */}
      <div className="bg-blue-50 border-blue-200 rounded-lg p-4 mb-6">
        <p className="font-semibold text-blue-900 mb-2">Your Firebase UID</p>
        <p className="text-sm text-blue-700 mb-3">Send this to the admin on WhatsApp when you pay R10</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={currentUser?.uid || ''}
            readOnly
            className="flex-1 border-blue-300 rounded px-3 py-2 bg-white text-sm font-mono"
          />
          <button
            onClick={copyUID}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            {copySuccess ? 'Copied!' : 'Copy UID'}
          </button>
        </div>
      </div>
    </div>
  )
}