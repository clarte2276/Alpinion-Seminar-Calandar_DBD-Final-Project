import axios from 'axios'

// Shared axios instance pointed at the backend.
const api = axios.create({
  baseURL: 'http://localhost:3000',
})

export default api
