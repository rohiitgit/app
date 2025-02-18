import { router, Stack } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import * as Notifications from 'expo-notifications'
import * as SecureStore from 'expo-secure-store'
import * as SplashScreen from 'expo-splash-screen'
import { useColorScheme } from 'react-native'
//import {useFonts, PlayfairDisplay_400Regular} from '@expo-google-fonts/playfair-display'
import {
  useFonts,
  DMSerifText_400Regular,
} from '@expo-google-fonts/dm-serif-text'
import {
  PlayfairDisplay_600SemiBold,
} from '@expo-google-fonts/playfair-display'
export default function RootLayout() {
  let isDarkMode = useColorScheme() === 'dark'
  let [fontsLoaded] = useFonts({
    PlayfairDisplay_600SemiBold,
    DMSerifText_400Regular,
  })
  function useNotificationObserver() {
    useEffect(() => {
      let isMounted = true
      function redirect(notification: Notifications.Notification) {
        const url = notification.request.content.data?.url
        if (url) {
          router.push(url)
        }
      }

      Notifications.getLastNotificationResponseAsync().then((response) => {
        if (!isMounted || !response?.notification) {
          return
        }
        redirect(response?.notification)
      })

      const subscription =
        Notifications.addNotificationResponseReceivedListener((response) => {
          redirect(response.notification)
        })

      return () => {
        isMounted = false
        subscription.remove()
      }
    }, [])
  }

  useNotificationObserver()

  SplashScreen.preventAutoHideAsync()

  const [appIsReady, setAppIsReady] = useState(false)
  useEffect(() => {
    async function prepare() {
      try {
        SecureStore.getItemAsync('token').then((token) => {
          setAppIsReady(true)
          if (token) {
            if (token.startsWith('hq-')) {
              console.log('hq', token)
              router.replace('/hq')
            } else {
              console.log('user', token)
              router.replace('/user')
            }
          }
        })
      } catch (e) {
        console.warn(e)
      }
    }

    prepare()
  }, [])

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady && !fontsLoaded) {
      await SplashScreen.hideAsync()
    }
  }, [appIsReady])

  useEffect(() => {
    onLayoutRootView()
  }, [appIsReady])

  if (!appIsReady || !fontsLoaded) {
    return null
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: 'white',
        },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="signup/index" />
      <Stack.Screen name="user/index" />
      <Stack.Screen name="hqonboarding/index" />
      <Stack.Screen name="hq/index" />
      <Stack.Screen
        name="accountmigration"
        options={{
          // Set the presentation mode to modal for our modal route.
          presentation: 'modal',
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="logdonor"
        options={{
          // Set the presentation mode to modal for our modal route.
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="requestblood"
        options={{
          // Set the presentation mode to modal for our modal route.
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="processalert"
        options={{
          // Set the presentation mode to modal for our modal route.
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="verifydonor"
        options={{
          // Set the presentation mode to modal for our modal route.
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="signupcomplete"
        options={{
          presentation: 'modal',
        }}
      />
    </Stack>
  )
}
