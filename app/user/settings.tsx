import Button from '@/components/Button'
import { Octicons } from '@expo/vector-icons'
import * as Application from 'expo-application'
import { router } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import { useEffect, useState } from 'react'
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
export default function Settings() {
  let [uuid, setUUID] = useState<string | null>('notfound')
  let [refreshing, setRefreshing] = useState<boolean>(false)
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
  let [scopes, setScopes] = useState<
    {
      name: string
      uuid: string
      phone: string
      region: string
    }[]
  >([])

  async function delBank(bankcode: string) {
    fetch(`http://192.168.1.16:3000/donor/remove-bank`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uuid: uuid,
        bankcode: bankcode,
      }),
    })
      .then((response) => response.json())
      .then(async (response) => {
        if (response.error) {
          alert(response.message)
        } else {
          alert(
            'Bank deleted successfully! They will no longer be able to view your data.'
          )
          let localScopes = scopes
          let index = localScopes.findIndex((x) => x.uuid === bankcode)
          localScopes.splice(index, 1)
          setScopes(localScopes)
          load(true)
        }
      })
      .catch((error) => {
        console.log(error)
        alert(error)
      })
  }
  async function addBank(bankcode: string) {
    console.log(bankcode)
    fetch(`http://192.168.1.16:3000/donor/add-bank`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uuid: uuid,
        bankcode: bankcode,
      }),
    })
      .then((response) => response.json())
      .then(async (response) => {
        if (response.error) {
          alert(response.message)
        } else {
          //add to scopes
          let localScopes = scopes
          const foundBank = allBanks.find((x) => x.uuid === bankcode)
          if (foundBank) {
            localScopes.push({
              name: foundBank.name,
              uuid: foundBank.uuid,
              phone: foundBank.phone,
              region: foundBank.region,
            })
            alert(
              'Bank added successfully! You will now receive alerts from this bank.'
            )
            setScopes(localScopes)
            setShowModal(false)
            load(true)
          }
        }
      })
      .catch((error) => {
        console.log(error)
        alert(error)
      })
  }

  async function getAllBanks() {
    fetch('http://192.168.1.16:3000/donor/banks', {
      method: 'GET',
    })
      .then((response) => response.json())
      .then(async (response) => {
        setAllBanks(
          response.banks.filter((x: any) => {
            //return !scopes.some((y) => y.uuid === x.uuid)
            return scopes
          })
        )
        setShowModal(true)
      })
      .catch((error) => {
        console.error(error)
        Alert.alert('Error', 'Could not fetch blood banks')
      })
  }
  async function load(refresh = false) {
    if (refresh) setRefreshing(true)

    let token = await SecureStore.getItemAsync('token')
    setUUID(token)
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
          alert(response.message)
        } else {
          setScopes(response.data)
        }
      })
      .catch((error) => {
        console.log(error)
        alert(error)
      })
    setRefreshing(false)
  }

  useEffect(() => {
    load(false)
  }, [])
  let isDarkMode = useColorScheme() === 'dark'
  function reportBug() {
    router.push(
      'mailto:openblood@pidgon.com?subject=Open%20Blood%20Bug%20Report'
    )
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
              Add a Bank
            </Text>
            <Pressable
              onPress={() => {
                setShowModal(false)
              }}
              style={{
                width: 45,
                height: 45,
                borderRadius: 9,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Octicons name="x" size={24} color={
                isDarkMode ? 'white' : 'black'
              } />
            </Pressable>
          </View>
          <FlatList
            data={allBanks}
            keyExtractor={(item) => item.uuid}
            ListEmptyComponent={
              <Text
                style={{
                  fontSize: 18,
                  paddingTop: 10,
                  textAlign: 'center',
                  color: isDarkMode ? 'white' : 'black',
                }}
              >
                No banks found.
              </Text>
            }
          contentContainerStyle={{
            marginTop: 10,
          }}
            renderItem={({ item }) => (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 20,
                  backgroundColor: isDarkMode ? '#404040' : '#f2f0ef',
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
                  {
                    //check if bank is already added
                    scopes.some((x) => x.uuid === item.uuid) ? (
                      <Pressable
                        onPress={() => {
                          Alert.alert(
                            `Delete ${item.name}?`,
                            'This bank will no longer be able to view your data, and you will no longer receive alerts from them.',
                            [
                              {
                                text: 'Cancel',
                                style: 'cancel',
                              },
                              {
                                text: 'Delete',
                                style: 'destructive',
                                onPress: () => {
                                  delBank(item.uuid)
                                },
                              },
                            ]
                          )
                        }}
                        style={{
                          backgroundColor: '#ff8787',
                          width: 45,
                          height: 45,
                          borderRadius: 22.5,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <Octicons name="trash" size={24} color="white" />
                      </Pressable>
                    ) : (
                      <Pressable
                        onPress={() => {
                          Alert.alert(
                            `Add ${item.name}?`,
                            'You will start receiving alerts from this bank and they will be able to view your data.',
                            [
                              { text: 'Cancel', style: 'cancel' },
                              {
                                text: 'Add',
                                onPress: () => addBank(item.uuid),
                              },
                            ]
                          )
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
                        <Octicons name="plus" size={24} color="white" />
                      </Pressable>
                    )
                  }
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
        <Text
          style={{
            fontSize: 28,
            textAlign: 'center',
            color: '#7469B6',
            fontFamily: 'PlayfairDisplay_600SemiBold',
          }}
        >
          Open Blood
        </Text>
      </View>
      <ScrollView
        contentContainerStyle={{
          justifyContent: 'flex-start',
          marginTop: 20,
          gap: 10,
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
        <Text
          style={{
            fontSize: 28,
            color: isDarkMode ? 'white' : 'black',
            fontFamily: 'PlayfairDisplay_600SemiBold',
          }}
        >
          Settings
        </Text>
        <Text
          style={{
            fontSize: 20,
            textAlign: 'left',
            color: isDarkMode ? 'white' : 'black',
          }}
        >
          {'\n'}
          Your Banks
        </Text>
        <View>
          {scopes.map((item, index) => (
            <View
              key={item.uuid}
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
              <View
                style={{
                  flexDirection: 'column',
                  gap: 5,
                }}
              >
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
                  onPress={() => {
                    router.push(
                      `tel:+91${item.phone
                        .replace(/\s/g, '')
                        .replace('+91', '')}`
                    )
                  }}
                  style={{
                    backgroundColor: '#f3f3f3',
                    width: 45,
                    height: 45,
                    borderRadius: 22.5,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Octicons name="device-mobile" size={24} color="#7469B6" />
                </Pressable>
                {/*scopes.length == 1 && index == 0 ? null : (
                  <Pressable
                    onPress={() => {
                      Alert.alert(
                        `Delete ${item.name}?`,
                        'This bank will no longer be able to view your data, and you will no longer receive alerts from them.',
                        [
                          {
                            text: 'Cancel',
                            style: 'cancel',
                          },
                          {
                            text: 'Delete',
                            style: 'destructive',
                            onPress: () => {
                              delBank(item.uuid)
                            },
                          },
                        ]
                      )
                    }}
                    style={{
                      backgroundColor: '#ff8787',
                      width: 45,
                      height: 45,
                      borderRadius: 22.5,
                      justifyContent: 'center',
                      alignItems: 'center',
                      display: 'none',
                    }}
                  >
                    <Octicons name="trash" size={24} color="#7469B6" />
                  </Pressable>
                )*/}
              </View>
            </View>
          ))}
          <Pressable
            onPress={getAllBanks}
            style={{
              marginBottom: 20,
              backgroundColor: '#7469B6',
              padding: 16,
              borderRadius: 9,
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 10,
            }}
          >
            <Octicons name="plus" size={18} color="white" />
            <Text style={{ color: 'white', fontSize: 18, textAlign: 'center' }}>
              Modify Banks
            </Text>
          </Pressable>
        </View>
        <Button
          onPress={() => {
            router.push('mailto:openblood@pidgon.com')
          }}
        >
          <Octicons name="mail" size={20} /> Get Support
        </Button>
        <Button onPress={reportBug}>
          <Octicons name="bug" size={20} /> Report a Bug
        </Button>
        <Button
          onPress={() => {
            SecureStore.deleteItemAsync('token')
            router.replace('/')
          }}
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Octicons name="sign-out" size={20} /> Log out
        </Button>
        <View style={{ alignItems: 'center' }}>
          <Text
            style={{
              color: 'gray',
              marginTop: 20,
              fontSize: 16,
            }}
          >
            Open Blood Dist. {Application.nativeApplicationVersion} [
            {Application.nativeBuildVersion}]
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
