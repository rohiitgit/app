import styles from '@/assets/styles/styles'
import Button from '@/components/Button'
import checkSecret from '@/components/CheckSecret'
import * as Application from 'expo-application'
import { router } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import React, { useCallback, useEffect, useState } from 'react'
import * as SplashScreen from 'expo-splash-screen'
import {
  Alert,
  Keyboard,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  useColorScheme,
  View,
} from 'react-native'
import {
  DMSerifText_400Regular,
  useFonts,
} from '@expo-google-fonts/dm-serif-text'
import { PlayfairDisplay_600SemiBold } from '@expo-google-fonts/playfair-display'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'

export default function Index() {
  SplashScreen.preventAutoHideAsync()
  let [phoneNumber, setPhoneNumber] = useState<string>('')
  let [loginProcess, setLoginProcess] = useState<boolean>(false)
  let [appIsReady, setAppIsReady] = useState<boolean>(false)
  let [fontsLoaded] = useFonts({
    PlayfairDisplay_600SemiBold,
    DMSerifText_400Regular,
  })
  let [otp, setOtp] = useState<string>('')
  let [awaitingOTP, setAwaitingOTP] = useState<boolean>(false)
  let [lookupAccessToken, setLookupAccessToken] = useState<string>('')

  async function sendOTP() {
    setLoginProcess(true)
    try {
      const response = await fetch(
        `${
          __DEV__ ? 'http://localhost:3000' : 'https://api.pdgn.xyz'
        }/donor/send-otp`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: phoneNumber }),
        }
      )
      const data = await response.json()
      setLoginProcess(false)
      if (data.error) {
        alert(data.message)
        return
      }
      setAwaitingOTP(true)
      setLookupAccessToken(data.lookuptoken || '') // Save lookup token if present
    } catch (error) {
      setLoginProcess(false)
      Alert.alert(
        'An error occurred while sending your code.',
        error ? String(error) : 'Please try again later.'
      )
    }
  }

  async function checkOTP() {
    setLoginProcess(true)
    try {
      const response = await fetch(
        `${
          __DEV__ ? 'http://localhost:3000' : 'https://api.pdgn.xyz'
        }/donor/check-otp`,
        {
          method: 'POST',
          headers: lookupAccessToken
            ? {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${lookupAccessToken}`,
              }
            : {
                'Content-Type': 'application/json',
              },
          body: JSON.stringify({
            phone: phoneNumber,
            otp: otp,
          }),
        }
      )
      const data = await response.json()
      console.log('OTP verification response:', data)
      setLoginProcess(false)
      if (data.error) {
        Alert.alert(
          'An error occurred while verifying your code.',
          data.error ? String(data.error) : 'Please try again later.'
        )
        return
      }
      if (data.existing === false) {
        console.log('New user detected, redirecting to signup')
        router.replace({
          pathname: '/signup',
          params: {
            phoneNumber: phoneNumber,
            lookuptoken: lookupAccessToken,
          },
        })
      } else {
        await SecureStore.setItemAsync('token', data.access.token)
        await SecureStore.setItemAsync('refresh', data.refresh.token)
        await SecureStore.setItemAsync('tokenexp', data.access.exp.toString())
        await SecureStore.setItemAsync(
          'refreshexp',
          data.refresh.exp.toString()
        )
        await SecureStore.setItemAsync('bbId', data.bank.id)
        router.replace('/user')
      }
    } catch (error) {
      setLoginProcess(false)
      Alert.alert(
        'An error occurred while verifying your code.',
        error ? String(error) : 'Please try again later.'
      )
    }
  }

  function handleLogin() {
    if (awaitingOTP) {
      checkOTP()
    } else {
      sendOTP()
    }
  }
  useEffect(() => {
    async function prepare() {
      try {
        const token = await checkSecret()
        if (!token) {
          const hasOnboarded = await SecureStore.getItemAsync('hasOnboarded')
          if (!hasOnboarded) {
            router.push('/welcome')
          }
          setAppIsReady(true)
          return
        } else {
          const id = await SecureStore.getItemAsync('id')
          const redirectPath = id ? '/hq' : '/user'
          setAppIsReady(true)
          router.replace(redirectPath)
        }
      } catch (e) {
        console.warn(e)
      }
    }
    prepare()
  }, [])
  let isDarkMode = useColorScheme() === 'dark'
  const onLayoutRootView = useCallback(async () => {
    if (appIsReady && fontsLoaded) {
      await SplashScreen.hideAsync()
    }
  }, [appIsReady, fontsLoaded])

  useEffect(() => {
    onLayoutRootView()
  }, [appIsReady, fontsLoaded])

  if (!appIsReady || !fontsLoaded) {
    return null
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView
        contentContainerStyle={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: isDarkMode ? '#030303' : '#fff',
        }}
        keyboardShouldPersistTaps="handled"
      >
        <SafeAreaView>
          <Text
            style={{
              fontSize: 32,
              textAlign: 'center',
              color: '#7469B6',
              fontFamily: 'PlayfairDisplay_600SemiBold',
            }}
          >
            Open Blood
          </Text>
          <View style={{ marginTop: 20 }}>
            <TextInput
              placeholder="phone number"
              autoComplete="tel"
              keyboardType="phone-pad"
              value={phoneNumber}
              onSubmitEditing={handleLogin}
              onChangeText={setPhoneNumber}
              placeholderTextColor={'grey'}
              style={{
                ...styles.input,
                color: awaitingOTP ? 'grey' : 'black',
              }}
              editable={!loginProcess && !awaitingOTP}
              readOnly={loginProcess || awaitingOTP}
            />
            {awaitingOTP ? (
              <>
                <Pressable
                  onPress={() => {
                    setAwaitingOTP(false)
                    setOtp('')
                  }}
                >
                  <Text
                    style={{
                      textAlign: 'left',
                      fontSize: 16,
                      color: '#7469B6',
                    }}
                  >
                    Try a different number
                  </Text>
                </Pressable>
                <TextInput
                  placeholderTextColor={'grey'}
                  placeholder="enter OTP"
                  autoComplete="off"
                  keyboardType="number-pad"
                  secureTextEntry={false}
                  value={otp}
                  onChangeText={setOtp}
                  style={styles.input}
                />
              </>
            ) : null}
          </View>
          <Button
            onPress={handleLogin}
            disabled={
              awaitingOTP
                ? !otp.match(/^\d{4}$/)
                : loginProcess ||
                  !phoneNumber.match(/^(\+91[\-\s]?|0)?[1-9]\d{4}[\-\s]?\d{5}$/)
            }
          >
            {loginProcess
              ? awaitingOTP
                ? 'Verifying...'
                : 'Sending OTP...'
              : awaitingOTP
              ? 'Continue'
              : 'Log in'}
          </Button>
          <Pressable
            onPress={() => {
              router.push('/hqonboarding')
            }}
            style={{ marginTop: 20 }}
          >
            <Text
              style={{
                textAlign: 'center',
                fontSize: 16,
                color: '#7469B6',
              }}
            >
              Blood Banks
            </Text>
          </Pressable>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              marginTop: 50,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                color: 'grey',
              }}
            >
              Open Blood {Application.nativeApplicationVersion} [
              {Application.nativeBuildVersion}]
            </Text>
          </View>
        </SafeAreaView>
      </ScrollView>
    </TouchableWithoutFeedback>
  )
}
