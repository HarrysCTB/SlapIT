// app/auth/register.tsx
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { supabase } from '@/configurations/supabaseClient';
import { Stack } from 'expo-router';

export default function Register() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (error) {
        console.error("Erreur d'inscription:", error.message);
        // Ici, tu peux afficher une alerte ou un message d'erreur à l'utilisateur
        return;
      }
      console.log("Inscription réussie !", data);
      // Par exemple, rediriger l'utilisateur vers la page de connexion après inscription
      router.push('/auth/login');
    } catch (err) {
      console.error("Erreur lors de l'inscription:", err);
    }
  };

  return (
    <ThemedView style={styles.container}>
        <Stack.Screen
                    options={{
                      headerShown: false
                    }}
                  />
      {/* Navbar en haut pour accéder à la page d'accueil */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.push('/')}>
          <ThemedText style={styles.navText}>Accueil</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Carte d'inscription */}
      <View style={styles.card}>
        <Image source={require('../../assets/images/react-logo.png')} style={styles.logo} />
        <ThemedText style={styles.title}>Inscription</ThemedText>

        {/* Champ Email avec label */}
        <View style={styles.inputContainer}>
          <ThemedText style={styles.label}>Adresse email</ThemedText>
          <TextInput
            style={styles.input}
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
            style={styles.input}
            placeholder="Entrez votre mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <Button title="S'inscrire" onPress={handleRegister} />

        {/* Lien pour rediriger vers la page de connexion */}
        <TouchableOpacity style={styles.link} onPress={() => router.push('/auth/login')}>
          <ThemedText style={styles.linkText}>
            Vous avez déjà un compte ? Connectez-vous
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#fff', // ou adapte en fonction de ton thème
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
    fontSize: 16,
    color: '#0a7ea4',
  },
  card: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
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
  },
  inputContainer: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    color: '#666',
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  link: {
    marginTop: 16,
  },
  linkText: {
    color: '#0a7ea4',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});