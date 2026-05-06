import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'

function JobDetails() {
  const { id } = useParams()
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [applicants, setApplicants] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'jobs', id), async (snap) => {
      if (!snap.exists()) {
        navigate('/my-jobs')
        return
      }
      const jobData = { id: snap.id, ...snap.data() }
      setJob(jobData)

      // Load applicant profiles
      if (jobData.applicants?.length > 0) {
        const profiles = await Promise.all(
          jobData.applicants.map(async (uid) => {
            const userSnap = await getDoc(doc(db, 'users', uid))
            return { id: uid, ...userSnap.data() }
          })
        )
        setApplicants(profiles.filter(p => p.verified)) // Only show verified workers
      }
      setLoading(false)
    })
    return unsub
  }, [id, navigate])

  const pickWorker = async (workerId) => {
    if (job.clientId !== currentUser.uid) return
    await updateDoc(doc(db, 'jobs', id), {
      status: 'in_progress',
      hiredWorkerId: workerId
    })
  }

  if (loading) return <div className="min-h-screen bg-slate-900 text-white p-8">Loading...</div>
  if (!job) return null

  const isClient = job.clientId === currentUser.uid

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate('/my-jobs')} className="text-blue-400 hover:underline mb-6">
          ← Back to My Jobs
        </button>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold">{job.title}</h1>
              <p className="text-blue-400">{job.skill} • {job.location}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-green-400">R{job.budget}</p>
              <p className="text-sm text-slate-400 capitalize">{job.status}</p>
            </div>
          </div>
          <p className="text-slate-300">{job.description}</p>
        </div>

        {isClient && (
          <div>
            <h2 className="text-2xl font-bold mb-6">
              Applications ({applicants.length})
            </h2>
            
            {applicants.length === 0 ? (
              <p className="text-slate-400">No workers applied yet. Share your job link.</p>
            ) : (
              <div className="space-y-4">
                {applicants.map(worker => (
                  <div key={worker.id} className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold">
                          {worker.name} {worker.surname}
                          {worker.verified && <span className="text-blue-400 text-sm ml-2">✓ Verified</span>}
                        </h3>
                        <p className="text-slate-400">{worker.skills?.join(', ')}</p>
                        <p className="text-slate-400">{worker.location}</p>
                      </div>
                      
                      {job.status === 'open' && (
                        <button
                          onClick={() => pickWorker(worker.id)}
                          className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-semibold"
                        >
                          Hire Worker
                        </button>
                      )}
                      
                      {job.hiredWorkerId === worker.id && (
                        <div className="bg-green-600/20 text-green-300 px-4 py-2 rounded-lg">
                          Hired ✓
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default JobDetails