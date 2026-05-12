import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [accountType, setAccountType] = useState('client') // default to client
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    
    try {
      setError('')
      setLoading(true)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      
      // Create user document in Firestore with role
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: email,
        accountType: accountType,
        verified: false,
        paid: false,
        createdAt: new Date().toISOString()
      })
      
      // Redirect based on role
      if (accountType === 'client') {
        navigate('/dashboard')
      } else {
        navigate('/onboarding')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Logo + Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Shimla Account</h1>
          <p className="text-gray-600">Join South Africa’s trusted service platform</p>
        </div>

        {/* Signup Card */}
        <div className="bg-white border-gray-200 rounded-3xl shadow-xl p-8">
          {error && (
            <div className="bg-red-50 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Account Type Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">I am a</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAccountType('individual')}
                  className={`px-4 py-3.5 rounded-2xl border-2 font-semibold transition transform hover:scale-[1.02] ${
                    accountType === 'individual'
                      ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md shadow-blue-600/20'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="text-sm">I'm a Worker</div>
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType('client')}
                  className={`px-4 py-3.5 rounded-2xl border-2 font-semibold transition transform hover:scale-[1.02] ${
                    accountType === 'client'
                      ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md shadow-blue-600/20'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="text-sm">I Need Work Done</div>
                </button>
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3.5 bg-gray-50 border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                placeholder="you@example.com"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password - min 6 characters</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength="6"
                className="w-full px-4 py-3.5 bg-gray-50 border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                placeholder="••••"
              />
            </div>

            {/* Submit Button */}
            <button
              disabled={loading}
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3.5 rounded-xl font-semibold text-white shadow-lg shadow-blue-600/30 transition transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-gray-600 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
              Log in
            </Link>
          </p>

          {/* Terms */}
          <p className="text-center text-gray-500 text-xs mt-6">
            By signing up you agree to Shimla’s Terms of Service
          </p>
        </div>
      </div>
    </div>
  )
}