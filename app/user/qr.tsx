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
import * as Progress from 'react-native-progress'

export default function QR() {
  let [uuid, setUUID] = useState<string | null>('notfound')
  let [refreshing, setRefreshing] = useState<boolean>(false)
  let [loadingQR, setLoadingQR] = useState<boolean>(false)
  let [showQR, setShowQR] = useState<boolean>(false)
  const [bbName, setBbName] = useState<string>('')

  const QR_EXPIRY_SECONDS = 50
  const [qrTimer, setQrTimer] = useState<number>(QR_EXPIRY_SECONDS)
  const [qrExpired, setQrExpired] = useState<boolean>(false)

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

  // Timer for QR expiry
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined
    setQrTimer(QR_EXPIRY_SECONDS)
    setQrExpired(false)
    interval = setInterval(() => {
      setQrTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          setQrExpired(true)
          // Automatically refresh QR when expired
          setTimeout(() => {
            setQrExpired(false)
            setQrTimer(QR_EXPIRY_SECONDS)
            ping()
          }, 600) // brief pause for feedback
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [uuid])

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
      {/* Centralized Open Blood header */}
      <View
        style={{
          width: '100%',
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 10,
          marginTop: 24,
          marginBottom: 10,
        }}
      >
        <Image
          source={require('../../assets/images/home.png')}
          style={{
            width: 48,
            height: 48,
            marginBottom: 6,
          }}
        />
        <Text
          style={{
            fontSize: 28,
            color: '#7469B6',
            fontFamily: 'PlayfairDisplay_600SemiBold',
            letterSpacing: 1,
          }}
        >
          Open Blood
        </Text>
      </View>
      <ScrollView
        contentContainerStyle={{
          justifyContent: 'center',
          alignItems: 'center',
        }}
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
            minHeight: 350, // Ensures space for loader and QR
          }}
        >
          {loadingQR ? (
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                height: 325,
                width: 325,
                borderRadius: 24,
                backgroundColor: isDarkMode ? '#18181b' : '#f8f8fc',
                shadowColor: '#7469B6',
                shadowOpacity: 0.06,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 2 },
              }}
            >
              <ActivityIndicator
                size="large"
                color="#7469B6"
                style={{ marginBottom: 12 }}
              />
              <Text
                style={{
                  color: '#7469B6',
                  fontSize: 16,
                  marginTop: 8,
                }}
              >
                Loading QR...
              </Text>
            </View>
          ) : (
            <>
              <QRCode
                value={`ob-${uuid}` || 'ob-notfound'}
                backgroundColor="transparent"
                color={isDarkMode ? 'white' : 'black'}
                size={325}
              />
              {/* Progress bar for QR expiry */}
              <View style={{ alignItems: 'center', marginTop: 18 }}>
                <Progress.Bar
                  progress={qrTimer / QR_EXPIRY_SECONDS}
                  width={180}
                  height={8}
                  color={qrExpired ? '#e57373' : '#7469B6'}
                  unfilledColor="#ececec"
                  borderWidth={0}
                  borderRadius={8}
                  animated
                />
                <Text
                  style={{
                    fontSize: 13,
                    color: qrExpired ? '#e57373' : '#888',
                    marginTop: 4,
                    letterSpacing: 1,
                  }}
                >
                  {qrExpired
                    ? 'QR expired'
                    : `Expires in ${qrTimer}s`}
                </Text>
              </View>
            </>
          )}
        </View>
        {/* Tasteful refresh QR button */}
        <View style={{ alignItems: 'center', marginTop: 24 }}>
          <Button
            onPress={() => {
              setQrExpired(false)
              setQrTimer(QR_EXPIRY_SECONDS)
              ping()
            }}
            // Button is always enabled now
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#f5f5fa',
              borderRadius: 8,
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderWidth: 1,
              borderColor: '#7469B6',
              shadowColor: '#7469B6',
              shadowOpacity: 0.08,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 2 },
            }}
          >
            <Text
            >
              Refresh QR Code
            </Text>
          </Button>
        </View>
        <Text
          style={{
            fontSize: 16,
            textAlign: 'center',
            margin: 20,
            color: isDarkMode ? 'white' : 'black',
          }}
        >
          This QR code is your universal donor ID. Show it at any blood center in the Network to log your donation, update your records, and connect.
          
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}
