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
    if (loading || !userData) return
    
    const isAdmin = currentUser?.email === 'rasemetselebohang24@gmail.com'
    const accountType = userData.accountType
    
    // Only providers need profile complete check
    if ((accountType === 'individual' || accountType === 'business') && !isAdmin) {
      const isIncomplete = !userData.name || !userData.surname || !userData.location
      if (isIncomplete) {
        navigate('/onboarding')
        return
      }
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

  if (loading) return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">Loading...</div>
  
  const isAdmin = currentUser?.email === 'rasemetselebohang24@gmail.com'

  // ADMIN VIEW
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white border-gray-200 rounded-3xl shadow-xl p-8 mb-8">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl shadow-lg flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                  <p className="text-gray-600 mt-1">Manage providers and clients with ease</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Link 
                  to="/admin"
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-5 py-3 rounded-xl font-semibold shadow-lg shadow-purple-600/30 transition transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  ← Back to Admin Panel
                </Link>
                <button 
                  onClick={handleLogout}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-3 rounded-xl font-semibold transition"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 rounded-3xl shadow-lg p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-blue-900 mb-2">Admin Account</h2>
                <p className="text-blue-800">You don’t need to complete onboarding or payments. Use the Admin Panel to manage all providers and clients with full control.</p>
              </div>
            </div>
          </div>
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

  // VERIFICATION GATE - Only for providers
  const isProfileComplete = userData.name && userData.surname && userData.location && userData.skills?.length > 0
  if ((isIndividual || isBusiness) && isProfileComplete && !isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white border-gray-200 rounded-3xl shadow-2xl p-8 text-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <svg className="w-10 h-10 text-blue-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-md"></div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3">Profile Under Review</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Thank you for joining Shimla! Our team is carefully reviewing your provider profile to ensure quality and safety for our community. 
              <span className="font-semibold text-gray-900"> This usually takes 24 hours.</span>
            </p>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 rounded-2xl p-5 mb-6 text-left">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm font-semibold text-blue-900">Your Firebase UID</p>
              </div>
              <div className="bg-white border-gray-200 rounded-xl p-3 mb-3">
                <p className="font-mono text-sm text-gray-900 break-all">{currentUser?.uid}</p>
              </div>
              <button
                onClick={copyUID}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {copySuccess ? '✓ Copied to Clipboard!' : 'Copy UID'}
              </button>
            </div>

            <button 
              onClick={handleLogout}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    )
  }

  // CLIENT DASHBOARD
  if (isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {userData.name || 'Client'}</h1>
              <p className="text-gray-600">Find trusted service providers near you</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-3 rounded-xl font-semibold transition"
            >
              Logout
            </button>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 rounded-3xl shadow-xl p-8 mb-8">
            <div className="flex items-start gap-4">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-4 rounded-2xl shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-blue-900 mb-2">Browse Service Providers</h2>
                <p className="text-blue-800 mb-5">Connect with verified electricians, plumbers, mechanics, tutors and more in your area.</p>
                <Link
                  to="/browse"
                  className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3.5 rounded-xl font-semibold shadow-lg shadow-blue-600/30 transition transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Start Browsing →
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white border-gray-200 rounded-3xl shadow-lg p-8 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-5">Your Profile</h3>
            <div className="grid grid-cols-2 gap-6 text-gray-700">
              <div>
                <p className="text-sm text-gray-500 mb-1">Name</p>
                <p className="font-medium text-gray-900">{userData.name} {userData.surname}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Email</p>
                <p className="font-medium text-gray-900">{userData.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Phone</p>
                <p className="font-medium text-gray-900">{userData.phone || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Location</p>
                <p className="font-medium text-gray-900">{userData.location || 'Not set'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border-gray-200 rounded-3xl shadow-lg p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Providers</h3>
            <p className="text-gray-600">Feature coming soon: keep track of providers you’ve hired and rate them.</p>
          </div>
        </div>
      </div>
    )
  }

  // PROVIDER DASHBOARD - unchanged from your version
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex gap-3">
            <Link 
              to="/browse"
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-5 py-3 rounded-xl font-semibold shadow-lg shadow-green-600/30 transition transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Browse Providers
            </Link>
            <button 
              onClick={handleLogout}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-3 rounded-xl font-semibold transition"
            >
              Logout
            </button>
          </div>
        </div>

        {(isIndividual || isBusiness) && !isPaid && (
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300 rounded-2xl shadow-md p-5 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-yellow-900">Payment Required - R10</p>
                <p className="text-yellow-800 text-sm">Complete payment to appear in Browse for clients until 30 July 2026</p>
              </div>
              <a
                href="https://paystack.com/pay/shimla-beta-r10"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-white px-5 py-3 rounded-xl font-semibold shadow-lg shadow-yellow-600/30 transition transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Pay Now
              </a>
            </div>
          </div>
        )}

        <div className="bg-white border-gray-200 rounded-3xl shadow-xl p-8 mb-6">
          <div className="flex justify-between items-start mb-5">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{userData.name} {userData.surname}</h2>
              <p className="text-gray-600 capitalize mt-1">{userData.accountType}</p>
            </div>
            <div className="flex gap-2">
              {isVerified && (
                <span className="bg-green-50 text-green-700 px-4 py-2 rounded-xl text-sm font-semibold border-green-200">Verified</span>
              )}
              {isPaid ? (
                <span className="bg-green-50 text-green-700 px-4 py-2 rounded-xl text-sm font-semibold border-green-200">Active until 30 Jul</span>
              ) : (
                <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold">Unpaid</span>
              )}
            </div>
          </div>

          <div className="space-y-3 text-gray-700">
            <p><strong className="text-gray-900">Email:</strong> {userData.email}</p>
            <p><strong className="text-gray-900">Phone:</strong> {userData.phone}</p>
            <p><strong className="text-gray-900">Location:</strong> {userData.location}</p>
            {userData.skills && <p><strong className="text-gray-900">Skills:</strong> {userData.skills.join(', ')}</p>}
            {isBusiness && (
              <>
                <p><strong className="text-gray-900">Business:</strong> {userData.businessName}</p>
                <p><strong className="text-gray-900">Reg Number:</strong> {userData.businessRegNumber}</p>
                <p><strong className="text-gray-900">Type:</strong> {userData.businessType}</p>
              </>
            )}
          </div>
        </div>

        {(isIndividual || isBusiness) && (
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 rounded-3xl shadow-lg p-6">
            <p className="font-semibold text-blue-900 mb-2">Your Firebase UID</p>
            <p className="text-sm text-blue-800 mb-4">Send this to the admin on WhatsApp when you pay R10</p>
            <div className="flex gap-3">
              <input
                type="text"
                value={currentUser?.uid || ''}
                readOnly
                className="flex-1 bg-white border-gray-300 rounded-xl px-4 py-3 text-sm font-mono text-gray-900 shadow-sm"
              />
              <button
                onClick={copyUID}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-3 rounded-xl font-semibold shadow-lg shadow-blue-600/30 transition transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {copySuccess ? 'Copied!' : 'Copy UID'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}