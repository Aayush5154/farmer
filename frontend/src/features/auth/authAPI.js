import api from "../../api/axios"

// LOGIN
export const loginApi = (data) => {
  return api.post("/user/login", data)
}

// REGISTER
export const registerApi = (data) => {
  return api.post("/user/register", data)
}
