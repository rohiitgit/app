import Button from '@/components/Button'
import { router, useLocalSearchParams } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import React, { useEffect } from 'react'
import { Text, useColorScheme, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
export default function Modal() {
  let {
    name,
    phone,
    uuid,
  }: {
    name: string
    phone: string
    uuid: string
  } = useLocalSearchParams()
  useEffect(() => {
    async function setToken() {
      let e = await SecureStore.setItemAsync('token', uuid)
    }
    setToken()
  })
  let isDarkMode = useColorScheme() === 'dark'
  let responsiveColor = isDarkMode ? 'white' : 'black'
  return (
    <KeyboardAwareScrollView
      style={{
        backgroundColor: isDarkMode ? '#121212' : '#fff',
      }}
    >
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          margin: 30,
          gap: 20,
        }}
      >
        <Text
          style={{
            fontSize: 28,
            color: responsiveColor,
          }}
        >
          Thanks for signing up,{'\n'}{' '}
          <Text
            style={{
              color: '#7469B6',
            }}
          >
            {name}
          </Text>
          !
        </Text>
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 40,
          }}
        >
          <Text
            style={{
              fontSize: 28,
              alignSelf: 'center',
              fontWeight: 'bold',
              color: '#7469B6',
              marginBottom: 25,
              fontFamily: 'PlayfairDisplay_600SemiBold',
            }}
          >
            Next Steps
          </Text>
          <View
            style={{
              flexDirection: 'column',
              gap: 30,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                gap: 10,
                justifyContent: 'space-between',
                alignContent: 'center',
                width: '85%',
              }}
            >
              <Text
                style={{
                  fontSize: 28,
                  justifyContent: 'center',
                  alignSelf: 'center',
                }}
              >
                🔔
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: responsiveColor,
                }}
              >
                Once you exit this screen, we'll ask if we can send you
                notifications. Please allow them so we can send you important
                updates and critical alerts. Notification types may vary by
                device.
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                gap: 10,
                justifyContent: 'space-between',
                alignContent: 'center',
                width: '85%',
              }}
            >
              <Text
                style={{
                  fontSize: 28,
                  justifyContent: 'center',
                  alignSelf: 'center',
                }}
              >
                ✅
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: responsiveColor,
                }}
              >
                A reviewer from the Blood Center will review your profile and
                determine if you're eligible. You will receive a message to your
                number once your profile has been reviewed.
              </Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                gap: 10,
                justifyContent: 'space-between',
                alignContent: 'center',
                width: '85%',
              }}
            >
              <Text
                style={{
                  fontSize: 28,
                  justifyContent: 'center',
                  alignSelf: 'center',
                }}
              >
                🩸
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: responsiveColor,
                }}
              >
                Even if you haven't been verified, you can still donate at the{' '}
                <Text style={{ color: '#7469B6' }}>Blood Center</Text>. Make
                sure to show an employee your QR code before you donate so they
                can verify your profile.
              </Text>
            </View>
          </View>
        </View>
        <Button
          onPress={() => {
            router.dismissAll()
            router.replace('/user')
          }}
        >
          Continue
        </Button>
      </View>
    </KeyboardAwareScrollView>
  )
}
