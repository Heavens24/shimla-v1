import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { doc, getDoc, collection, addDoc, query, where, getDocs, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'

function WorkerProfile() {
  const { id } = useParams()
  const [worker, setWorker] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { currentUser, userData } = useAuth()

  useEffect(() => {
    async function fetchData() {
      try {
        const workerDoc = await getDoc(doc(db, 'users', id))
        if (workerDoc.exists()) {
          setWorker({ id: workerDoc.id,...workerDoc.data() })
        }

        const q = query(collection(db, 'reviews'), where('workerId', '==', id))
        const querySnapshot = await getDocs(q)
        const reviewsData = querySnapshot.docs.map(doc => ({ id: doc.id,...doc.data() }))
        setReviews(reviewsData)
      } catch (err) {
        console.error('Error fetching worker:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  // Save to recent providers for clients
  useEffect(() => {
    if (currentUser && userData?.accountType === 'client' && worker && id) {
      setDoc(doc(db, 'users', currentUser.uid, 'recentProviders', id), {
        providerId: id,
        lastViewed: serverTimestamp()
      }, { merge: true }).catch(err => console.error('Error saving recent provider:', err))
    }
  }, [currentUser, userData, id, worker])

  const formatWhatsApp = (phone) => {
    if (!phone) return ''
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.startsWith('0')) return '27' + cleaned.slice(1)
    return cleaned
  }

  const avgRating = reviews.length
   ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  async function handleSubmitReview(e) {
    e.preventDefault()
    if (!currentUser ||!comment.trim()) return
    setSubmitting(true)

    try {
      await addDoc(collection(db, 'reviews'), {
        workerId: id,
        clientId: currentUser.uid,
        clientEmail: currentUser.email,
        rating,
        comment,
        createdAt: serverTimestamp()
      })

      setComment('')
      setRating(5)

      // Refresh reviews
      const q = query(collection(db, 'reviews'), where('workerId', '==', id))
      const querySnapshot = await getDocs(q)
      const reviewsData = querySnapshot.docs.map(doc => ({ id: doc.id,...doc.data() }))
      setReviews(reviewsData)
    } catch (err) {
      console.error('Error posting review:', err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center"><p>Loading...</p></div>
  if (!worker) return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center"><p>Worker not found</p></div>

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <nav className="bg-slate-800 border-b border-slate-700 p-4">
        <Link to="/browse" className="text-2xl font-bold">← Back to Browse</Link>
      </nav>

      <div className="max-w-3xl mx-auto p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">
                {worker.companyName || `${worker.name || ''} ${worker.surname || ''}`.trim()}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                {worker.verified && (
                  <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">✓ Verified</span>
                )}
                <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                  {worker.accountType === 'business'? 'Business' : 'Individual'}
                </span>
                {avgRating && (
                  <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">
                    ⭐ {avgRating} ({reviews.length} reviews)
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {worker.skills?.map(skill => (
              <span key={skill} className="text-sm bg-slate-700 text-slate-300 px-3 py-1 rounded">
                {skill}
              </span>
            ))}
          </div>

          <p className="text-slate-300 mb-4">{worker.about || worker.bio}</p>

          {worker.hourlyRate && (
            <p className="text-green-400 font-semibold text-xl mb-4">From R{worker.hourlyRate}/hr</p>
          )}

          <div className="flex gap-3">
            <a
              href={`https://wa.me/${formatWhatsApp(worker.phone)}?text=Hi, I found you on Shimla.`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold transition"
            >
              WhatsApp
            </a>
            <a
              href={`tel:${worker.phone}`}
              className="bg-slate-700 hover:bg-slate-600 px-6 py-3 rounded-lg font-semibold transition"
            >
              Call
            </a>
          </div>
        </div>

        <div className="bg-slate-800 border-slate-700 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Leave a Review</h2>
          {currentUser?.uid === id? (
            <p className="text-slate-400">You can't review yourself</p>
          ) : (
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block mb-2">Rating:</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-2xl ${star <= rating? 'text-yellow-400' : 'text-slate-600'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="How was the service?"
                className="w-full px-4 py-3 bg-slate-900 border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 h-24"
                required
              />
              <button
                disabled={submitting ||!comment.trim()}
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 px-6 py-2 rounded-lg font-semibold transition"
              >
                {submitting? 'Posting...' : 'Post Review'}
              </button>
            </form>
          )}
        </div>

        <div className="bg-slate-800 border-slate-700 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Reviews ({reviews.length})</h2>
          {reviews.length === 0? (
            <p className="text-slate-400">No reviews yet. Be the first!</p>
          ) : (
            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review.id} className="border-b border-slate-700 pb-4 last:border-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-yellow-400">{'★'.repeat(review.rating)}</span>
                    <span className="text-slate-400 text-sm">{review.clientEmail.split('@')[0]}</span>
                  </div>
                  <p className="text-slate-300">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default WorkerProfile