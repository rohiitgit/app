import * as SecureStore from 'expo-secure-store'
import checkSecret from './CheckSecret'

const BASE_URL = __DEV__ ? 'http://localhost:3000' : 'https://api.pdgn.xyz'

interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: Record<string, any> | null
}

export default async function fx(
  endpoint: string,
  options: FetchOptions = {}
): Promise<any> {
  try {
    endpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    const token = await checkSecret()
    if (!token) throw new Error('No valid token')
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }

    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : null,
    })

    if (res.status === 401) {
      console.log('customFetch: Unauthorized')
      return false
    }

    return await res.json()
  } catch (err) {
    console.error('customFetch error:', err)
    return false
  }
}
