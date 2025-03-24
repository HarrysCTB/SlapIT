// app/auth/login.tsx
import React, { useState } from 'react';
import { View, TextInput, KeyboardAvoidingView, StyleSheet, Image, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { supabase } from '@/configurations/supabaseClient';
import { Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const colorScheme = useColorScheme();

  const handleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,       // email provenant de ton state
        password: password, // mot de passe provenant de ton state
      });
  
      if (error) {
        console.error('Erreur de connexion:', error.message);
        // Ici, tu peux afficher un message d'erreur à l'utilisateur
        return;
      }
  
      console.log('Connexion réussie !');
      router.push('/(tabs)')
    } catch (err) {
      console.error('Erreur lors de la tentative de connexion:', err);
    }
  };

  return (
    <ThemedView style={styles.container}>
          <Stack.Screen options={{ headerShown: false }} />
          
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.flexFull}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContainer}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
            >
      <View style={styles.card}>
        <Image source={require('../../assets/images/react-logo.png')} style={styles.logo} />
        <ThemedText style={styles.title}>Connexion</ThemedText>

        {/* Champ Email avec label */}
        <View style={styles.inputContainer}>
          <ThemedText style={styles.label}>Adresse email</ThemedText>
          <TextInput
            style={[
              styles.input,
              { color: colorScheme === 'light' ? '' : '#F7F7FF' }
          ]}
            placeholder="Entrez votre email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Champ Mot de passe avec label */}
        <View style={styles.inputContainer}>
          <ThemedText style={styles.label}>Mot de passe</ThemedText>
          <TextInput
            style={[
              styles.input,
              { color: colorScheme === 'light' ? '' : '#F7F7FF' }
          ]}
            placeholder="Entrez votre mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity style={styles.link} onPress={() => router.push('/auth/login')}>
                  <ThemedText style={
                    [
                      styles.linkText,
                      { color: colorScheme === 'light' ? 'rgba(237, 37, 78, 0.8)'  : '#F7F7FF' }
                    ]
                  }>
                  Mot de passe oublié ?
                  </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
            style={
              [
                styles.loginButton,
                { backgroundColor: colorScheme === 'light' ? 'rgba(237, 37, 78, 0.8)' : '#1B2432' }
              ]
            }
            onPress={handleLogin}
        >
            <ThemedText style={styles.loginButtonText}>Se connecter</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
            style={styles.createAccBtn}
            onPress={() => router.push('/auth/register')}
        >
            <ThemedText style={
              [
                styles.createAccBtnText,
                { color: colorScheme === 'light' ? 'rgba(237, 37, 78, 0.8)'  : '#F7F7FF' }
              ]
            }>Vous n'avez pas de compte ? <ThemedText style={[
              styles.createAccSecondText,
              { color: colorScheme === 'light' ? 'rgba(237, 37, 78, 0.8)'  : '#F7F7FF' }
            ]}>Inscrivez-vous ici</ThemedText></ThemedText>
        </TouchableOpacity>
      </View>
      </ScrollView>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 16,
  },
  navbar: {
    position: 'absolute',
    top: 40,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    zIndex: 10,
  },
  navText: {
    color: '#ED254E',
    fontSize: 16,
  },
  card: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2, // Pour Android
    shadowColor: '#000', // Pour iOS
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#545E75'
  },
  input: {
    width: '100%',
    height: 45,
    borderColor: '#A7A7A9',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    color: '#545E75'
  },
  loginButton: {
    width: '60%',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: '#F7F7FF',
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    marginBottom: 10,
  },
  linkText: {
    color: 'rgba(237, 37, 78, 0.8)',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  createAccBtn: {
    marginTop: 20,
  },
  createAccBtnText: {
    textAlign: 'center',
    fontSize: 14,
  },
  createAccSecondText: {
    fontSize: 14,
    textDecorationLine: 'underline'
  }
});