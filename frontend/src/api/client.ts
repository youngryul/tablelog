import axios from 'axios'
import { supabase } from '../lib/supabase'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

apiClient.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession()
  const accessToken = data.session?.access_token

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

// Backend는 모든 응답을 { success, data } | { success, error } 로 감싼다.
// 이 인터셉터가 response.data를 실제 payload로 풀어줘서, 이후 api 모듈들은 감싸지 않은 데이터를 그대로 사용한다.
apiClient.interceptors.response.use((response) => {
  response.data = response.data?.data
  return response
})
