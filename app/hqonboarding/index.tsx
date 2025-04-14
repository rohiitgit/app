import Button from '@/components/Button'
import { router } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import { useEffect, useState } from 'react'
import {
  Keyboard,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  useColorScheme,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import styles from '../../assets/styles/styles'
export default function Onboarding() {
  let [loginCode, setLoginCode] = useState<string>('')
  let [bankCode, setBankCode] = useState<string>('')
  let [loginProcess, setLoginProcess] = useState<boolean>(false)
  useEffect(() => {
    SecureStore.getItemAsync('token').then((token) => {
      if (token) {
        //console.log(token)
        router.push('/hq')
      }
    })
  })
  function login() {
    setLoginProcess(true)
    fetch(`https://api.pdgn.xyz/hq/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        loginCode: loginCode,
        bankCode: bankCode,
      }),
    })
      .then((response) => response.json())
      .then(async (response) => {
        setLoginProcess(false)
        //console.log('RES: ', response)
        if (response.error == true) {
          alert(response.message)
        } else {
          await SecureStore.setItemAsync('id', response.id)
          await SecureStore.setItemAsync('token', `hq-${loginCode}`)
          router.push('/hq')
        }
      })
      .catch((error) => {
        setLoginProcess(false)
        alert(error)
      })
  }
  let isDarkMode = useColorScheme() === 'dark'
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <ScrollView
      contentContainerStyle={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: isDarkMode ? '#030303' : '#efeef7',
      }}
      keyboardShouldPersistTaps='handled'
    >
      <SafeAreaView>
        <Text
          style={{
            fontSize: 24,
            textAlign: 'center',
            color: isDarkMode ? 'white' : 'black',
          }}
        >
          <Text style={{ color: '#7469B6' }}>Open Blood HQ</Text>
        </Text>
        <View style={{ marginTop: 20 }}>
          <Text
            style={{
              fontSize: 16,
              color: isDarkMode ? 'white' : 'black',
              textAlign: 'left',
              marginLeft: 20,
            }}
          >
            Bank Code
          </Text>
          <TextInput
            placeholder="bank code"
            autoComplete="off"
            placeholderTextColor={'grey'}
            secureTextEntry={false}
            value={bankCode}
            onChangeText={setBankCode}
            style={styles.input}
            textContentType='username'
          />

          <Text
            style={{
              fontSize: 16,
              color: isDarkMode ? 'white' : 'black',
              textAlign: 'left',
              marginLeft: 20,
            }}
          >
            Login Code
          </Text>
          <TextInput
            placeholder="login code"
            autoComplete="off"
            placeholderTextColor={'grey'}
            secureTextEntry={true}
            value={loginCode}
            onChangeText={setLoginCode}
            style={styles.input}
            textContentType='password'
          />
        </View>
        <Button onPress={login} disabled={loginProcess}>
          {loginProcess ? 'Logging in...' : 'Login'}
        </Button>
        <Pressable
          onPress={() => {
            router.push('/')
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
            Donor Log In
          </Text>
        </Pressable>
      </SafeAreaView>
    </ScrollView>
    </TouchableWithoutFeedback>
  )
}
