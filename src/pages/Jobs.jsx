import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot, updateDoc, doc, arrayUnion } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

function Jobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(null)
  const { currentUser, userData } = useAuth()

  useEffect(() => {
    console.log('Jobs - userData:', userData)

    const q = query(collection(db, 'jobs'), where('status', '==', 'open'))
    const unsub = onSnapshot(q, (snap) => {
      const jobList = snap.docs.map(d => ({ id: d.id,...d.data() }))
      console.log('All open jobs:', jobList)
      setJobs(jobList)
      setLoading(false)
    }, (err) => {
      console.error('Jobs query error:', err)
      setLoading(false)
    })
    return unsub
  }, [userData])

  const applyToJob = async (jobId) => {
    if (userData?.accountType!== 'worker') {
      alert('Only workers can apply')
      return
    }
    if (!userData?.verified) {
      alert('Admin must verify your profile first in /admin')
      return
    }

    setApplying(jobId)
    try {
      await updateDoc(doc(db, 'jobs', jobId), {
        applicants: arrayUnion(currentUser.uid)
      })
      alert('Applied successfully!')
    } catch (err) {
      alert('Failed to apply: ' + err.message)
    }
    setApplying(null)
  }

  if (loading) return <div className="min-h-screen bg-slate-900 text-white p-8">Loading jobs...</div>

  // Filter jobs by worker skills if worker has skills set
  const visibleJobs = userData?.accountType === 'worker' && userData?.skills?.length > 0
   ? jobs.filter(job => userData.skills.includes(job.skill))
    : jobs

  console.log('Visible jobs for worker:', visibleJobs)

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Open Jobs</h1>
          {userData?.accountType === 'worker' && (
            <p className="text-slate-400">
              Your skills: {userData?.skills?.join(', ') || 'None set yet'}
              {!userData?.verified && <span className="text-yellow-400 ml-4">⚠️ Awaiting admin verification</span>}
            </p>
          )}
        </div>

        {visibleJobs.length === 0? (
          <div className="text-center py-12">
            <p className="text-slate-400 mb-4">
              {userData?.accountType === 'worker' && userData?.skills?.length > 0
               ? `No open jobs for your skills: ${userData.skills.join(', ')}`
                : 'No open jobs right now.'}
            </p>
            <p className="text-slate-500 text-sm">Check back soon or try different skills in your profile.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {visibleJobs.map(job => {
              const hasApplied = job.applicants?.includes(currentUser?.uid)
              return (
                <div key={job.id} className="bg-slate-800 border-slate-700 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h2 className="text-xl font-bold">{job.title}</h2>
                      <p className="text-blue-400">{job.skill} • {job.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-400">R{job.budget}</p>
                      <p className="text-sm text-slate-400">{job.applicants?.length || 0} applied</p>
                    </div>
                  </div>

                  <p className="text-slate-300 mb-4">{job.description}</p>

                  {userData?.accountType === 'worker' && (
                    <div className="flex gap-3">
                      {hasApplied? (
                        <button disabled className="bg-green-600/50 px-6 py-2 rounded-lg cursor-not-allowed">
                          Applied ✓
                        </button>
                      ) : (
                        <button
                          onClick={() => applyToJob(job.id)}
                          disabled={applying === job.id ||!userData?.verified}
                          className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 px-6 py-2 rounded-lg font-semibold"
                        >
                          {applying === job.id
                           ? 'Applying...'
                            :!userData?.verified
                             ? 'Awaiting Verification'
                              : 'Apply'}
                        </button>
                      )}
                      <Link to={`/job/${job.id}`} className="bg-slate-700 hover:bg-slate-600 px-6 py-2 rounded-lg">
                        View Details
                      </Link>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Jobs