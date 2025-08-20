import FreeButton from '@/components/FreeButton'
import { Octicons } from '@expo/vector-icons'
import { Picker } from '@react-native-picker/picker'
import { router } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import { useEffect, useState } from 'react'
import * as Device from 'expo-device'
import { Alert, Pressable, Text, useColorScheme, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import * as Progress from 'react-native-progress'
import { SafeAreaView } from 'react-native-safe-area-context'
export default function Five({
  navigation,
  route,
}: {
  navigation: any
  route: any
}) {
  //console.log(route.params)
  let [birthdayHero, setBirthdayHero] = useState<boolean>(
    route.params?.birthdayHero || false
  )
  let [loadingProcess, setLoadingProcess] = useState<boolean>(false)
  delete route.params?.birthdayHero
  //console.log(route.params)

  function signup() {
    setLoadingProcess(true)
    let os =
      Device.osName === 'Android'
        ? 'a'
        : Device.osName === 'iOS' || Device.osName === 'iPadOS'
        ? 'i'
        : ''
    /**
     * @params {phoneNumber} string [EXISTS]
     * @params {affiliated} string (convert to boolean)
     * @params {affiliatedata} object {designation: string, yearOfJoining: number, department: string}
     * @params {name} string [EXISTS]
     * @params {sex} string
     * @params {dob} timestampz
     * @params {weight} number [EXISTS]
     * @params {height} number [EXISTS]
     * @params {bloodgroup} string [EXISTS]
     * @params {conditions} string
     * @params {medications} string
     * @params {distance} number
     * @params {birthdayHero} boolean
     */
    //console.log(route.params.location.latitude, route.params.location.longitude)
    var payload = {
      phonenumber: route.params.phoneNumber,
      name: route.params.name,
      sex: route.params.sex,
      dob: route.params.dob,
      weight: route.params.weight,
      height: route.params.height,
      bloodtype: route.params.bloodtype,
      conditions: route.params.conditions,
      medications: route.params.medications,
      distance: route.params.distance,
      birthdayhero: birthdayHero,
      scope: route.params.baseBank.uuid,
      os: os,
      coords: route.params.location
        ? route.params.location.hasOwnProperty('latitude')
          ? `${route.params.location.latitude},${route.params.location.longitude}`
          : route.params.location.address
        : '',
    }
    console.log(payload)
    fetch(
      `${
        __DEV__ ? 'http://localhost:3000' : 'https://core.ob.pidgon.com'
      }/donor/signup`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    )
      .then((response) => response.json())
      .then(async (response) => {
        console.log(response)
        if (response.error) {
          setLoadingProcess(false)
          alert(response.message)
        } else {
          await SecureStore.setItemAsync('token', response.access.token)
          await SecureStore.setItemAsync('refresh', response.refresh.token)
          await SecureStore.setItemAsync(
            'tokenexp',
            response.access.exp.toString()
          )
          await SecureStore.setItemAsync(
            'refreshexp',
            response.refresh.exp.toString()
          )
          await SecureStore.deleteItemAsync('lookup')
          router.push({
            pathname: '/signupcomplete',
            params: {
              phone: response.data.phone,
              name: response.data.name,
              bankName: response.data.bankname,
            },
          })
        }
      })
      .catch((error) => {
        console.log('fetcherror', error)
        setLoadingProcess(false)
        alert(error)
      })
  }
  let responsiveDark = useColorScheme() === 'dark' ? 'white' : 'black'
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
            <Pressable
              onPress={() => {
                Alert.alert(
                  'Are you sure?',
                  'Going back will reset your progress.',
                  [
                    {
                      text: 'Cancel',
                      style: 'cancel',
                    },
                    {
                      text: 'Yes',
                      style: 'destructive',
                      onPress: () => {
                        router.replace('/')
                      },
                    },
                  ]
                )
              }}
            >
              <Octicons name="arrow-left" size={24} color={responsiveDark} />
            </Pressable>
            <Text
              style={{
                fontSize: 24,
                textAlign: 'center',
                color: '#7469B6',
                fontFamily: 'PlayfairDisplay_600SemiBold',
              }}
            >
              Open Blood
            </Text>
          </View>
          <Progress.Bar
            progress={1}
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
            fontFamily: 'PlayfairDisplay_600SemiBold',
            color: '#7469B6',
          }}
        >
          Extras
        </Text>
        <View
          style={{
            width: '80%',
          }}
        >
          <Text
            style={{
              fontSize: 18,
              marginBottom: 20,
              color: responsiveDark,
              fontWeight: 'bold',
            }}
          >
            Birthday coming up?
          </Text>
          <Text
            style={{
              fontSize: 18,
              marginBottom: 20,
              color: responsiveDark,
            }}
          >
            We can remind you so you can celebrate by donating and save a life.
          </Text>
          <View>
            <Picker
              selectedValue={birthdayHero}
              onValueChange={(itemValue) => {
                setBirthdayHero(itemValue)
              }}
            >
              <Picker.Item label="Yes" value={true} color={responsiveDark} />
              <Picker.Item label="No" value={false} color={responsiveDark} />
            </Picker>
          </View>
        </View>
        <View
          style={{
            flex: 1,
            flexGrow: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '80%',
            gap: 20,
          }}
        >
          <FreeButton
            onPress={() => {
              navigation.navigate(`four`, {
                ...route.params,
                birthdayHero,
              })
            }}
            style={{
              width: '25%',
            }}
          >
            Back
          </FreeButton>
          <FreeButton
            onPress={signup}
            style={{
              width: '50%',
            }}
            disabled={loadingProcess}
          >
            {loadingProcess ? 'Loading...' : 'Sign Up!'}
          </FreeButton>
        </View>
      </SafeAreaView>
    </KeyboardAwareScrollView>
  )
}
