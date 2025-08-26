import React, { useState } from 'react';
import { Stack } from 'expo-router';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { decode as atob } from 'base-64';
import mime from 'mime';
import { supabase } from '../configurations/supabaseClient'
import Header from '@/components/Header';

const API_URL = 'http://87.106.230.12:8080';

export default function Profiles() {
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission refusée", "Tu dois autoriser l'accès à la galerie.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const uploadToSupabase = async (fileUri: string): Promise<string | null> => {
    try {
      const fileExt = fileUri.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const fileType = mime.getType(fileUri) || 'image/jpeg';
  
      const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
  
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, base64, {
          contentType: fileType,
          upsert: true,
          cacheControl: '3600',
          contentEncoding: 'base64',
        });
  
      if (error) {
        console.error('Erreur upload Supabase:', error);
        return null;
      }
  
      const publicUrl = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName).data.publicUrl;
  
      return publicUrl;
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!username || !bio || !avatarUri) {
      Alert.alert('Veuillez remplir tous les champs');
      return;
    }
  
    setIsSubmitting(true);
  
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
  
      if (!userData?.user) {
        Alert.alert('Erreur', 'Tu dois être connecté pour envoyer une photo.');
        setIsSubmitting(false);
        return;
      }
  
      const avatar_url = await uploadToSupabase(avatarUri);
      if (!avatar_url) {
        Alert.alert('Échec du téléchargement de la photo');
        setIsSubmitting(false);
        return;
      }
  
      const res = await fetch(`${API_URL}/users/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          avatar_url,
          bio,
        }),
      });
  
      if (res.ok) {
        Alert.alert('Profil créé avec succès !');
        setUsername('');
        setBio('');
        setAvatarUri(null);
      } else {
        const error = await res.json();
        console.error('Erreur API :', error);
        Alert.alert('Erreur lors de la création du profil');
      }
    } catch (err) {
      console.error('Erreur réseau :', err);
      Alert.alert('Erreur réseau');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Screen
                options={{ headerShown: false }}
              />
       <View>
        <Header />
      </View>
      <ScrollView contentContainerStyle={styles.form}>
        <Text style={styles.label}>Nom d'utilisateur</Text>
        <TextInput
          value={username}
          onChangeText={setUsername}
          style={styles.input}
          placeholder="ex: elarif"
        />

        <Text style={styles.label}>Bio</Text>
        <TextInput
          value={bio}
          onChangeText={setBio}
          style={[styles.input, { height: 80 }]}
          placeholder="Une courte description"
          multiline
        />

        <Text style={styles.label}>Avatar</Text>
        <Pressable style={styles.avatarPicker} onPress={pickImage}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatarPreview} />
          ) : (
            <Text style={styles.avatarPlaceholder}>Choisir une photo</Text>
          )}
        </Pressable>

        <Pressable
          onPress={handleSubmit}
          style={({ pressed }) => [
            styles.button,
            pressed && { backgroundColor: 'rgba(179, 29, 59, 0.8)' },
          ]}
          disabled={isSubmitting}
        >
          <Text style={styles.buttonText}>
            {isSubmitting ? 'Envoi en cours...' : 'Créer le profil'}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F7F7FF',
  },
  form: { padding: 20 },
  label: {
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 6,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    fontSize: 16,
  },
  avatarPicker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  avatarPreview: {
    width: '100%',
    height: '100%',

  },
  avatarPlaceholder: {
    color: '#555',
    fontSize: 16,
  },
  button: {
    marginTop: 30,
    backgroundColor: 'rgba(237, 37, 78, 0.8)',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});