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
import mime from 'mime';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../configurations/supabaseClient';
import Header from '@/components/Header';

const API_URL = 'http://87.106.230.12:8080';
const BIO_MAX = 200;

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
      quality: 0.8,
    });

    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const uploadToSupabase = async (fileUri: string): Promise<string | null> => {
    try {
      const ext = (fileUri.split('.').pop() || 'jpg').toLowerCase();
      const fileType = mime.getType(fileUri) || (ext === 'png' ? 'image/png' : 'image/jpeg');
      const fileName = `avatars/${Date.now()}.${ext}`;

      const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const { error } = await supabase.storage.from('avatars').upload(fileName, base64, {
        contentType: fileType,
        upsert: true,
        cacheControl: '3600',
        contentEncoding: 'base64',
      });
      if (error) {
        console.error('Erreur upload Supabase:', error);
        return null;
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
      return data?.publicUrl ?? null;
    } catch (e) {
      console.error('Erreur upload:', e);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!username.trim()) return Alert.alert('Nom d’utilisateur manquant');
    if (!bio.trim()) return Alert.alert('Bio manquante');
    if (!avatarUri) return Alert.alert('Choisis une photo de profil');

    setIsSubmitting(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        Alert.alert('Tu dois être connecté pour créer un profil.');
        return;
      }

      const avatar_url = await uploadToSupabase(avatarUri);
      if (!avatar_url) {
        Alert.alert('Échec du téléchargement de la photo');
        return;
      }

      const res = await fetch(`${API_URL}/users/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), avatar_url, bio: bio.trim() }),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        console.error('Erreur API :', txt);
        Alert.alert('Erreur lors de la création du profil');
        return;
      }

      Alert.alert('Profil créé avec succès !');
      setUsername('');
      setBio('');
      setAvatarUri(null);
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
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <Header />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header visuel */}
        <View style={styles.hero} />

        {/* Avatar rond centré */}
        <View style={styles.avatarWrap}>
          <Pressable style={styles.avatarBtn} onPress={pickImage}>
            <View style={styles.avatarRing}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={46} color="#9AA0A6" />
                </View>
              )}
            </View>
            <View style={styles.cameraPill}>
              <Ionicons name="camera" size={14} color="#fff" />
              <Text style={styles.cameraPillTxt}>Changer</Text>
            </View>
          </Pressable>
        </View>

        {/* Bloc infos éditables */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Profil</Text>

          <Text style={styles.label}>Nom d’utilisateur</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="ex: elarif"
            autoCapitalize="none"
            maxLength={30}
          />

          <Text style={[styles.label, { marginTop: 16 }]}>Bio</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={bio}
            onChangeText={(t) => t.length <= BIO_MAX && setBio(t)}
            placeholder="Une courte description…"
            multiline
          />
          <Text style={styles.helper}>{bio.length}/{BIO_MAX}</Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Gamification placeholder */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Statistique</Text>
          <View style={styles.badgesRow}>
            <View style={styles.badge}>
              <Ionicons name="trophy" size={20} color="#ED254E" />
              <Text style={styles.badgeTxt}>Niveau 1</Text>
            </View>
            <View style={styles.badge}>
              <Ionicons name="star" size={20} color="#ED254E" />
              <Text style={styles.badgeTxt}>Score 0</Text>
            </View>
            <View style={styles.badge}>
              <Ionicons name="ribbon" size={20} color="#ED254E" />
              <Text style={styles.badgeTxt}>0 médailles</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bouton Enregistrer fixé bas */}
      <View style={styles.footer}>
        <Pressable
          onPress={handleSubmit}
          style={({ pressed }) => [
            styles.saveBtn,
            pressed && { opacity: 0.9 },
            isSubmitting && { opacity: 0.6 },
          ]}
          disabled={isSubmitting}
        >
          <Ionicons name="checkmark" size={18} color="#fff" />
          <Text style={styles.saveTxt}>{isSubmitting ? 'Enregistrement…' : 'Enregistrer'}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#f7f7ff' },
  scroll: { paddingBottom: 20 , backgroundColor: '#F7F7FF'},
  hero: {
    height: 100,
  },
  avatarWrap: {
    alignItems: 'center',
    marginTop: -46, // chevauche le header
    marginBottom: 6,
  },
  avatarBtn: { alignItems: 'center' },
  avatarRing: {
    width: 108, height: 108, borderRadius: 54,
    padding: 4,
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
  },
  avatar: { width: '100%', height: '100%', borderRadius: 50 },
  avatarPlaceholder: {
    flex: 1,
    borderRadius: 50,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraPill: {
    marginTop: 8,
    backgroundColor: '#ED254E',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cameraPillTxt: { color: '#fff', fontWeight: '600', fontSize: 12 },

  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  label: { fontSize: 13, opacity: 0.8, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    fontSize: 15,
  },
  textarea: { minHeight: 90, textAlignVertical: 'top' },
  helper: { alignSelf: 'flex-end', marginTop: 6, fontSize: 12, color: '#6B7280' },

  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
    marginTop: 16,
    opacity: 0.7,
  },

  badgesRow: { flexDirection: 'row', gap: 10 },
  badge: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    gap: 6,
  },
  badgeTxt: { fontWeight: '600', color: '#111827' },

  footer: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    padding: 12,
    backgroundColor: 'rgba(247,247,255,0.9)',
    borderTopWidth: 1, borderTopColor: '#E5E7EB',
  },
  saveBtn: {
    backgroundColor: '#ED254E',
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  saveTxt: { color: '#fff', fontWeight: '700', fontSize: 16 },
});