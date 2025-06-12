import styles from '@/assets/styles/styles'
import Button from '@/components/Button'
import FreeButton from '@/components/FreeButton'
import TwoRowInput from '@/components/TwoRowInput'
import Octicons from '@expo/vector-icons/Octicons'
import { Picker } from '@react-native-picker/picker'
import { router, useLocalSearchParams } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import React, { useState } from 'react'
import {
  Alert,
  Platform,
  Pressable,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
export default function Modal() {
  const local = useLocalSearchParams()
  let uuid = local.uuid
  let [bloodtype, setBloodtype] = useState<string>('A+')
  let [phoneNumber, setPhoneNumber] = useState<string>('')
  const token = local.token
  const bankCode = local.bankCode
  let [unitsRequired, setUnitsRequired] = useState<string>('0')
  let [minimumMonths, setMinimumMonths] = useState<string>('0')
  let [loading, setLoading] = useState<boolean>(false)
  let isDarkMode = useColorScheme() === 'dark'
  let responsiveColor = isDarkMode ? 'white' : 'black'
  function requestBlood() {
    setLoading(true)
    //check if units and months are numbers
    if (isNaN(Number(unitsRequired)) || isNaN(Number(minimumMonths))) {
      setLoading(false)
      Alert.alert('Error', 'Please enter valid numbers')
      return
    }
    router.push({
      pathname: '/processalert',
      params: {
        bankCode: bankCode,
        token: token,
        bloodtype: bloodtype,
        units: parseInt(unitsRequired),
        months: parseInt(minimumMonths),
        contact: phoneNumber,
      },
    })
  }

  return (
    <KeyboardAwareScrollView
      style={{
        backgroundColor: isDarkMode ? '#121212' : '#fff',
      }}
    >
      <View
        style={{
          justifyContent: 'center',
          gap: 20,
          width: '90%',
          alignSelf: 'center',
          marginBottom: 20,
        }}
      >
        <Pressable
          onPress={() => router.dismiss()}
          style={{
            width: '100%',
            alignSelf: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 20,
          }}
        >
          <Text
            style={{
              fontSize: 38,
              fontWeight: 'bold',
              textAlign: 'left',
              color: responsiveColor,
              fontFamily: 'PlayfairDisplay_600SemiBold',
            }}
          >
            Blood Alert
          </Text>
          <Octicons name="x" size={38} color={responsiveColor} />
        </Pressable>

        <Text
          style={{
            fontSize: 18,
            textAlign: 'center',
            color: responsiveColor,
          }}
        >
          What blood type do you need?
        </Text>
        <Picker
          selectedValue={bloodtype}
          onValueChange={(itemValue) => setBloodtype(itemValue)}
          style={{
            color: 'black',
            padding: 20,
            backgroundColor: '#fefefe',
            borderRadius: 16,
            width: 300,
            margin: 'auto',
          }}
        >
          <Picker.Item label="A+" value="A+" />
          <Picker.Item label="A-" value="A-" />
          <Picker.Item label="B+" value="B+" />
          <Picker.Item label="B-" value="B-" />
          <Picker.Item label="AB+" value="AB+" />
          <Picker.Item label="AB-" value="AB-" />
          <Picker.Item label="O+" value="O+" />
          <Picker.Item label="O-" value="O-" />
          <Picker.Item label="Bombay blood group" value="Bombay blood group" />
        </Picker>
        <Text
          style={{
            fontSize: 18,
            color: responsiveColor,
            textAlign: 'center',
          }}
        >
          How many units do you need?
        </Text>
        <View
          style={{
            margin: 'auto',
          }}
        >
          <TwoRowInput
            placeholder="2"
            value={unitsRequired}
            setValue={setUnitsRequired}
            keyboardType="numpad"
            style={{
              width: '90%',
              margin: 'auto',
            }}
          >
            units
          </TwoRowInput>
        </View>
        <Text
          style={{
            fontSize: 18,
            color: responsiveColor,
            textAlign: 'center',
          }}
        >
          What is the minimum month gap required from the last donation?
        </Text>

        <View
          style={{
            margin: 'auto',
          }}
        >
          <TwoRowInput
            placeholder="4"
            value={minimumMonths}
            setValue={setMinimumMonths}
            keyboardType="numpad"
            style={{
              width: '90%',
              margin: 'auto',
            }}
          >
            months
          </TwoRowInput>
        </View>
        <Text
          style={{
            fontSize: 18,
            color: responsiveColor,
            textAlign: 'center',
          }}
        >
          What phone number should the donors contact?
        </Text>
        <TextInput
          style={{ ...styles.input, width: '90%', margin: 'auto' }}
          placeholderTextColor={'grey'}
          placeholder="9123456789"
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
        />

        <Text
          style={{
            fontSize: 18,
            color: responsiveColor,
            textAlign: 'center',
          }}
        >
          This will send a notification to{' '}
          <Text style={{ fontWeight: 'bold' }}>all</Text> eligible donors in
          your blood bank.
        </Text>
        <FreeButton onPress={requestBlood}>
          {loading ? 'Initiating...' : 'Send Alert'}
        </FreeButton>
        <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      </View>
    </KeyboardAwareScrollView>
  )
}