import Button from '@/components/Button'
import FreeButton from '@/components/FreeButton'
import { BlurView } from 'expo-blur'
import * as SecureStore from 'expo-secure-store'
import { useEffect, useState } from 'react'
import {
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

  async function regenerateUUID() {
    fetch(`https://api.pdgn.xyz/donor/regenerate-id`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uuid: uuid,
      }),
    })
      .then((response) => response.json())
      .then(async (response) => {
        if (response.error) {
          alert(response.message)
        } else {
          SecureStore.setItemAsync('token', response.uuid)
          Alert.alert('ID Regenerated!', 'Please restart your app.', [
            {
              text: 'OK',
              onPress: () => {
                load()
              },
            },
          ])
        }
      })
      .catch((error) => {
        //console.log(error)
        alert(error)
      })
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
          <QRCode
            value={
              'bloodbank-' +
              (uuid === null ? 'notfound' : showQR ? uuid : 'hidden')
            }
            backgroundColor="transparent"
            color={isDarkMode ? 'white' : 'black'}
            size={325}
          />
          <BlurView
            intensity={showQR || uuid === null || refreshing == true ? 0 : 10}
            tint="systemMaterial"
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
            }}
          />
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
