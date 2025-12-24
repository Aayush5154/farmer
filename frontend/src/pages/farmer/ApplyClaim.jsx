import { useForm } from "react-hook-form"
import api from "../../api/axios"
import toast from "react-hot-toast"
import { useState } from "react"
import { Link } from "react-router-dom"

export default function ApplyClaim() {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm()

  const [preview, setPreview] = useState(null)
  const [sensorSaving, setSensorSaving] = useState(false)

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPreview(URL.createObjectURL(file))
    }
  }

  const onSubmit = async (data) => {
    try {
      const formData = new FormData()
      formData.append("cropType", data.cropType)
      formData.append("reason", data.reason)
      formData.append("expectedAmount", data.expectedAmount)
      formData.append("damageImage", data.damageImage[0])

      if (data.attachSensor) {
        if (!data.soilMoisture || !data.airTemp || !data.humidity || !data.soilTemp) {
          toast.error("Please fill all sensor fields or disable sensor readings")
          return
        }

        setSensorSaving(true)
        const payload = {
          deviceId: data.deviceId || "manual",
          soilMoisture: Number(data.soilMoisture),
          airTemp: Number(data.airTemp),
          humidity: Number(data.humidity),
          soilTemp: Number(data.soilTemp),
        }

        const sensorRes = await api.post("/sensor/add", payload)
        const sensor = sensorRes.data?.data
        if (sensor && sensor._id) {
          formData.append("sensorDataId", sensor._id)
        }
        setSensorSaving(false)
      }

      await api.post("/claim/apply", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      toast.success("Claim submitted successfully")
      reset()
      setPreview(null)
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || "Failed to submit claim")
      setSensorSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-emerald-50 p-4 lg:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Navigation */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-800 font-medium transition-colors mb-6 group"
        >
          <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:-translate-x-1 transition-transform">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <span className="bg-emerald-100 p-2 rounded-xl text-2xl">📝</span>
            Apply for Insurance Claim
          </h1>
          <p className="text-gray-500 mt-2 ml-12">Provide details about your crop damage to initiate the claim process.</p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-emerald-900/5 border border-gray-100 overflow-hidden">
          <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
            
            {/* Basic Info Section */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Crop Type</label>
                  <input
                    {...register("cropType", { required: true })}
                    placeholder="e.g. Wheat, Rice, Corn"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Expected Amount (₹)</label>
                  <input
                    type="number"
                    step="any"
                    {...register("expectedAmount", { required: true })}
                    placeholder="0.00"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Reason for Claim</label>
                <textarea
                  {...register("reason", { required: true })}
                  placeholder="Describe the cause of damage (e.g., Flood, Pest attack, Drought)..."
                  rows="4"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700 ml-1">Evidence of Damage</label>
              <div className="relative group">
                <input
                  type="file"
                  accept="image/*"
                  {...register("damageImage", { required: true })}
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={`border-2 border-dashed rounded-2xl p-8 transition-all flex flex-col items-center justify-center ${preview ? 'border-emerald-200 bg-emerald-50' : 'border-gray-300 bg-gray-50 group-hover:border-emerald-400'}`}>
                  {!preview ? (
                    <>
                      <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3">
                        <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-gray-600">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</p>
                    </>
                  ) : (
                    <div className="relative">
                      <img src={preview} alt="preview" className="h-48 w-full object-cover rounded-xl shadow-md" />
                      <div className="absolute top-2 right-2 bg-emerald-500 text-white p-1 rounded-full shadow-lg">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sensor Data Section */}
            <div className="pt-6 border-t border-gray-100">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input type="checkbox" {...register("attachSensor")} className="sr-only peer" />
                  <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-emerald-500 transition-colors"></div>
                  <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                </div>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-emerald-700 transition-colors">
                  Attach sensor readings (IoT data)
                </span>
              </label>

              {watch("attachSensor") && (
                <div className="mt-6 p-6 bg-slate-50 rounded-2xl border border-slate-200 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                       <input {...register("deviceId")} placeholder="Device ID (optional)" className="w-full bg-white border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                    <input {...register("soilMoisture")} placeholder="Soil Moisture (%)" type="number" className="bg-white border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none" />
                    <input {...register("airTemp")} placeholder="Air Temp (°C)" type="number" className="bg-white border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none" />
                    <input {...register("humidity")} placeholder="Humidity (%)" type="number" className="bg-white border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none" />
                    <input {...register("soilTemp")} placeholder="Soil Temp (°C)" type="number" className="bg-white border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                  
                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setValue("deviceId", "sim-001")
                        setValue("soilMoisture", 25)
                        setValue("airTemp", 36)
                        setValue("humidity", 28)
                        setValue("soilTemp", 34)
                      }}
                      className="text-sm text-emerald-600 font-semibold hover:text-emerald-700 flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Use sample readings
                    </button>
                    <span className="text-[11px] text-gray-400 italic">This data helps verify claim authenticity.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              disabled={isSubmitting}
              className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all transform active:scale-[0.98] ${
                isSubmitting 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-emerald-200 hover:-translate-y-0.5"
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting Claim...
                </div>
              ) : (
                "Submit Insurance Claim"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-400 text-sm mt-8 pb-10">
          By submitting, you agree to the verification of the provided data by our insurance adjusters.
        </p>
      </div>
    </div>
  )
}