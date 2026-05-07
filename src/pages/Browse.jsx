import { useState, useEffect } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../firebase'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const SKILLS = [
  'All', 'Electrician', 'Plumber', 'Carpenter', 'Mechanic', 'Cleaner', 
  'Painter', 'Gardener', 'Tutor', 'Barber', 'Nail Technician', 'Welder'
]

export default function Browse() {
  const [providers, setProviders] = useState([])
  const [filteredProviders, setFilteredProviders] = useState([])
  const [selectedSkill, setSelectedSkill] = useState('All')
  const [loading, setLoading] = useState(true)
  const { currentUser, userData } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchProviders()
  }, [])

  useEffect(() => {
    if (selectedSkill === 'All') {
      setFilteredProviders(providers)
    } else {
      setFilteredProviders(providers.filter(p => p.skills?.includes(selectedSkill)))
    }
  }, [selectedSkill, providers])

  const fetchProviders = async () => {
    setLoading(true)
    try {
      const q = query(
        collection(db, 'users'),
        where('accountType', 'in', ['individual', 'business']),
        where('verified', '==', true),
        where('paid', '==', true)
      )
      const querySnapshot = await getDocs(q)
      const providersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setProviders(providersData)
      setFilteredProviders(providersData)
    } catch (error) {
      console.error('Error fetching providers:', error)
    } finally {
      setLoading(false)
    }
  }

  const isClient = userData?.accountType === 'client'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-10">
        
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium mb-4 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </Link>
          
          <div className="bg-white border-gray-200 rounded-3xl shadow-xl p-8">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Shimla</h1>
                <p className="text-gray-600">Verified Service Providers in South Africa</p>
              </div>
            </div>
            <p className="text-gray-700 font-medium">{providers.length} providers available nationwide</p>
          </div>
        </div>

        {/* Skill Filter Pills */}
        <div className="mb-8 overflow-x-auto pb-2">
          <div className="flex gap-3">
            {SKILLS.map(skill => (
              <button
                key={skill}
                onClick={() => setSelectedSkill(skill)}
                className={`px-5 py-3 rounded-2xl font-semibold text-sm whitespace-nowrap transition transform hover:scale-[1.05] ${
                  selectedSkill === skill
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 shadow-md'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Finding providers for you...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredProviders.length === 0 && (
          <div className="bg-white border-gray-200 rounded-3xl shadow-xl p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No providers found</h3>
            <p className="text-gray-600">Try selecting a different skill or check back later</p>
          </div>
        )}

        {/* Provider Cards Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProviders.map(provider => (
              <div key={provider.id} className="bg-white border-gray-200 rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition transform hover:-translate-y-1">
                
                {/* Card Header */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 px-6 py-4 border-b border-blue-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-md">
                        <span className="text-white font-bold text-lg">
                          {provider.name?.[0]?.toUpperCase() || 'P'}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{provider.name} {provider.surname}</h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="bg-green-50 text-green-700 px-2.5 py-1 rounded-lg text-xs font-semibold border-green-200">
                            ✓ Verified
                          </span>
                          <span className="text-xs text-gray-600 capitalize bg-white px-2.5 py-1 rounded-lg">
                            {provider.accountType}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  
                  {/* Trust Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {provider.idDocumentURL && (
                      <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl text-xs font-semibold border-blue-200 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        ID Verified
                      </span>
                    )}
                    {provider.paid && (
                      <span className="bg-green-50 text-green-700 px-3 py-1.5 rounded-xl text-xs font-semibold border-green-200 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Payment Verified
                      </span>
                    )}
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {provider.skills?.map(skill => (
                      <span key={skill} className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-xl text-sm font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-gray-700 mb-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm font-medium">{provider.location || 'South Africa'}</span>
                  </div>

                  {/* Rate */}
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-2xl font-bold text-gray-900">
                      R{provider.hourlyRate || '--'}
                    </span>
                    <span className="text-gray-600 text-sm">/hour</span>
                  </div>

                  {/* About */}
                  {provider.about && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {provider.about}
                    </p>
                  )}

                  {/* CTA for Non-Clients */}
                  {!isClient && (
                    <div className="bg-amber-50 border-amber-200 rounded-2xl p-4 text-center">
                      <p className="text-amber-800 text-sm font-medium mb-3">
                        Sign up as a Client to contact providers
                      </p>
                      <Link
                        to="/signup"
                        className="inline-block bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-amber-600/30 transition transform hover:scale-[1.02]"
                      >
                        Create Client Account
                      </Link>
                    </div>
                  )}

                  {/* Contact Button for Clients */}
                  {isClient && provider.phone && (
                    <a
                      href={`https://wa.me/${provider.phone.replace(/\s+/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-5 py-3.5 rounded-xl font-semibold shadow-lg shadow-green-600/30 transition transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.151-.172.2-.298.3-.495.099-.198.05-.372-.025-.52-.075-.148-.67-1.611-.916-2.206-.242-.579-.487-.5-.67-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.003.49 1.345.62.564.18 1.08.154 1.486.094.453-.067 1.385-.566 1.58-1.114.195-.548.195-1.019.136-1.117-.059-.099-.216-.159-.453-.308z"/>
                      </svg>
                      Contact on WhatsApp
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}