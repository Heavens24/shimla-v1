import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'

function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [accountType, setAccountType] = useState('individual') // default to worker
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signup } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    try {
      setError('')
      setLoading(true)
      const { user } = await signup(email, password)
      
      // Create user doc with accountType
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        accountType: accountType, // 'individual', 'business', or 'client'
        createdAt: new Date(),
        verified: false,
        profileComplete: accountType === 'client' // clients don’t need onboarding
      })
      
      // Route based on account type
      if (accountType === 'client') {
        navigate('/') // Clients go straight to dashboard
      } else {
        navigate('/onboarding') // Workers/Businesses complete profile first
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Shimla Account</h1>
          <p className="text-slate-400">Join South Africa’s trusted service platform</p>
        </div>

        {/* Account Type Toggle */}
        <div className="flex gap-3 mb-6 bg-slate-800 p-1.5 rounded-xl">
          <button
            type="button"
            onClick={() => setAccountType('individual')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${
              accountType === 'individual'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-transparent text-slate-400 hover:text-white'
            }`}
          >
            I'm a Worker
          </button>
          <button
            type="button"
            onClick={() => setAccountType('client')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${
              accountType === 'client'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-transparent text-slate-400 hover:text-white'
            }`}
          >
            I Need Work Done
          </button>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="bg-slate-800 border-slate-700 rounded-2xl p-6 space-y-5">
          {error && (
            <div className="bg-red-600/20 border-red-600 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3.5 bg-slate-900 border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-blue-600 focus:outline-none transition"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Password - min 6 characters</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6"
              className="w-full p-3.5 bg-slate-900 border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-blue-600 focus:outline-none transition"
              placeholder="••••"
            />
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3.5 rounded-xl font-bold transition"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>

          <p className="text-center text-slate-400 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold">
              Log in
            </Link>
          </p>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-500 text-xs">
            By signing up you agree to Shimla’s Terms of Service
          </p>
        </div>
      </div>
    </div>
  )
}

export default Signup