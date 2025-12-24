import api from "./axios"

export const fetchAdminAnalytics = async () => {
  const res = await api.get("/analytics/admin")
  return res.data?.data
}
