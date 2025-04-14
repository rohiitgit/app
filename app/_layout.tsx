import * as Notifications from 'expo-notifications'
import { router, Stack } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import * as SplashScreen from 'expo-splash-screen'
import { useCallback, useEffect, useState } from 'react'

//import {useFonts, PlayfairDisplay_400Regular} from '@expo-google-fonts/playfair-display'
import {
  DMSerifText_400Regular,
  useFonts,
} from '@expo-google-fonts/dm-serif-text'
import { PlayfairDisplay_600SemiBold } from '@expo-google-fonts/playfair-display'
export default function RootLayout() {
  const [initialRoute, setInitialRoute] = useState<string | null>(null)

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
          /*if (token) {
            if (token.startsWith('hq-')) {
              console.log('hq', token)
              router.replace('/hq')
            } else {
              console.log('user', token)
              router.replace('/user')
            }
          }*/
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
        name="welcome"
        options={{
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="accountmigration"
        options={{
          presentation: 'modal',
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="logdonor"
        options={{
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="requestblood"
        options={{
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="processalert"
        options={{
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="verifydonor"
        options={{
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
