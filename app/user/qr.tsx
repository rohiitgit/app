import Button from '@/components/Button'
import * as SecureStore from 'expo-secure-store'
import { useEffect, useState } from 'react'
import {
  RefreshControl,
  ScrollView,
  Text,
  useColorScheme,
  View,
} from 'react-native'
import QRCode from 'react-native-qrcode-svg'
import { SafeAreaView } from 'react-native-safe-area-context'
export default function QR() {
  let [uuid, setUUID] = useState<string | null>('notfound')
  let [refreshing, setRefreshing] = useState<boolean>(false)
  let [showQR, setShowQR] = useState<boolean>(false)
  const [bbName, setBbName] = useState<string>('')
  async function load(refresh = false) {
    if (refresh) setRefreshing(true)
    let token = await SecureStore.getItemAsync('token')
    const name = await SecureStore.getItemAsync('bbName')
    setBbName(name || '')
    setUUID(token)
    setRefreshing(false)
  }

  useEffect(() => {
    load(false)
  }, [])
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
          width: '80%',
          marginBottom: 20,
          marginTop: 10,
        }}
      >
        <View style={{ flexDirection: 'column', justifyContent: 'center' }}>
          <Text
            style={{
              fontSize: 26,
              textAlign: 'center',
              color: isDarkMode ? 'white' : 'black',
            }}
          >
            <Text
              style={{
                color: '#7469B6',
                fontFamily: 'PlayfairDisplay_600SemiBold',
              }}
            >
              {bbName ? bbName : 'Open Blood'}
            </Text>
          </Text>
          <Text
            style={{
              color: isDarkMode ? 'white' : 'black',
            }}
          >
            {bbName ? 'Open Blood' : ''}
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
          }}
        >
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <QRCode
              value={
                'bloodbank-' +
                (uuid === null ? 'notfound' : showQR ? uuid : 'hidden')
              }
              backgroundColor="transparent"
              color={isDarkMode ? 'white' : 'black'}
              size={325}
            />
          </View>
          <Button onPress={() => setShowQR(!showQR)}>
            {showQR ? 'Hide QR' : 'Show QR'}
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
          This QR code verifies your identity when you donate. Scanning it
          allows blood banks to update your records and optionally add you to
          their donor list.
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}
