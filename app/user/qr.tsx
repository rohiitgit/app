import * as SecureStore from 'expo-secure-store'
import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  useColorScheme,
  View,
} from 'react-native'
import QRCode from 'react-native-qrcode-svg'
import { Image } from 'expo-image'
import { SafeAreaView } from 'react-native-safe-area-context'
import fx from '@/components/Fetch'
import { router } from 'expo-router'
import { useFocusEffect } from '@react-navigation/native'
import React from 'react'
import Button from '@/components/Button'
export default function QR() {
  let [uuid, setUUID] = useState<string | null>('notfound')
  let [refreshing, setRefreshing] = useState<boolean>(false)
  let [loadingQR, setLoadingQR] = useState<boolean>(false)
  let [showQR, setShowQR] = useState<boolean>(false)
  const [bbName, setBbName] = useState<string>('')

  async function load(refresh = false) {
    ping()
    if (refresh) setRefreshing(true)
    const name = await SecureStore.getItemAsync('bbName')
    setBbName(name || '')
    setRefreshing(false)
  }

  useEffect(() => {
    load(false) // Initial load
  }, [])

  useFocusEffect(
    React.useCallback(() => {
      // Start the interval when the screen is focused
      const interval = setInterval(() => {
        setRefreshing(true)
        ping()
        setRefreshing(false)
      }, 50000) // 50 seconds

      return () => {
        // Clear the interval when the screen loses focus
        clearInterval(interval)
      }
    }, [])
  )

  function ping() {
    fx(`/donor/qr`, {
      method: 'POST',
      body: {
        qr: true,
      },
    })
      .then(async (response) => {
        if (response.error) {
          Alert.alert('Error', 'Unauthorized Access', [
            {
              text: 'Go back',
              onPress: () => {
                SecureStore.deleteItemAsync('token')
                router.navigate('/')
              },
            },
          ])
        } else {
          setUUID(response.access.token)
        }
      })
      .catch((error) => {
        console.error(error)
      })
  }
  let isDarkMode = useColorScheme() === 'dark'
  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          width: '85%',
          marginBottom: 10,
          marginTop: 10,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Image
            source={require('../../assets/images/home.png')}
            style={{
              width: 40,
              height: 40,
              marginRight: 10,
            }}
          />
          <Text
            style={{
              fontSize: 26,
              color: '#7469B6',
              fontFamily: 'PlayfairDisplay_600SemiBold',
            }}
          >
            {bbName}
          </Text>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={{
          justifyContent: 'center',
          alignItems: 'center',
        }}
        //refresh control
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              load(true)
            }}
          />
        }
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 20,
          }}
        >
          {loadingQR ? (
            <ActivityIndicator
              size="small"
              color={isDarkMode ? 'white' : 'black'}
            />
          ) : (
            <>
              <QRCode
                value={`ob-${uuid}` || 'ob-notfound'}
                backgroundColor="transparent"
                color={isDarkMode ? 'white' : 'black'}
                size={325}
              />
            </>
          )}
        </View>
        <Button onPress={ping} style={{ marginTop: 20 }}>
          Refresh QR Code
        </Button>
        <Text
          style={{
            fontSize: 16,
            textAlign: 'center',
            margin: 20,
            color: isDarkMode ? 'white' : 'black',
          }}
        >
          This QR code verifies your identity when you donate. Scanning it
          allows blood banks to update your records and optionally add you to
          their donor list.
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}
