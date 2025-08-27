import React, { useState } from 'react'
import {
  StyleSheet,
  useColorScheme,
  useWindowDimensions,
  View,
  Text,
} from 'react-native'
import Animated, {
  FadeIn,
  FadeInDown,
  SlideInUp,
} from 'react-native-reanimated'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import FreeButton from '@/components/FreeButton'
import * as SecureStore from 'expo-secure-store'
import { router } from 'expo-router'

const SCREENS = [
  {
    headline: 'Hey there.',
    message: "We're really glad you're here.",
  },
  {
    headline: 'Welcome to Open Blood.',
    message: "Open Blood is built to make donating easier, safer, and smarter.",
  },
  {
    headline: 'Welcome to Open Blood.',
    message: "We'll help you:",
    showFeatures: true,
    features: [
      'Register in under 2 minutes',
      'Know when and where your blood is needed',
      'Keep track of your donations, eligibility, and history',
      'Get notified during critical shortages in your area',
    ],
  },
]

const FINAL_MESSAGE = "We're not here to sell you anything. Your data is encrypted and kept private. Only you decide who gets access to it."

const AppPreview = ({ 
  colorScheme, 
  delay = 0 
}: { 
  colorScheme: string | null
  delay?: number 
}) => (
  <Animated.View
    entering={FadeInDown.duration(400).delay(delay)}
    style={[
      styles.appPreview,
      {
        backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#f8f8f8',
        borderColor: colorScheme === 'dark' ? '#333' : '#ddd',
      },
    ]}
  >
    <View style={[
      styles.previewHeader, 
      { backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#e8e8e8' }
    ]}>
      <View style={[styles.dot, { backgroundColor: '#ff5f57' }]} />
      <View style={[styles.dot, { backgroundColor: '#ffbd2e' }]} />
      <View style={[styles.dot, { backgroundColor: '#28ca42' }]} />
    </View>
    <View style={styles.previewContent}>
      <View style={[
        styles.line, 
        { 
          backgroundColor: colorScheme === 'dark' ? '#444' : '#ccc',
          width: '70%' 
        }
      ]} />
      <View style={[
        styles.line, 
        { 
          backgroundColor: colorScheme === 'dark' ? '#444' : '#ccc',
          width: '50%' 
        }
      ]} />
      <View style={[
        styles.line, 
        { 
          backgroundColor: colorScheme === 'dark' ? '#444' : '#ccc',
          width: '80%' 
        }
      ]} />
    </View>
  </Animated.View>
)

const PaginationDots = ({ 
  total, 
  current, 
  colorScheme 
}: { 
  total: number
  current: number
  colorScheme: string | null
}) => (
  <View style={styles.pagination}>
    {Array.from({ length: total }, (_, index) => (
      <View
        key={index}
        style={[
          styles.paginationDot,
          {
            backgroundColor: index === current 
              ? (colorScheme === 'dark' ? '#fff' : '#000')
              : (colorScheme === 'dark' ? '#444' : '#ccc'),
            transform: [{ scale: index === current ? 1.2 : 1 }],
          },
        ]}
      />
    ))}
  </View>
)

export default function WelcomeScreen() {
  const { height, width } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const colorScheme = useColorScheme()
  const [currentScreen, setCurrentScreen] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const isSmallScreen = height < 700
  const isTablet = width > 768
  const currentData = SCREENS[currentScreen]
  const isLastScreen = currentScreen === SCREENS.length - 1

  const handleNext = () => {
    if (isTransitioning) return
    setIsTransitioning(true)

    if (currentScreen < SCREENS.length - 1) {
      // Move to next screen
      setTimeout(() => {
        setCurrentScreen(prev => prev + 1)
        setIsTransitioning(false)
      }, 200)
    } else {
      // Complete onboarding
      SecureStore.setItemAsync('hasOnboarded', 'true').then(() => {
        router.replace('/')
      })
    }
  }

  const textColor = {
    primary: colorScheme === 'dark' ? '#fff' : '#000',
    secondary: colorScheme === 'dark' ? '#aaa' : '#444',
    tertiary: colorScheme === 'dark' ? '#888' : '#666',
  }

  return (
    <SafeAreaView style={[
      styles.container,
      {
        backgroundColor: colorScheme === 'dark' ? '#030303' : '#efeef7',
        paddingHorizontal: isTablet ? 40 : 20,
        paddingBottom: insets.bottom + 80,
      }
    ]}>
      <View style={styles.content}>
        {/* Headline */}
        <View style={styles.headlineSection}>
          <Animated.Text
            key={`headline-${currentScreen}`}
            entering={FadeIn.duration(500)}
            style={[
              styles.headline,
              {
                fontSize: isSmallScreen ? 24 : isTablet ? 32 : 28,
                color: textColor.primary,
              },
            ]}
          >
            {currentData.headline}
          </Animated.Text>
        </View>

        {/* Message */}
        {currentData.message && (
          <Animated.Text
            key={`message-${currentScreen}`}
            entering={FadeIn.duration(600).delay(200)}
            style={[
              styles.message,
              {
                fontSize: isSmallScreen ? 16 : isTablet ? 20 : 18,
                color: textColor.secondary,
                textAlign: currentData.showFeatures ? 'left' : 'center',
                alignSelf: currentData.showFeatures ? 'flex-start' : 'center',
                width: '100%',
                maxWidth: isTablet ? 600 : '95%',
              },
            ]}
          >
            {currentData.message}
          </Animated.Text>
        )}

        {/* Features List */}
        {currentData.showFeatures && (
          <View style={styles.featuresSection}>
            {currentData.features?.map((feature, index) => (
              <Animated.View
                key={feature}
                entering={FadeInDown.duration(500).delay(300 + index * 100)}
                style={styles.featureItem}
              >
                <Text
                  style={[
                    styles.featureText,
                    {
                      fontSize: isSmallScreen ? 16 : isTablet ? 20 : 18,
                      color: textColor.secondary,
                    },
                  ]}
                >
                  • {feature}
                </Text>
              </Animated.View>
            ))}
            
            {/* App Previews */}
            <Animated.View 
              entering={FadeIn.duration(600).delay(700)}
              style={styles.previewsContainer}
            >
              <AppPreview colorScheme={colorScheme} delay={0} />
              <AppPreview colorScheme={colorScheme} delay={100} />
              {!isSmallScreen && <AppPreview colorScheme={colorScheme} delay={200} />}
            </Animated.View>

            {/* Final Message */}
            <Animated.Text
              entering={FadeIn.duration(600).delay(700)}
              style={[
                styles.finalMessage,
                {
                  fontSize: isSmallScreen ? 14 : isTablet ? 18 : 16,
                  color: textColor.tertiary,
                },
              ]}
            >
              {FINAL_MESSAGE}
            </Animated.Text>
          </View>
        )}
      </View>

      {/* Bottom Navigation */}
      <View style={[
        styles.bottomSection,
        { bottom: insets.bottom + 20 }
      ]}>
        <Animated.View
          entering={SlideInUp.duration(400)}
          style={styles.navigation}
        >
          <PaginationDots 
            total={3} 
            current={currentScreen} 
            colorScheme={colorScheme} 
          />
          <FreeButton onPress={handleNext}>
            {isLastScreen ? 'Get Started' : 'Next'}
          </FreeButton>
        </Animated.View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  headlineSection: {
    alignItems: 'center',
    marginBottom: 20,
    minHeight: 80,
    justifyContent: 'center',
  },
  headline: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  featuresSection: {
    width: '100%',
    alignItems: 'center',
  },
  featureItem: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  featureText: {
    lineHeight: 24,
    textAlign: 'left',
  },
  previewsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 30,
    marginBottom: 20,
    gap: 10,
  },
  appPreview: {
    width: 100,
    height: 120,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  previewHeader: {
    height: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  previewContent: {
    flex: 1,
    padding: 8,
    gap: 6,
  },
  line: {
    height: 8,
    borderRadius: 2,
  },
  finalMessage: {
    textAlign: 'center',
    lineHeight: 22,
    fontStyle: 'italic',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  bottomSection: {
    position: 'absolute',
    left: 20,
    right: 20,
  },
  navigation: {
    alignItems: 'center',
    gap: 16,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
})