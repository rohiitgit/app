import { Text, useColorScheme, View } from 'react-native'
import Octicons from '@expo/vector-icons/Octicons'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStackNavigator } from '@react-navigation/stack'
const Tab = createBottomTabNavigator()
const ModalStack = createStackNavigator()
import HQHome from './home'
import Camera from './camera'
import { useEffect } from 'react'
import Settings from './settings'
import Query from './query'
import React from 'react'

export default function HQIndex() {
  let isDarkMode = useColorScheme() === 'dark'
  return (
    <>
      <Tab.Navigator
       /* screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            position: 'absolute',
            bottom: '0%',
            left: '0%',
            width: '100%',
            alignSelf: 'center',
            height: '10%',
            paddingTop: 15,
            shadowColor: '#7469B6',
            shadowOpacity: 0.3,
            shadowRadius: 20,
            borderRadius: 64,
            borderTopWidth: 0,
            elevation: 10,
            backgroundColor: isDarkMode ? '#3a3b3c' : '#fff',
            backfaceVisibility: 'hidden',
          },
          sceneStyle: {
            backgroundColor: isDarkMode ? '#030303' : '#efeef7',
          },
          tabBarActiveTintColor: '#7469B6',
          tabBarIconStyle: {
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1,
          },
        }}*/
          screenOptions={{
            headerShown: false,
            tabBarShowLabel: false,
            tabBarStyle: {
              width: '100%',
              height: 80,
              justifyContent: 'center',
              alignSelf: 'center',
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
          name="camera"
          component={Camera}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Octicons name="database" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="home"
          component={HQHome}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Octicons name="home" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="query"
          component={Query}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Octicons name="person" color={color} size={size} />
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
    </>
  )
}
