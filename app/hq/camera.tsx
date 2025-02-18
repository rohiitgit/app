import { CameraView, useCameraPermissions } from 'expo-camera'
import { useEffect, useState } from 'react'
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native'
import Button from '@/components/Button'
import Octicons from '@expo/vector-icons/Octicons'
import * as SecureStore from 'expo-secure-store'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
export default function Camera() {
  const [permission, requestPermission] = useCameraPermissions()
  const [flash, setFlash] = useState(false)
  const [side, setSide] = useState<'front' | 'back'>('back')
  const [currentData, setCurrentData] = useState<any>('')
  const [token, setToken] = useState<string | null>('')
  const [bankCode, setBankCode] = useState<string | null>('')
  const [bbName, setBbName] = useState<string>('')
  let isDarkMode = useColorScheme() === 'dark'
  useEffect(() => {
    async function getToken() {
      let t = await SecureStore.getItemAsync('token')
      let id = await SecureStore.getItemAsync('id')
      let name = await SecureStore.getItemAsync('bbName')
      setBbName(name || '')
      setToken(t)
      setBankCode(id)
    }
    getToken()
  }, [])
  function toggleFlash() {
    setFlash(!flash)
  }
  function toggleFront() {
    setSide(side === 'front' ? 'back' : 'front')
  }
  if (!permission) {
    // Camera permissions are still loading.
    return <View />
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            color: '#7469B6',
          }}
        >
          We need your permission to show the camera.
        </Text>
        <Button onPress={requestPermission} disabled={false}>
          Allow Camera Access
        </Button>
      </View>
    )
  }
  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          gap: 0,
          borderBottomLeftRadius: 64,
          borderBottomRightRadius: 64,
          padding: 20,
          width: '100%',
          flexDirection: 'column',
          //backgroundColor: '#efeef7',
        }}
      >
        <Text
          style={{
            fontSize: 26,
            textAlign: 'left',
            color: isDarkMode ? 'white' : 'black',
          }}
        >
          <Text
            style={{
              color: '#7469B6',
              fontFamily: 'PlayfairDisplay_600SemiBold',
            }}
          >
            {bbName ? bbName : 'Open Blood HQ'}
          </Text>
        </Text>
        <Text
          style={{
            color: isDarkMode ? 'white' : 'black',
          }}
        >
          {bbName ? 'Open Blood HQ' : ''}
        </Text>
      </View>
      <CameraView
        style={styles.camera}
        facing={side}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={(result) => {
          if (result.data == 'bloodbank-notfound') {
            Alert.alert(
              'Error',
              "The donor's identity could not be confirmed. Please reload the donor app and try again."
            )
          } else if (result.data.startsWith('bloodbank-') !== true) {
            setCurrentData('')
          } else {
            setCurrentData(result.data)
          }
        }}
        enableTorch={flash}
      ></CameraView>
      {/* <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          gap: 30,
          alignItems: 'center',
          width: '100%',
          position: 'absolute',
          top: '5%',
          borderRadius: 64,
          padding: 20,
          paddingTop: 10,
          paddingBottom: 10,
          elevation: 10,
          backdropFilter: 'blur(20px)',
          backgroundColor: "#efeef7"
        }}
      >
        <View
          style={{
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
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
              {bbName ? bbName : 'Open Blood HQ'}
            </Text>
          </Text>
          <Text
            style={{
              color: isDarkMode ? 'white' : 'black',
            }}
          >
            {bbName ? 'Open Blood HQ' : ''}
          </Text>
        </View>
      </View> */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          gap: 30,
          alignItems: 'center',
          width: '100%',
          position: 'absolute',
          bottom: '12%',
          borderRadius: 64,
          padding: 10,
          elevation: 10,
        }}
      >
        <Pressable
          style={{
            borderRadius: 64,
            backgroundColor: '#fff',
            padding: 10,
            elevation: 10,
          }}
          onPress={toggleFront}
        >
          <Octicons name="sync" size={28} color="#7469B6" />
        </Pressable>
        {currentData !== '' ? (
          <Pressable
            style={{
              borderRadius: 64,
              backgroundColor: '#fff',
              padding: 15,
            }}
            onPress={() => {
              router.push({
                pathname: '/logdonor',
                params: {
                  uuid: currentData,
                  id: bankCode,
                  token: token,
                },
              })
            }}
          >
            <Text
              style={{
                fontSize: 24,
                color: '#7469B6',
              }}
            >
              Scan!
            </Text>
          </Pressable>
        ) : null}
        <Pressable
          style={{
            borderRadius: 64,
            backgroundColor: '#fff',
            padding: 10,
            elevation: 10,
          }}
          onPress={toggleFlash}
        >
          <Octicons name="sun" size={28} color="#7469B6" />
        </Pressable>
      </View>
      <StatusBar style="auto" />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
    elevation: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
})