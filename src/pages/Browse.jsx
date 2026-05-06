import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'

function Browse() {
  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSkill, setSelectedSkill] = useState('All')
  const { userData } = useAuth()

  const skills = ['All', 'Electrician', 'Plumber', 'Carpenter', 'Mechanic', 'Cleaner', 'Painter', 'Gardener', 'Tutor', 'Barber', 'Nail Technician']

  useEffect(() => {
    const q = query(
      collection(db, 'users'),
      where('accountType', 'in', ['individual', 'business']),
      where('verified', '==', true)
    )
    const unsub = onSnapshot(q, (snap) => {
      setProviders(snap.docs.map(d => ({ id: d.id,...d.data() })))
      setLoading(false)
    }, (err) => {
      console.error('Failed to load providers:', err)
      setLoading(false)
    })
    return unsub
  }, [])

  const filteredProviders = selectedSkill === 'All'
  ? providers
    : providers.filter(p => p.skills?.includes(selectedSkill))

  const formatPhoneForWhatsApp = (phone) => {
    if (!phone) return ''
    let cleaned = phone.replace(/\s+/g, '').replace(/\+/g, '')
    if (cleaned.startsWith('0')) cleaned = '27' + cleaned.slice(1)
    if (!cleaned.startsWith('27')) cleaned = '27' + cleaned
    return cleaned
  }

  const getInitials = (name, surname) => {
    return `${name?.[0] || ''}${surname?.[0] || ''}`.toUpperCase()
  }

  const getWhatsAppMessage = (providerName, skill, location) => {
    const firstName = providerName?.split(' ')[0] || 'there'
    const serviceText = skill === 'All'? 'your services' : skill.toLowerCase()
    const locationText = location || 'your area'

    return `Hi ${firstName}, I found you on Shimla and I’m looking for help with ${serviceText} in ${locationText}. Are you available?`
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-400">Loading providers...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => window.history.back()} className="text-slate-400 hover:text-white transition">
              ← Back
            </button>
            <h1 className="text-lg font-bold">Shimla</h1>
            <div className="w-12"></div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold">Verified Service Providers in South Africa</h2>
          <p className="text-slate-400 text-sm mt-1">{filteredProviders.length} providers available nationwide</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Skill Filter */}
        <div className="mb-8 overflow-x-auto pb-2 -mx-4 px-4">
          <div className="flex gap-2 w-max">
            {skills.map(skill => (
              <button
                key={skill}
                onClick={() => setSelectedSkill(skill)}
                className={`px-4 py-2.5 rounded-full font-medium whitespace-nowrap transition ${
                  selectedSkill === skill
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        {/* Providers Grid */}
        {filteredProviders.length === 0? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔍</span>
            </div>
            <h3 className="text-xl font-bold mb-2">No providers found</h3>
            <p className="text-slate-400">We don’t have verified {selectedSkill.toLowerCase()}s in your area yet.</p>
            <p className="text-slate-500 text-sm mt-2">Try another skill or check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProviders.map(provider => {
              const fullName = `${provider.name || ''} ${provider.surname || ''}`.trim()
              const displayName = fullName || 'Provider'
              const location = provider.location || 'South Africa'
              const whatsappMessage = encodeURIComponent(getWhatsAppMessage(fullName, selectedSkill, location))

              return (
                <div key={provider.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-5 hover:border-slate-600 transition">
                  {/* Provider Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-600/20">
                      {getInitials(provider.name, provider.surname) || 'P'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold truncate">
                          {displayName}
                        </h3>
                        <span className="bg-blue-600/20 text-blue-400 text-xs px-2 py-0.5 rounded-full font-semibold whitespace-nowrap">
                          ✓ Verified
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm capitalize">{provider.accountType}</p>
                    </div>
                  </div>

                  {/* Provider Details */}
                  <div className="space-y-3 mb-5">
                    <div className="flex flex-wrap gap-2">
                      {provider.skills?.map((skill, idx) => (
                        <span key={idx} className="bg-slate-700 text-blue-400 text-xs px-3 py-1 rounded-full font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 text-slate-300">
                      <span>📍</span>
                      <span className="text-sm">{location}</span>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-green-400">R{provider.hourlyRate || '--'}</span>
                      <span className="text-slate-400 text-sm">/hour</span>
                    </div>

                    {provider.bio && (
                      <p className="text-slate-400 text-sm line-clamp-2">{provider.bio}</p>
                    )}
                  </div>

                  {/* Contact Actions */}
                  {userData?.accountType === 'client' && provider.phone? (
                    <div className="grid grid-cols-2 gap-3">
                      <a
                        href={`https://wa.me/${formatPhoneForWhatsApp(provider.phone)}?text=${whatsappMessage}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 active:scale-95 px-4 py-3 rounded-xl font-semibold transition"
                      >
                        <span>💬</span>
                        <span>WhatsApp</span>
                      </a>
                      <a
                        href={`tel:${provider.phone}`}
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 px-4 py-3 rounded-xl font-semibold transition"
                      >
                        <span>📞</span>
                        <span>Call</span>
                      </a>
                    </div>
                  ) : userData?.accountType!== 'client'? (
                    <div className="bg-slate-900/50 border-slate-700 rounded-xl p-3 text-center">
                      <p className="text-slate-500 text-sm">Sign up as a Client to contact providers</p>
                    </div>
                  ) : (
                    <div className="bg-slate-900/50 border-slate-700 rounded-xl p-3 text-center">
                      <p className="text-slate-500 text-sm">Phone number not available</p>
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

export default Browse