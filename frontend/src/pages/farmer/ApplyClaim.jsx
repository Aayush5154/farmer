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

      // 🔑 BASIC CLAIM DATA
      formData.append("cropType", data.cropType)
      formData.append("reason", data.reason)
      formData.append("expectedAmount", data.expectedAmount) // ✅ NEW
      formData.append("damageImage", data.damageImage[0])

      // 🔑 OPTIONAL SENSOR DATA
      if (data.attachSensor) {
        if (
          data.soilMoisture === undefined ||
          data.airTemp === undefined ||
          data.humidity === undefined ||
          data.soilTemp === undefined
        ) {
          toast.error("Please fill all sensor fields or disable attaching sensor readings")
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
    <div className="max-w-2xl mx-auto">
      <Link to="/" className="text-emerald-600 hover:text-emerald-700 text-sm">
        ← Back to Dashboard
      </Link>

      <h1 className="text-2xl font-bold mt-2 mb-6">
        Apply for Insurance Claim
      </h1>

      <div className="bg-white p-8 rounded-xl shadow border">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          <input
            {...register("cropType", { required: true })}
            placeholder="Crop Type"
            className="w-full border rounded-lg p-3"
          />

          <textarea
            {...register("reason", { required: true })}
            placeholder="Reason for claim"
            rows="4"
            className="w-full border rounded-lg p-3"
          />

          {/* ✅ NEW FIELD */}
          <input
            type="number"
            step="any"
            {...register("expectedAmount", { required: true })}
            placeholder="Expected Insurance Amount (₹)"
            className="w-full border rounded-lg p-3"
          />

          <input
            type="file"
            accept="image/*"
            {...register("damageImage", { required: true })}
            onChange={handleImageChange}
          />

          {preview && (
            <img
              src={preview}
              alt="preview"
              className="h-40 rounded-lg"
            />
          )}

          {/* SENSOR SECTION */}
          <div className="pt-4 border-t">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register("attachSensor")} />
              <span className="text-gray-600">
                Attach sensor readings (manual)
              </span>
            </label>

            {watch("attachSensor") && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">

                <input
                  {...register("deviceId")}
                  placeholder="Device ID (optional)"
                  className="w-full border rounded-lg p-3"
                />

                <input
                  {...register("soilMoisture")}
                  placeholder="Soil Moisture (%)"
                  type="number"
                  className="w-full border rounded-lg p-3"
                />

                <input
                  {...register("airTemp")}
                  placeholder="Air Temperature (°C)"
                  type="number"
                  className="w-full border rounded-lg p-3"
                />

                <input
                  {...register("humidity")}
                  placeholder="Humidity (%)"
                  type="number"
                  className="w-full border rounded-lg p-3"
                />

                <input
                  {...register("soilTemp")}
                  placeholder="Soil Temperature (°C)"
                  type="number"
                  className="w-full border rounded-lg p-3"
                />

                <div className="md:col-span-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setValue("deviceId", "sim-001")
                      setValue("soilMoisture", 25)
                      setValue("airTemp", 36)
                      setValue("humidity", 28)
                      setValue("soilTemp", 34)
                    }}
                    className="text-sm text-blue-600"
                  >
                    Use sample readings
                  </button>

                  <div className="text-sm text-gray-500">
                    (These readings will be saved as sensor data and attached to the claim)
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            disabled={isSubmitting}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg"
          >
            {isSubmitting ? "Submitting..." : "Submit Claim"}
          </button>
        </form>
      </div>
    </div>
  )
}
