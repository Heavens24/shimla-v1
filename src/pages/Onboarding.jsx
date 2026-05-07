import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'

const SKILLS = [
  'Electrician', 'Welder', 'Mechanic', 'Plumber', 'House Call Barber',
  'Nail Technician', 'Painter', 'Carpenter', 'Gardener', 'Cleaner', 'Tutor', 'Other'
]

const SA_CITIES = [
  'Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth',
  'Bloemfontein', 'East London', 'Polokwane', 'Kimberley', 'Pietermaritzburg',
  'Nelspruit', 'Rustenburg', 'Vereeniging', 'Soweto', 'Other'
]

export default function Onboarding() {
  const { currentUser, userData } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [aboutLength, setAboutLength] = useState(0)

  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    phone: '',
    location: '',
    skills: [],
    hourlyRate: '',
    about: '',
    businessName: '',
    businessRegNumber: '',
    businessType: ''
  })

  useEffect(() => {
    if (userData) {
      navigate('/')
    }
  }, [userData, navigate])

  const handleSkillToggle = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }))
  }

  const handleAboutChange = (e) => {
    const text = e.target.value
    if (text.length <= 200) {
      setFormData(prev => ({ ...prev, about: text }))
      setAboutLength(text.length)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const isBusiness = userData?.accountType === 'business'
      
      const userProfile = {
        ...formData,
        email: currentUser.email,
        accountType: userData?.accountType || 'individual',
        verified: false,
        paid: false,
        createdAt: new Date().toISOString()
      }

      // Clean up business fields if not business
      if (!isBusiness) {
        delete userProfile.businessName
        delete userProfile.businessRegNumber  
        delete userProfile.businessType
      }

      await setDoc(doc(db, 'users', currentUser.uid), userProfile)
      navigate('/')
    } catch (err) {
      setError('Failed to create profile. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (!currentUser || !userData) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">Loading...</div>
  }

  const isBusiness = userData.accountType === 'business'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        
        {/* Header Card */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Your {isBusiness ? 'Business' : 'Provider'} Profile
          </h1>
          <p className="text-gray-600">
            {isBusiness 
              ? 'Complete your business profile to get verified on Shimla'
              : 'Complete your profile to get listed as a verified individual'}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white border-gray-200 rounded-3xl shadow-xl p-8">
          {error && (
            <div className="bg-red-50 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3.5 bg-gray-50 border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Surname</label>
                  <input
                    type="text"
                    required
                    value={formData.surname}
                    onChange={(e) => setFormData({...formData, surname: e.target.value})}
                    className="w-full px-4 py-3.5 bg-gray-50 border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                    placeholder="Doe"
                  />
                </div>
              </div>
            </div>

            {/* Business Information - Only for Business */}
            {isBusiness && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                    <input
                      type="text"
                      required
                      value={formData.businessName}
                      onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                      className="w-full px-4 py-3.5 bg-gray-50 border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                      placeholder="ABC Plumbing Services"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Business Registration Number</label>
                      <input
                        type="text"
                        required
                        value={formData.businessRegNumber}
                        onChange={(e) => setFormData({...formData, businessRegNumber: e.target.value})}
                        className="w-full px-4 py-3.5 bg-gray-50 border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                        placeholder="2020/123456/07"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Business Type</label>
                      <select
                        required
                        value={formData.businessType}
                        onChange={(e) => setFormData({...formData, businessType: e.target.value})}
                        className="w-full px-4 py-3.5 bg-gray-50 border-gray-300 rounded-xl text-gray-900 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                      >
                        <option value="">Select type</option>
                        <option value="Sole Proprietor">Sole Proprietor</option>
                        <option value="Partnership">Partnership</option>
                        <option value="Pty Ltd">Pty Ltd</option>
                        <option value="Non-Profit">Non-Profit</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Skills/Services - Only for Individual/Business */}
            {(userData.accountType === 'individual' || isBusiness) && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Skills/Services</h3>
                <p className="text-sm text-gray-600 mb-4">Select all that apply. Clients will filter by this.</p>
                <div className="grid grid-cols-3 gap-3">
                  {SKILLS.map(skill => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleSkillToggle(skill)}
                      className={`px-4 py-3 rounded-2xl border-2 text-sm font-medium transition transform hover:scale-[1.02] ${
                        formData.skills.includes(skill)
                          ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md shadow-blue-600/20'
                          : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Location & Contact */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Location & Contact</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City / Location</label>
                  <select
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full px-4 py-3.5 bg-gray-50 border-gray-300 rounded-xl text-gray-900 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                  >
                    <option value="">Select your city</option>
                    {SA_CITIES.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-2">This helps clients find you nearby</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone/WhatsApp Number</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3.5 bg-gray-50 border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                    placeholder="078 060 8202"
                  />
                  <p className="text-xs text-gray-500 mt-2">Clients will contact you on this number</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hourly Rate (ZAR) - Optional</label>
                  <input
                    type="number"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({...formData, hourlyRate: e.target.value})}
                    className="w-full px-4 py-3.5 bg-gray-50 border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                    placeholder="150"
                  />
                  <p className="text-xs text-gray-500 mt-2">You can discuss final price on WhatsApp</p>
                </div>
              </div>
            </div>

            {/* About You */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">About You</h3>
              <textarea
                value={formData.about}
                onChange={handleAboutChange}
                rows="4"
                maxLength="200"
                className="w-full px-4 py-3.5 bg-gray-50 border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition resize-none"
                placeholder="Tell clients about your experience, qualifications, areas you service..."
              />
              <p className="text-xs text-gray-500 mt-2 text-right">{aboutLength}/200 characters</p>
            </div>

            {/* Submit Button */}
            <div className="border-t border-gray-200 pt-6">
              <button
                type="submit"
                disabled={loading || formData.skills.length === 0}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3.5 rounded-xl font-semibold text-white shadow-lg shadow-blue-600/30 transition transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? 'Submitting...' : 'Submit for Verification'}
              </button>
              <p className="text-center text-gray-500 text-sm mt-3">
                Your profile will be reviewed within 24 hours before going live on Shimla
              </p>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}