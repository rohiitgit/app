import * as SecureStore from 'expo-secure-store'
import { Alert } from 'react-native'

export default async function checkSecret() {
  console.log('CheckSecret called')
  const now = Math.floor(Date.now() / 1000)

  // Determine if the app is an HQ client
  const id = await SecureStore.getItemAsync('id')
  const hq = !!id // Set hq to true if 'id' exists, otherwise false

  const exp = parseInt((await SecureStore.getItemAsync('tokenexp')) || '0')
  const refreshexp = parseInt(
    (await SecureStore.getItemAsync('refreshexp')) || '0'
  )
  const tokenExpiredSoon = exp - now < 300
  const refreshExpiredSoon = refreshexp - now < 300

  if (tokenExpiredSoon || refreshExpiredSoon) {
    if (refreshexp < now) {
      console.log('CheckSecret: Refresh token expired, logging out')
      logoutUser(hq)
      return false
    }

    const refresh = await SecureStore.getItemAsync('refresh')

    try {
      console.log('CheckSecret: Refreshing token')
      const response = await fetch(
        `${__DEV__ ? 'http://localhost:3000' : 'https://api.pdgn.xyz'}/${
          hq ? 'hq/' : 'donor/'
        }refresh`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${refresh}`,
          },
          body: hq
            ? JSON.stringify({
                bankCode: id,
              })
            : JSON.stringify({
                refresh: true,
              }),
        }
      )

      const data = await response.json()
      if (data.error === true) {
        console.log('CheckSecret: Refresh token error:', data.message)
        Alert.alert(
          'Error',
          'An error occurred. Please log in again.',
          [
            {
              text: 'OK',
              onPress: async () => {
                await logoutUser(hq)
              },
            },
          ],
          { cancelable: false }
        )
        return false
      }

      await SecureStore.setItemAsync('token', data.access.token)
      await SecureStore.setItemAsync('refresh', data.refresh.token)
      await SecureStore.setItemAsync('tokenexp', data.access.exp.toString())
      await SecureStore.setItemAsync('refreshexp', data.refresh.exp.toString())
      console.log('CheckSecret: Token refreshed successfully')

      return data.access.token
    } catch (error) {
      console.error('CheckSecret: Error refreshing token:', error)
      Alert.alert(
        'Error',
        'An error occurred. Please log in again.',
        [
          {
            text: 'OK',
            onPress: async () => {
              await logoutUser(hq)
            },
          },
        ],
        { cancelable: false }
      )
      return false
    }
  }

  const token = await SecureStore.getItemAsync('token')
  console.log('CheckSecret: all good!')
  return token
}

export async function logoutUser(hq = false) {
  // Donor + HQ
  await SecureStore.deleteItemAsync('token')
  await SecureStore.deleteItemAsync('refresh')
  await SecureStore.deleteItemAsync('tokenexp')
  await SecureStore.deleteItemAsync('refreshexp')
  await SecureStore.deleteItemAsync('bbId')
  await SecureStore.deleteItemAsync('bbName')

  // HQ only
  if (hq) {
    await SecureStore.deleteItemAsync('id')
  }
}
