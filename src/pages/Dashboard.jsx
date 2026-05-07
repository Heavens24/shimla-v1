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
    if (!loading &&!userData &&!isAdmin) {
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

  const isAdmin = currentUser?.email === 'rasemetselebohang24@gmail.com'

  // ADMIN VIEW - Clean admin dashboard, no provider UI
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
          <p className="text-blue-900 font-semibold text-lg mb-2">Admin Account</p>
          <p className="text-blue-700">You don’t need to complete onboarding or payments. Use the Admin Panel to manage all providers and clients.</p>
        </div>
      </div>
    )
  }

  // If no userData and not admin → redirect handled in useEffect
  if (!userData) return null

  const isPaid = userData.paid === true
  const isVerified = userData.verified === true
  const isIndividual = userData.accountType === 'individual'
  const isBusiness = userData.accountType === 'business'
  const isClient = userData.accountType === 'client'

  // VERIFICATION GATE: Workers/Businesses must be verified before seeing dashboard
  if ((isIndividual || isBusiness) &&!isVerified) {
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

  // CLIENT DASHBOARD - Clean and simple
  if (isClient) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome, {userData.name || 'Client'}</h1>
            <p className="text-gray-600">Find trusted service providers near you</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        {/* Main Action Card */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 rounded-2xl p-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="bg-blue-600 p-3 rounded-xl">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-blue-900 mb-2">Browse Service Providers</h2>
              <p className="text-blue-800 mb-4">Connect with verified electricians, plumbers, mechanics, tutors and more in your area.</p>
              <Link
                to="/browse"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold transition"
              >
                Start Browsing →
              </Link>
            </div>
          </div>
        </div>

        {/* Profile Info Card */}
        <div className="bg-white border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Your Profile</h3>
          <div className="grid grid-cols-2 gap-4 text-gray-700">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{userData.name} {userData.surname}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{userData.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">{userData.phone || 'Not set'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-medium">{userData.location || 'Not set'}</p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-8 grid-cols-3 gap-4">
          <div className="bg-white border rounded-xl p-4 text-center">
            <div className="text-3xl mb-2">1</div>
            <p className="font-semibold text-gray-900">Browse</p>
            <p className="text-sm text-gray-600">Find providers by skill and location</p>
          </div>
          <div className="bg-white border rounded-xl p-4 text-center">
            <div className="text-3xl mb-2">2</div>
            <p className="font-semibold text-gray-900">Contact</p>
            <p className="text-sm text-gray-600">Reach out via WhatsApp</p>
          </div>
          <div className="bg-white border rounded-xl p-4 text-center">
            <div className="text-3xl mb-2">3</div>
            <p className="font-semibold text-gray-900">Hire</p>
            <p className="text-sm text-gray-600">Discuss price and get the job done</p>
          </div>
        </div>
      </div>
    )
  }

  // PROVIDER DASHBOARD - Existing provider view
  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-3">
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
      {(isIndividual || isBusiness) &&!isPaid && (
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
            {isPaid? (
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

      {/* Firebase UID Card - Only for providers */}
      {(isIndividual || isBusiness) && (
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
              {copySuccess? 'Copied!' : 'Copy UID'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}