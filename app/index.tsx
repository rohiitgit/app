import styles from '@/assets/styles/styles'
import Button from '@/components/Button'
import checkSecret from '@/components/CheckSecret'
import * as Application from 'expo-application'
import { router } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import { fetch } from 'expo/fetch'
import React, { useCallback, useEffect, useState } from 'react'
import * as SplashScreen from 'expo-splash-screen'
import {
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
export default function Index() {
  SplashScreen.preventAutoHideAsync()
  let [phoneNumber, setPhoneNumber] = useState<string>('')
  let [password, setPassword] = useState<string>('')
  let [loginProcess, setLoginProcess] = useState<boolean>(false)
  let [appIsReady, setAppIsReady] = useState<boolean>(false)
  let [fontsLoaded] = useFonts({
    PlayfairDisplay_600SemiBold,
    DMSerifText_400Regular,
  })
  let [otp, setOtp] = useState<string>('')
  let [allowOTP, setAllowOTP] = useState<boolean>(false)
  let [newUser, setNewUser] = useState<boolean>(false)
  let [lookupAccessToken, setLookupAccessToken] = useState<string>('')
  async function login() {
    if (newUser) {
      setLoginProcess(true)
      fetch(
        `${
          __DEV__ ? 'http://localhost:3000' : 'https://api.pdgn.xyz'
        }/donor/check-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${lookupAccessToken}`,
          },
          body: JSON.stringify({
            phone: phoneNumber,
            otp: otp,
          }),
        }
      )
        .then((response) => response.json())
        .then(async (response) => {
          setLoginProcess(false)
          if (response.error) {
            alert(response.message)
          } else {
            router.replace({
              pathname: '/signup',
              params: {
                phoneNumber: phoneNumber,
                lookuptoken: lookupAccessToken,
              },
            })
          }
        })
        .catch((error) => {
          alert(error)
        })
      return
    }
    console.log(otp)
    setLoginProcess(true)
    fetch(
      `${
        __DEV__ ? 'http://localhost:3000' : 'https://api.pdgn.xyz'
      }/donor/send-otp`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phoneNumber,
          allowSignup: true,
          intentVerifyOTPlogin: allowOTP,
          userEnteredOTP: allowOTP ? otp : null,
        }),
      }
    )
      .then((response) => response.json())
      .then(async (response) => {
        if (response.statusCode === 429) {
          alert('Too many requests. Please try again later.')
          setLoginProcess(false)
          return
        }
        setLoginProcess(false)
        if (response.error) {
          alert(response.message)
        } else {
          //alert(response.message)
          if (response.hasOwnProperty('otpSent')) {
            setAllowOTP(true)
          } else if (response.hasOwnProperty('access')) {
            console.log(response.access.token, response.bank.id)
            await SecureStore.setItemAsync('token', response.access.token)
            await SecureStore.setItemAsync('refresh', response.refresh.token)
            await SecureStore.setItemAsync(
              'tokenexp',
              response.access.exp.toString()
            )
            await SecureStore.setItemAsync(
              'refreshexp',
              response.refresh.exp.toString()
            )
            await SecureStore.setItemAsync('bbId', response.bank.id)
            router.replace('/user')
          } else {
            setAllowOTP(true)
            setNewUser(true)
            setLookupAccessToken(response.lookuptoken)
            console.log(response.otp)
            console.log('new user')
          }
        }
      })
      .catch((error) => {
        console.log('error', error)
        setLoginProcess(false)
        console.log(error)
        alert(error)
      })
  }

  useEffect(() => {
    async function prepare() {
      try {
        // Call checkSecret to validate tokens
        const token = await checkSecret()

        if (!token) {
          console.log('Token is invalid or does not exist')
          const hasOnboarded = await SecureStore.getItemAsync('hasOnboarded')
          if (!hasOnboarded) {
            router.push('/welcome')
          }
          setAppIsReady(true)
          return
        } else {
          const id = await SecureStore.getItemAsync('id')
          const redirectPath = id ? '/hq' : '/user'
          console.log(`Redirecting to ${redirectPath}`)
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
              fontFamily: 'PlayfairDisplay_600SemiBold', //'PlayfairDisplay_600SemiBold',
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
              onSubmitEditing={login}
              onChangeText={setPhoneNumber}
              placeholderTextColor={'grey'}
              style={{
                ...styles.input,
                color: newUser || allowOTP ? 'grey' : 'black',
              }}
              editable={!loginProcess && (!newUser || !allowOTP)}
              readOnly={loginProcess || newUser || allowOTP}
            />
            {allowOTP ? (
              <>
                <Pressable
                  onPress={() => {
                    //let the user input a new phone number
                    setAllowOTP(false)
                    setNewUser(false)
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
            onPress={login}
            disabled={
              allowOTP
                ? !otp.match(/^\d{4}$/)
                : loginProcess ||
                  !phoneNumber.match(/^(\+91[\-\s]?|0)?[1-9]\d{4}[\-\s]?\d{5}$/)
            }
          >
            {loginProcess
              ? newUser
                ? 'Verifying...'
                : 'Logging in...'
              : newUser
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
