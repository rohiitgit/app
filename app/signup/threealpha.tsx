import {
  Alert,
  Keyboard,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  useColorScheme,
  View,
} from 'react-native'
import * as SecureStore from 'expo-secure-store'
import { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import styles from '../../assets/styles/styles'
import { Picker } from '@react-native-picker/picker'
import Button from '@/components/Button'
import { Link, router } from 'expo-router'
import TwoRowInput from '@/components/TwoRowInput'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import * as Progress from 'react-native-progress'
import { Octicons } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker'
import FreeButton from '@/components/FreeButton'
import React from 'react'
export default function ThreeAlpha({
  navigation,
  route,
}: {
  navigation: any
  route: any
}) {
  let [baseBank, setBaseBank] = useState<{
    name: string
    uuid: string
    coords: string
    region: string
  }>({
    name: '',
    uuid: '',
    coords: '',
    region: '',
  })
  let [banks, setBanks] = useState<
    {
      name: string
      uuid: string
      coords: string
      region: string
    }[]
  >([])
  delete route.params?.basebank

  let isDarkMode = useColorScheme() === 'dark'
  let responsiveDark = useColorScheme() === 'dark' ? 'white' : 'black'

  function retrieveBanks() {
    fetch('http://localhost:3000/donor/banks', {
      method: 'GET',
    })
      .then((response) => response.json())
      .then(async (response) => setBanks(response.banks))
      .catch((error) => {
        console.error(error)
        Alert.alert('Error', 'Could not fetch blood banks')
      })
  }

  useEffect(() => {
    retrieveBanks()
  }, [])
  return (
    <KeyboardAwareScrollView
      contentContainerStyle={{
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <SafeAreaView>
        <View
          style={{
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '100%',
            marginBottom: 40,
            marginTop: 20,
            gap: 20,
            alignSelf: 'center',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-start',
              alignItems: 'center',
              gap: 20,
            }}
          >
            <Pressable onPress={() => router.push('/')}>
              <Octicons name="arrow-left" size={24} color={responsiveDark} />
            </Pressable>
            <Text
              style={{
                fontSize: 24,
                textAlign: 'center',
                color: responsiveDark,
              }}
            >
              <Text style={{ color: '#7469B6' }}>Open Blood</Text> Internal
            </Text>
          </View>
          <Progress.Bar
            progress={0.7}
            width={300}
            height={10}
            color="#7469B6"
            borderRadius={10}
          />
        </View>
        <Text
          style={{
            fontSize: 28,
            textAlign: 'center',
            margin: 'auto',
            marginBottom: 20,
            color: responsiveDark,
          }}
        >
          Sign up | <Text style={{ color: '#7469B6' }}>Base Blood Bank</Text>
        </Text>

        <View
          style={{
            width: '80%',
          }}
        >
          <Text
            style={{
              fontSize: 18,
              marginBottom: 30,
              color: responsiveDark,
              fontFamily: 'S',
            }}
          >
            Choose the blood bank you would like to donate to regularly.
          </Text>
          <ScrollView style={{ height: 300, gap: 10 }}>
            {banks.map((bank) => {
              return (
                <Pressable
                  onPress={() => {
                    if (baseBank == bank) {
                      setBaseBank({
                        name: '',
                        uuid: '',
                        coords: '',
                        region: '',
                      })
                    } else {
                      setBaseBank(bank)
                    }
                  }}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 20,
                    borderRadius: 10,
                    backgroundColor:
                      baseBank == bank
                        ? '#7469B6'
                        : isDarkMode
                        ? '#242526'
                        : '#fff',
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'column',
                      gap: 10,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        color: baseBank == bank || isDarkMode ? 'white' : 'black',
                      }}
                    >
                      {bank.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: 16,
                        color: baseBank == bank || isDarkMode ? 'white' : 'black',
                      }}
                    >
                      {bank.region}
                    </Text>
                  </View>
                  <Octicons
                    name="dot"
                    size={24}
                    color={baseBank == bank ? 'white' : 'black'}
                  />
                </Pressable>
              )
            })}
          </ScrollView>
          <Text
            style={{
              fontSize: 18,
              marginBottom: 30,
              color: responsiveDark,
              fontFamily: 'S',
            }}
          >
            {'\n\n'}
            {baseBank.name == ''
              ? 'No bank selected.'
              : `${baseBank.name} will process your application and manage your Open Blood profile.`}
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'column',
            gap: 20,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              gap: 20,
            }}
          >
            <FreeButton
              onPress={() => {
                navigation.navigate(`three`, {
                  ...route.params,
                  baseBank: baseBank,
                })
              }}
              style={{
                width: '25%',
              }}
            >
              Back
            </FreeButton>
            <FreeButton
              onPress={() => {
                navigation.navigate(`four`, {
                  ...route.params,
                  baseBank: baseBank,
                })
              }}
              style={{
                width: '40%',
              }}
              disabled={baseBank.uuid === '' ? true : false}
            >
              Next
            </FreeButton>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAwareScrollView>
  )
}
