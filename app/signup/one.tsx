import FreeButton from '@/components/FreeButton'
import { Octicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import React, { useEffect, useState } from 'react'
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  useColorScheme,
  View
} from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import * as Progress from 'react-native-progress'
import { SafeAreaView } from 'react-native-safe-area-context'
export default function ThreeAlpha({
  navigation,
  route,
}: {
  navigation: any
  route: any
}) {
  let [phoneNumber, setPhoneNumber] = useState<string>(
    route.params?.phoneNumber || ''
  )
  let [baseBank, setBaseBank] = useState<{
    name: string
    uuid: string
    coords: string
    region: string
  }>(
    route.params?.baseBank || {
      name: '',
      uuid: '',
      coords: '',
      region: '',
    }
  )
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
    fetch('http://192.168.1.16:3000/donor/banks', {
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
              <Text
                style={{
                  color: '#7469B6',
                  fontFamily: 'PlayfairDisplay_600SemiBold',
                }}
              >
                Open Blood
              </Text>{' '}
              Sign Up
            </Text>
          </View>
          <Progress.Bar
            progress={0.2}
            width={300}
            height={10}
            color="#7469B6"
            borderRadius={10}
          />
        </View>
        <Text
          style={{
            fontSize: 28,
            textAlign: 'left',
            marginBottom: 20,
            color: '#7469B6',
          }}
        >
          Base Blood Bank
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
          <ScrollView
            contentContainerStyle={{
              height: 300,
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {banks.map((bank) => {
              return (
                <Pressable
                  key={bank.uuid}
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
                        color:
                          baseBank == bank || isDarkMode ? 'white' : 'black',
                      }}
                    >
                      {bank.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: 16,
                        color:
                          baseBank == bank || isDarkMode ? 'white' : 'black',
                      }}
                    >
                      {bank.region}
                    </Text>
                  </View>
                  <Octicons
                    name={`dot${baseBank == bank ? '-fill' : ''}`}
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
            justifyContent: 'center',
          }}
        >
          <FreeButton
            onPress={() => {
              navigation.navigate(`two`, {
                ...route.params,
                phoneNumber: phoneNumber,
                baseBank: baseBank,
              })
            }}
            style={{
              width: '90%',
            }}
            disabled={baseBank.uuid === '' ? true : false}
          >
            Next
          </FreeButton>
        </View>
      </SafeAreaView>
    </KeyboardAwareScrollView>
  )
}
