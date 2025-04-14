import styles from '@/assets/styles/styles'
import Button from '@/components/Button'
import * as Application from 'expo-application'
import { router } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import { fetch } from 'expo/fetch'
import React, { useEffect, useState } from 'react'
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
import { SafeAreaView } from 'react-native-safe-area-context'
export default function Index() {
  let [phoneNumber, setPhoneNumber] = useState<string>('')
  let [password, setPassword] = useState<string>('')
  let [loginProcess, setLoginProcess] = useState<boolean>(false)
  let [otp, setOtp] = useState<string>('')
  let [newUserOTP, setNewUserOTP] = useState<string>('')
  let [allowOTP, setAllowOTP] = useState<boolean>(false)
  let [newUser, setNewUser] = useState<boolean>(false)
  async function login() {
    if (newUser) {
      console.log(otp)
      console.log(newUserOTP)
      if (parseInt(otp) === parseInt(newUserOTP)) {
        router.push({
          pathname: '/signup',
          params: { phoneNumber: phoneNumber },
        })
      } else {
        alert('Invalid OTP')
      }
      return
    }
    console.log(otp)
    setLoginProcess(true)
    fetch(`https://api.pdgn.xyz/donor/send-otp`, {
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
    })
      .then((response) => response.json())
      .then(async (response) => {
        setLoginProcess(false)
        if (response.error) {
          alert(response.message)
        } else {
          //alert(response.message)
          if (response.otpSent) {
            setAllowOTP(true)
          } else if (response.otp) {
            setAllowOTP(true)
            setNewUser(true)
            setNewUserOTP(response.otp)
            console.log(response.otp)
            console.log('new user')
          } else if (response.uuid) {
            console.log(response.uuid, response.bank.id)
            await SecureStore.setItemAsync('token', response.uuid)
            await SecureStore.setItemAsync('bbId', response.bank.id)
            router.push('/user')
          }
        }
      })
      .catch((error) => {
        setLoginProcess(false)
        console.log(error)
        alert(error)
      })
  }
  useEffect(() => {
    async function init() {
      try {
        const token = await SecureStore.getItemAsync('token')

        if (token) {
          if (token.startsWith('hq-')) {
            router.replace('/hq')
          } else {
            router.replace('/user')
          }
        } else {
          const hasOnboarded = await SecureStore.getItemAsync('hasOnboarded')
          if (hasOnboarded !== 'true') {
            router.push('/welcome')
          }
        }
      } catch (e) {
        console.warn(e)
      }
    }

    init()
  }, [])
  let isDarkMode = useColorScheme() === 'dark'
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
          <Button onPress={login} disabled={loginProcess}>
            {loginProcess
              ? newUser
                ? 'Verifying...'
                : 'Loading...'
              : newUser
              ? 'Sign up!'
              : 'Continue'}
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
              Blood Center
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
