import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useNavigate } from 'react-router-dom'

const SKILLS = [
  'Electrician', 'Welder', 'Mechanic', 'Plumber',
  'House Call Barber', 'Nail Technician', 'Painter',
  'Carpenter', 'Gardener', 'Cleaner', 'Tutor', 'Other'
]

const SA_CITIES = [
  'Bloemfontein', 'Johannesburg', 'Pretoria', 'Cape Town', 'Durban', 
  'Port Elizabeth', 'East London', 'Kimberley', 'Polokwane', 'Pietermaritzburg',
  'Other'
]

function Onboarding() {
  const [selectedSkills, setSelectedSkills] = useState([])
  const [bio, setBio] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [regNumber, setRegNumber] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [customLocation, setCustomLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { currentUser, userData } = useAuth()
  const navigate = useNavigate()

  const isBusiness = userData?.accountType === 'business'
  const finalLocation = location === 'Other' ? customLocation : location

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (selectedSkills.length === 0) {
      setError('Please select at least one skill')
      return
    }
    if (!phone.trim()) {
      setError('Phone number is required for clients to contact you')
      return
    }
    if (!finalLocation.trim()) {
      setError('Please select or enter your city/location')
      return
    }
    if (isBusiness && (!companyName.trim() || !regNumber.trim())) {
      setError('Company name and CIPC registration number are required for businesses')
      return
    }

    setLoading(true)
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        skills: selectedSkills,
        bio,
        hourlyRate: Number(hourlyRate) || 0,
        companyName: isBusiness ? companyName : null,
        regNumber: isBusiness ? regNumber : null,
        phone,
        location: finalLocation, // ← Now dynamic, not hardcoded
        verified: false, // Admin will verify later
        profileComplete: true,
        updatedAt: new Date()
      })
      navigate('/')
    } catch (err) {
      setError('Failed to save profile: ' + err.message)
      setLoading(false)
    }
  }

  const toggleSkill = (skill) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      <div className="max-w-2xl mx-auto pt-6 pb-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Complete Your Provider Profile</h1>
          <p className="text-slate-400">
            {isBusiness 
              ? 'Register your business to get listed as a verified service provider' 
              : 'Complete your profile to get listed as a verified individual'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-600/20 border-red-600 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Business Fields */}
          {isBusiness && (
            <div className="bg-slate-800 border-slate-700 rounded-2xl p-5 space-y-4">
              <h3 className="text-lg font-bold mb-2">Business Details</h3>
              <input
                type="text"
                placeholder="Company Name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-900 border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 transition"
                required
              />
              <input
                type="text"
                placeholder="CIPC Registration Number"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-900 border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 transition"
                required
              />
            </div>
          )}

          {/* Skills Selection */}
          <div className="bg-slate-800 border-slate-700 rounded-2xl p-5">
            <label className="block text-lg font-semibold mb-4">Your Skills/Services</label>
            <p className="text-slate-400 text-sm mb-4">Select all that apply. Clients will filter by this.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {SKILLS.map(skill => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`p-3 rounded-xl text-sm font-medium transition ${
                    selectedSkills.includes(skill)
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {/* Location + Contact + Rate */}
          <div className="bg-slate-800 border-slate-700 rounded-2xl p-5 space-y-4">
            <h3 className="text-lg font-bold mb-2">Location & Contact</h3>
            
            {/* Location */}
            <div>
              <label className="block text-sm font-semibold mb-2">City / Location</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-900 border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 transition text-white"
                required
              >
                <option value="">Select your city</option>
                {SA_CITIES.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              {location === 'Other' && (
                <input
                  type="text"
                  placeholder="Enter your city/town"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  className="w-full mt-3 px-4 py-3.5 bg-slate-900 border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 transition"
                  required
                />
              )}
              <p className="text-slate-500 text-xs mt-2">This helps clients find you nearby</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Phone/WhatsApp Number</label>
                <input
                  type="tel"
                  placeholder="078 060 8202"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-900 border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 transition"
                  required
                />
                <p className="text-slate-500 text-xs mt-2">Clients will contact you on this number</p>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Hourly Rate (ZAR) - Optional</label>
                <input
                  type="number"
                  placeholder="150"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-900 border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 transition"
                  min="0"
                />
                <p className="text-slate-500 text-xs mt-2">You can discuss final price on WhatsApp</p>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="bg-slate-800 border-slate-700 rounded-2xl p-5">
            <label className="block text-lg font-semibold mb-2">About You</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell clients about your experience, qualifications, areas you service..."
              className="w-full px-4 py-3.5 bg-slate-900 border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 h-28 transition resize-none"
              required
              maxLength="200"
            />
            <p className="text-slate-500 text-xs mt-2">{bio.length}/200 characters</p>
          </div>

          {/* Submit */}
          <button
            disabled={loading || selectedSkills.length === 0 || !phone || !finalLocation}
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed py-3.5 rounded-xl font-bold transition"
          >
            {loading ? 'Submitting for Verification...' : 'Submit for Verification'}
          </button>
          
          <p className="text-xs text-slate-500 text-center">
            Your profile will be reviewed within 24 hours before going live on Shimla
          </p>
        </form>
      </div>
    </div>
  )
}

export default Onboarding