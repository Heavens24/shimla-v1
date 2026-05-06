import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'

function RequestModal({ worker, onClose }) {
  const [jobDescription, setJobDescription] = useState('')
  const [budget, setBudget] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { currentUser } = useAuth()

  async function handleSubmit(e) {
    e.preventDefault()
    if (!jobDescription ||!budget) return

    setLoading(true)
    await addDoc(collection(db, 'requests'), {
      clientId: currentUser.uid,
      clientEmail: currentUser.email,
      workerId: worker.id,
      workerEmail: worker.email,
      workerSkill: worker.skills[0],
      description: jobDescription,
      budget: Number(budget),
      status: 'pending', // pending, accepted, completed, cancelled
      createdAt: serverTimestamp(),
      location: 'Bloemfontein'
    })
    setLoading(false)
    setSuccess(true)
    setTimeout(() => onClose(), 1500)
  }

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
        <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full text-center">
          <h3 className="text-2xl font-bold text-green-400 mb-2">Request Sent! 🎉</h3>
          <p className="text-slate-300">{worker.email.split('@')[0]} will be notified</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">Request {worker.email.split('@')[0]}</h3>
        <p className="text-slate-400 mb-4">Skills: {worker.skills?.join(', ')}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Job Description</label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Describe what you need done..."
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 h-24"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Budget (ZAR)</label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="500"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600 py-2 rounded-lg font-semibold transition"
            >
              Cancel
            </button>
            <button
              disabled={loading}
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 py-2 rounded-lg font-semibold transition"
            >
              {loading? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RequestModal