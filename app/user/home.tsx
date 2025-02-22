import Button from '@/components/Button'
import Card from '@/components/Card'
import Octicons from '@expo/vector-icons/Octicons'
import { BlurView } from 'expo-blur'
import { router } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import * as SplashScreen from 'expo-splash-screen'
import { useCallback, useEffect, useState } from 'react'
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
SplashScreen.preventAutoHideAsync()

export default function Home() {
  let [refreshing, setRefreshing] = useState<boolean>(false)
  let [name, setName] = useState<string>('')
  let [donated, setDonated] = useState<number | null>(null)
  let [verified, setVerified] = useState<boolean>(true)
  let [lastDonation, setLastDonation] = useState<string>('')
  let [totalDonators, setTotalDonators] = useState<number | null>(null)
  let [log, setLog] = useState<{ x: string; y: number }[]>([])
  let [donatingSince, setDonatingSince] = useState<string>('')
  let [appReady, setAppReady] = useState<boolean>(false)
  let [bbName, setBBName] = useState<string>('')
  let [bbId, setBBId] = useState<string | null>('')
  let [bbPhone, setBBPhone] = useState<string>('')

  let [showModal, setShowModal] = useState<boolean>(false)
  let [allBanks, setAllBanks] = useState<
    {
      name: string
      uuid: string
      phone: string
      coords: string
      region: string
    }[]
  >([])
  function humanizeDate(date: string) {
    let d = new Date(date)
    //return DDth MMM, YYYY at HH:MM AM/PM
    return `${d.getDate()}${
      [1, 21, 31].includes(d.getDate())
        ? 'st'
        : [2, 22].includes(d.getDate())
        ? 'nd'
        : [3, 23].includes(d.getDate())
        ? 'rd'
        : 'th'
    } ${
      [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ][d.getMonth()]
    } ${d.getFullYear()} at ${d.getHours() % 12 || 12}:${
      d.getMinutes() < 10 ? '0' : ''
    }${d.getMinutes()} ${d.getHours() > 12 ? 'PM' : 'AM'}`
  }
  async function load(refresh = false) {
    if (refresh) setRefreshing(true)
    let token = await SecureStore.getItemAsync('token')
  let bbId = await SecureStore.getItemAsync('bbId')
    fetch(`http://192.168.1.16:3000/donor/user-stats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: token,
        bank: bbId,
      }),
    })
      .then((response) => response.json())
      .then(async (response) => {
        console.log(response)
        if (refresh) setRefreshing(false)
        if (response.error) {
          await SecureStore.deleteItemAsync('token')
          setName('')
          setDonated(null)
          setLastDonation('')
          setTotalDonators(null)
          setDonatingSince('')
          setLog([])

          /*Alert.alert(
            'User not found.',
            response.error, //login again redirect
            [
              {
                text: 'Sign in',
                onPress: () => {
                  SecureStore.deleteItemAsync('token')
                  router.navigate('/')
                },
              },
            ]
          )*/
        } else {
          setName(response.data.name)
          setDonated(response.data.donated)
          setLastDonation(response.data.lastDonated)
          setTotalDonators(response.data.totalDonators)
          setDonatingSince(response.data.donatingSince)
          setLog(response.data.log.reverse())
          setVerified(response.data.verified)
          setBBName(response.data.bank.name)
          await SecureStore.setItemAsync('bbName', response.data.bank.name)
          await SecureStore.setItemAsync('bbid', response.data.bank.id)
          setBBPhone(response.data.bank.phone)
          console.log(response.data.installed)
          if (response.data.installed === false) {
            router.push({
              pathname: '/accountmigration',
              params: {
                name: response.data.name,
                phone: response.data.phone,
                coords: response.data.coords,
              },
            })
          }
        }
      })
      .catch((error) => {
        if (refresh) setRefreshing(true)
        console.log(error)
      })
  }
  useEffect(() => {
    async function init() {
      console.log('loading')
      let id = await SecureStore.getItemAsync('bbId')
      console.log(id)
      setBBId(id)
      load(false)
      setAppReady(true)
    }
    init()
  }, [])
  let isDarkMode = useColorScheme() === 'dark'

  const onLayoutRootView = useCallback(async () => {
    if (appReady) {
      await SplashScreen.hideAsync()
    }
  }, [appReady])

  if (!appReady) {
    return null
  }

  async function initiateSwitchBankModal() {
    let token = await SecureStore.getItemAsync('token')
    fetch(`http://192.168.1.16:3000/donor/get-banks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uuid: token,
      }),
    })
      .then((response) => response.json())
      .then(async (response) => {
        if (response.error) {
          Alert.alert('Error', response.message)
        } else {
          let localBanks = response.data
          let index = localBanks.findIndex(
            (x: {
              name: string
              uuid: string
              phone: string
              coords: string
              region: string
            }) => x.uuid === bbId
          )
          localBanks.splice(index, 1)
          setAllBanks(localBanks)
          setShowModal(true)
        }
      })
  }
  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Modal
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowModal(false)
        }}
        visible={showModal}
      >
        <TouchableOpacity
          onPressOut={() => {
            setShowModal(false)
          }}
          style={{
            flex: 1,
          }}
        />
        <View
          style={{
            height: '55%',
            borderRadius: 25,
            padding: 16,
            marginTop: 'auto',
            backgroundColor: isDarkMode ? '#121212' : 'white',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 24,
                textAlign: 'left',
                color: isDarkMode ? 'white' : 'black',
                paddingBottom: 10,
                fontFamily: 'PlayfairDisplay_600SemiBold',
              }}
            >
              Switch Blood Banks
            </Text>
            <Pressable
              onPress={() => {
                setShowModal(false)
              }}
              style={{
                backgroundColor: '#7469B6',
                width: 45,
                height: 45,
                borderRadius: 9,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Octicons name="x" size={24} color="white" />
            </Pressable>
          </View>
          <FlatList
            data={allBanks}
            keyExtractor={(item) => item.uuid}
            contentContainerStyle={{
              paddingTop: 20,
            }}
            ListFooterComponent={
              <Text
                style={{
                  fontSize: 18,
                  paddingTop: 10,
                  textAlign: 'center',
                  color: isDarkMode ? 'white' : 'black',
                }}
              >
                You can add more banks in the Settings tab.
              </Text>
            }
            renderItem={({ item }) => (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 20,
                  backgroundColor: isDarkMode ? '#242526' : '#fff',
                  padding: 16,
                  borderRadius: 9,
                }}
              >
                <View style={{ flexDirection: 'column', gap: 5 }}>
                  <Text
                    style={{
                      fontSize: 18,
                      textAlign: 'left',
                      color: isDarkMode ? 'white' : 'black',
                    }}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      textAlign: 'left',
                      color: isDarkMode ? 'white' : 'black',
                    }}
                  >
                    {item.region}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <Pressable
                    onPress={async () => {
                      setBBName(item.name)
                      await SecureStore.setItemAsync('bbName', item.name)
                      setBBId(item.uuid)
                      await SecureStore.setItemAsync('bbId', item.uuid)
                      load(true)
                      setShowModal(false)
                    }}
                    style={{
                      backgroundColor: '#7469B6',
                      width: 45,
                      height: 45,
                      borderRadius: 22.5,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Octicons name="chevron-right" size={24} color="white" />
                  </Pressable>
                </View>
              </View>
            )}
          />
        </View>
      </Modal>
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
              {bbName}
            </Text>
          </Text>
          <Text
            style={{
              color: isDarkMode ? 'white' : 'black',
            }}
          >
            Open Blood
          </Text>
        </View>
        <Pressable
          onPress={initiateSwitchBankModal}
          style={{
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Octicons name="chevron-down" size={24} color="#7469B6" />
        </Pressable>
      </View>
      <ScrollView
        style={{
          width: '100%',
        }}
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
            alignContent: 'flex-start',
            width: '80%',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 22,
              textAlign: 'left',
              color: isDarkMode ? 'white' : 'black',
              flexDirection: 'row',
              justifyContent: 'flex-start',
            }}
          >
            <Text>Hello{name.trim() === '' ? '!' : ', '}</Text>
            <Text style={{ color: '#7469B6', fontWeight: 'bold' }}>
              {name}
            </Text>{' '}
            <Pressable
              onPress={() => {
                if (verified === true) {
                  Alert.alert(
                    'Verified!',
                    'Your details have been verified by the blood center.'
                  )
                } else {
                  Alert.alert(
                    'Unverified',
                    'Your details have not been verified yet. Please allow a few days for verification. Alternatively, you can visit or call the blood center to get verified.'
                  )
                }
              }}
            >
              {verified === true && name !== '' ? (
                <Octicons
                  name="verified"
                  size={24}
                  color="#7469B6"
                  style={{ marginLeft: 5 }}
                />
              ) : name !== '' ? (
                <Octicons
                  name="unverified"
                  size={24}
                  color="#FF3B2F"
                  style={{ marginLeft: 5 }}
                />
              ) : null}
            </Pressable>
          </Text>
        </View>
        <View
          style={{
            marginTop: 20,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <View
            style={{
              width: '100%',
              gap: 10,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 20,
            }}
          >
            <Card
              icon="heart-fill"
              iconColor="#AD88C6"
              title={donated?.toString() || ''}
              subtitle="units donated"
            />
            <Card
              icon="calendar"
              iconColor="#AD88C6"
              title={lastDonation}
              subtitle="last donation"
            />
          </View>
          <View
            style={{
              width: '100%',
              gap: 10,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 20,
            }}
          >
            <Card
              icon="code-of-conduct"
              iconColor="#AD88C6"
              title={totalDonators?.toString() || ''}
              subtitle="total donors"
            />
            <Card
              icon="graph"
              iconColor="#AD88C6"
              title={donatingSince}
              subtitle="donating since"
            />
          </View>
          {verified == false ? (
            <View
              style={{
                width: '80%',
                backgroundColor: isDarkMode ? '#242526' : '#fff',
                borderRadius: 10,
                justifyContent: 'flex-start',
                padding: 20,
                alignItems: 'center',
                flexDirection: 'column',
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  color: isDarkMode ? 'white' : 'black',
                  marginBottom: 10,
                }}
              >
                Verification status:{' '}
                <Text
                  style={{
                    color: '#FF3B2F',
                  }}
                >
                  Unverified
                </Text>
              </Text>
              <Text
                style={{ fontSize: 16, color: isDarkMode ? 'white' : 'black' }}
              >
                Your details have not been verified yet. Please allow a few days
                for verification. Alternatively, you can visit or call the blood
                center to get verified.
              </Text>
            </View>
          ) : null}

          <Button
            onPress={() => {
              router.push(`tel:${bbPhone}`)
            }}
          >
            📞 Call Blood Center
          </Button>
        </View>
        <Text
          style={{
            fontSize: 24,
            textAlign: 'left',
            marginBottom: 20,
            width: '80%',
            marginTop: 20,
          }}
        >
          Log
        </Text>
        <View
          style={{
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            gap: 20,
            marginBottom: 100,
          }}
        >
          {log.map((item, index) => {
            let { x, y } = item
            let parsedXString = ''
            if (x.startsWith('v')) {
              parsedXString = `Verified blood type as ${x.split('-')[1]}`
            } else if (x.startsWith('d')) {
              parsedXString = `Donated blood`
            }

            return (
              <View
                key={index}
                style={{
                  width: '80%',
                  backgroundColor: isDarkMode ? '#242526' : '#f3f3f3',
                  borderRadius: 10,
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                  padding: 20,
                  shadowColor: '#7469B6',
                  shadowOpacity: 0.3,
                  shadowRadius: 20,
                  elevation: 10,
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    marginBottom: 10,
                    color: isDarkMode ? '#fff' : '#000',
                  }}
                >
                  {parsedXString}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: 'gray',
                  }}
                >
                  {humanizeDate(y.toString())}
                </Text>
              </View>
            )
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
