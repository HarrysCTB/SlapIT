import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Image, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { supabase } from '@/configurations/supabaseClient';
import { Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function Register() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const colorScheme = useColorScheme();

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setErrorMsg("Les mots de passe ne correspondent pas.");
      return;
    }
    if (!email || !password || !pseudo) {
      setErrorMsg("Veuillez remplir tous les champs.");
      return;
    }
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: { data: { pseudo: pseudo } }
      });

      if (error) {
        setErrorMsg(error.message);
        console.error("Erreur d'inscription:", error.message);
        return;
      }
      console.log("Inscription réussie !", data);
      router.push('/auth/login');
    } catch (err) {
      console.error("Erreur lors de l'inscription:", err);
      setErrorMsg("Une erreur est survenue. Réessayez.");
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

          {/* Carte d'inscription avec glassmorphism */}
          <View style={styles.card}>
            <Image 
              source={require('../../assets/images/slapit2.png')}
              style={styles.logo}
            />
            <ThemedText style={styles.title}>Créer un compte</ThemedText>

            {/* Espace fixe pour l'erreur */}
            <View style={styles.errorContainer}>
              {errorMsg ? <ThemedText style={styles.errorText}>{errorMsg}</ThemedText> : null}
            </View>

            {/* Champ Nom complet */}
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Pseudo</ThemedText>
              <TextInput
                style={
                  [
                    styles.input,
                    { color: colorScheme === 'light' ? '' : '#F7F7FF' }
                ]
                }
                placeholder="Votre pseudo"
                value={pseudo}
                onChangeText={setPseudo}
                autoCapitalize="words"
              />
            </View>

            {/* Champ Email */}
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Adresse email</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { color: colorScheme === 'light' ? '' : '#F7F7FF' }
              ]}
                placeholder="exemple@mail.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Champ Mot de passe */}
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Mot de passe</ThemedText>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[ { flex: 1 },{ color: colorScheme === 'light' ? '' : '#F7F7FF' }]}
                  placeholder="Votre mot de passe"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Feather name={showPassword ? "eye" : "eye-off"} size={20} color="#403F4C" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Champ Confirmation mot de passe */}
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Confirmer le mot de passe</ThemedText>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[ { flex: 1 },{ color: colorScheme === 'light' ? '' : '#F7F7FF' }]}
                  placeholder="Confirmez votre mot de passe"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Feather name={showPassword ? "eye" : "eye-off"} size={20} color="#403F4C" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={
                [
                  styles.registerButton,
                  { backgroundColor: colorScheme === 'light' ? 'rgba(237, 37, 78, 0.8)' : '#3A3A3C' }
              ]
              }
              onPress={handleRegister}
            >
              <ThemedText style={styles.registerButtonText
              }>S'inscrire</ThemedText>
            </TouchableOpacity>

            {/* Lien vers la page de connexion */}
            <TouchableOpacity style={styles.link} onPress={() => router.push('/auth/login')}>
              <ThemedText style={[
                  styles.linkText,
                  { color: colorScheme === 'light' ? 'rgba(237, 37, 78, 0.8)' : '#F7F7FF' }
              ]}>
                Vous avez déjà un compte ? Connectez-vous
              </ThemedText>
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
    paddingHorizontal: 16,
    paddingTop: 40,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    marginBottom: 20,
    marginTop: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  homeText: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: '#ffffff',
  },
  card: {
    width: '100%',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    overflow: 'hidden',
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
    marginBottom: 10,
    color: '#545E75',
  },
  errorContainer: {
    height: 20, // espace fixe pour éviter le décalage du layout
    marginBottom: 10,
    justifyContent: 'center',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#545E75',
  },
  input: {
    width: '100%',
    height: 45,
    borderColor: '#A7A7A9',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#A7A7A9',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    height: 45,
  },
  registerButton: {
    backgroundColor: 'rgba(237, 37, 78, 0.8)',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  link: {
    marginTop: 12,
  },
  linkText: {
    color: 'rgba(237, 37, 78, 0.8)',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});