// app/home.tsx
import React from 'react';
import { TouchableOpacity, StyleSheet, Button, Image, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme'

export default function Home() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const rotateAnim = new Animated.Value(0);

  React.useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 1000, // Duration de l'animation en ms
      useNativeDriver: true,
    }).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <ThemedView style={styles.container}>
        <Stack.Screen
          options={{ headerShown: false }}
        />
        <ThemedText style={styles.title}>SlapIT</ThemedText>
        <ThemedText style={styles.subtitle}>
        Slap it, map it, share it !
        </ThemedText>
        <Animated.Image
          source={require('../assets/images/slapit.png')}
          style={[
            styles.icon,
            {
              transform: [{ rotate: spin }]
            }
          ]}
        />
        <ThemedView style={styles.buttonContainer}>
          <TouchableOpacity
            style={
              [
                styles.filledButton,
                { backgroundColor: colorScheme === 'light' ? 'rgba(237, 37, 78, 0.8)' : '#3A3A3C' }
              ]
            }
            onPress={() => router.push('/auth/login')}
          >
            <ThemedText style={styles.filledButtonText}>Se connecter</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={
              [
                styles.outlinedButton,
                { borderColor: colorScheme === 'light' ? 'rgba(237, 37, 78, 0.8)' : '#3A3A3C' }
              ]
            }
            onPress={() => router.push('/auth/register')}
          >
            <ThemedText style={
              [
                styles.outlinedButtonText,
                { color: colorScheme === 'light' ? '#ED254E' : '#F7F7FF' }
              ]
            }>S'inscrire</ThemedText>
          </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flexFull: {
    flex: 1,
    width: '100%',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    height: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    alignItems: 'center',
    paddingTop: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 26,
    textAlign: 'center',
  },
  icon: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 80,
  },
    buttonContainer: {
      width: '100%',
      paddingHorizontal: 20,
      marginTop: 20,
      gap: 16, // Ajoute un espace entre les boutons
    },
    filledButton: {
      width: '100%', // Prend toute la largeur disponible
      backgroundColor: '#ED254E',
      paddingVertical: 12,
      borderRadius: 30,
      alignItems: 'center',
      marginRight: 0, // Supprime la marge droite
    },
  filledButtonText: {
    color: '#F7F7FF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  outlinedButton: {
    width: '100%', // Prend toute la largeur disponible
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 2,
    marginLeft: 0, // Supprime la marge gauche
  },
  outlinedButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});