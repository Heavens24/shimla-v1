import { useState } from 'react'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../firebase'
import { Link } from 'react-router-dom'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    
    try {
      await sendPasswordResetEmail(auth, email)
      setMessage('Check your email for password reset link')
    } catch (err) {
      setError('Failed to reset password. Check if email is correct.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6">Reset Password</h1>
        
        {error && <p className="bg-red-500/20 text-red-300 p-3 rounded mb-4">{error}</p>}
        {message && <p className="bg-green-500/20 text-green-300 p-3 rounded mb-4">{message}</p>}
        
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:border-blue-500"
          />
          <button
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 py-3 rounded-lg font-semibold transition"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        
        <p className="text-center text-slate-400 mt-6">
          <Link to="/login" className="text-blue-400 hover:underline">Back to Login</Link>
        </p>
      </div>
    </div>
  )
}

export default ForgotPassword