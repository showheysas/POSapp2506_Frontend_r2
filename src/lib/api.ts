import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
})

console.log('API BASE URL:', process.env.NEXT_PUBLIC_API_URL)

export default api
