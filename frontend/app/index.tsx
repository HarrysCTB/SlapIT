// app/home.tsx
import React from 'react';
import { View, StyleSheet, Button, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Stack } from 'expo-router';

export default function Home() {
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{ headerShown: false }}
      />
      <ThemedText style={styles.title}>SlapIT</ThemedText>
      <ThemedText style={styles.subtitle}>
        Votre espace de partage de stickers urbains
      </ThemedText>
      <Image
        source={require('../assets/images/react-logo.png')}
        style={styles.icon}
      />
      <View style={styles.buttonContainer}>
        <Button
          title="Se connecter"
          onPress={() => router.push('/auth/login')}
        />
        <Button
          title="S'inscrire"
          onPress={() => router.push('/auth/register')}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  icon: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 32,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16, // Pour React Native < 0.71, tu peux utiliser marginHorizontal sur les boutons
  },
});