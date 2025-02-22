import Button from '@/components/Button';
import Octicons from '@expo/vector-icons/Octicons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { BlurView } from 'expo-blur';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { router, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import Home from './home';
import QR from './qr';
import Settings from './settings';
const Tab = createBottomTabNavigator()
const ModalStack = createStackNavigator()
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
})
export default function Index() {
  const [expoPushToken, setExpoPushToken] = useState('')
  const [channels, setChannels] = useState<Notifications.NotificationChannel[]>(
    []
  )
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined)
  const notificationListener = useRef<Notifications.EventSubscription>()
  const responseListener = useRef<Notifications.EventSubscription>()

  let [showModal, setShowModal] = useState<boolean>(false)

  let local: any = useLocalSearchParams()
  async function checkNotifs() {
    let uuid = await SecureStore.getItemAsync('token')
    const perms = await Notifications.getPermissionsAsync()
    let existingStatus = perms.status
    //if (existingStatus !== 'granted') {
    console.log('Requesting permissions')
    registerForPushNotificationsAsync().then(async (token) => {
      if (token) {
        setExpoPushToken(token)
        console.log('notif token', token)
        fetch('http://192.168.1.16:3000/donor/update-notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uuid: uuid,
            notificationToken: token,
          }),
        })
          .then((response) => response.json())
          .then((response) => {
            if (response.error) {
              Alert.alert('Error', response.error)
            } else {
              console.log('Notification token updated')
            }
          })
          .catch((error) => {
            console.log("Couldn't update notification token", error)
          })
      } else {
        Alert.alert('Error', 'Failed to get notification token')
      }
    })
    if (Platform.OS === 'android') {
      Notifications.getNotificationChannelsAsync().then((value) =>
        setChannels(value ?? [])
      )
    }
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification)
      })

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response)
      })

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(
          notificationListener.current
        )
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current)
    }
    //}
  }
  useEffect(() => {
    async function askUser() {
      let uuid = await SecureStore.getItemAsync('token')

      if (!uuid) {
        Alert.alert('Error', 'Please login to continue', [
          {
            text: 'Login',
            onPress: () => {
              router.navigate('/')
            },
          },
        ])
      } else {
        const perms = await Notifications.getPermissionsAsync()
        let existingStatus = perms.status
        console.log(`Existing status: ${existingStatus}`)

        if (existingStatus !== 'granted' && Device.isDevice) {
          if (existingStatus === 'denied') {
            setShowModal(true)
          } else {
            console.log('Requesting permissions')
            Alert.alert(
              `Notifications`,
              `We need your permission to send you critical notifications when the blood center needs your help. Please allow notifications to continue.`,
              [
                {
                  text: 'Allow',
                  onPress: checkNotifs,
                },
                {
                  text: 'Log out',
                  onPress: () => {
                    SecureStore.deleteItemAsync('token')
                    router.navigate('/')
                  },
                  style: 'destructive',
                },
              ]
            )
          }
        } else if (Device.isDevice) {
          checkNotifs()
        }
      }
    }
    askUser()
  }, [])
  let isDarkMode = useColorScheme() === 'dark'
  return (
    <BlurView intensity={100}>
      <Modal
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowModal(false)
        }}
        visible={showModal}
      >
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
              flexDirection: 'column',
              alignItems: 'flex-start',
            }}
          >
            <Text
              style={{
                fontSize: 26,
                textAlign: 'left',
                color: isDarkMode ? 'white' : 'black',
                paddingBottom: 10,
                fontFamily: 'PlayfairDisplay_600SemiBold',
              }}
            >
              Your blood bank needs you.
            </Text>
            <Text
              style={{
                fontSize: 22,
                textAlign: 'left',
                color: isDarkMode ? 'white' : 'black',
                paddingBottom: 10,
                paddingTop: 10,
              }}
            >
              Open Blood keeps you in the loop when lives depend on it.
              Notifications are how we alert you when your donation can make a
              real impact.
            </Text>
            <Text
              style={{
                fontSize: 22,
                textAlign: 'center',
                color: isDarkMode ? 'white' : 'black',
                paddingBottom: 10,
                fontWeight: 'bold',
              }}
            >
              Please enable notifications from your settings to continue.
            </Text>
          </View>
          <Button
            onPress={() => router.navigate('mailto:openblood@pidgon.com')}
          >
            <Text style={{ color: 'white', fontSize: 20 }}>
              Contact support
            </Text>
          </Button>
        </View>
      </Modal>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            width: '100%',
            height: 80,
            justifyContent: 'center',
            alignSelf: 'center',
            shadowColor: '#7469B6',
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 10,
            backgroundColor: isDarkMode ? '#3a3b3c' : '#fff',
            borderTopWidth: 0,
          },
          sceneStyle: {
            backgroundColor: isDarkMode ? '#030303' : '#efeef7',
          },
          tabBarActiveTintColor: '#7469B6',
          tabBarIconStyle: {
            verticalAlign: 'middle',
            marginTop: 20,
          },
        }}
        initialRouteName="home"
      >
        <Tab.Screen
          name="qr"
          component={QR}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Octicons name="heart" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="home"
          component={Home}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Octicons name="home" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="settings"
          component={Settings}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Octicons name="gear" color={color} size={size} />
            ),
          }}
        />
      </Tab.Navigator>
    </BlurView>
  )
}

async function registerForPushNotificationsAsync() {
  let token
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    })
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowCriticalAlerts: true,
        },
        android: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowVibration: true,
        },
      })
      finalStatus = status
    }
    if (finalStatus !== 'granted') {
      throw new Error('Failed to get push token for push notification!')
      return
    }
    // Learn more about projectId:
    // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
    // EAS projectId is used here.
    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId
      if (!projectId) {
        throw new Error('Project ID not found')
      }

      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data
    } catch (e) {
      token = `${e}`
    }

    console.log(token)
  } else {
    throw new Error('physical device required for notifications')
  }

  return token
}
