import React, { useEffect, useState } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import mime from 'mime';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../configurations/supabaseClient';
import Header from '@/components/Header';

const API_URL = 'http://87.106.230.12:8080';
const BIO_MAX = 200;

type Profile = {
  id: number;
  auth_id: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  community_id: string | null;
  is_admin: boolean | null;
  total_stickers: number | null;
  score: number | null;
  created_at: string;
};

export default function Profiles() {
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [initialAvatarUrl, setInitialAvatarUrl] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Sélection image locale
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

    if (!result.canceled) setAvatarUri(result.assets[0].uri);
  };

  // Upload vers Supabase Storage (avatars) et renvoie l’URL publique
  const base64ToUint8Array = (base64: string) => {
    const binary = global.atob ? atob(base64) : Buffer.from(base64, 'base64').toString('binary');
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  };

  const uploadToSupabase = async (fileUri: string): Promise<string | null> => {
    try {
      // type & extension
      const mimeType = mime.getType(fileUri) || 'image/jpeg';
      const ext = (mime.getExtension(mimeType) || 'jpg').toLowerCase();
      const fileName = `avatars/${Date.now()}.${ext}`;

      // lire en base64 puis convertir en octets
      const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const bytes = base64ToUint8Array(base64);

      // UPLOAD: on envoie des octets, SANS contentEncoding: 'base64'
      const { error } = await supabase.storage.from('avatars').upload(fileName, bytes, {
        contentType: mimeType,
        upsert: true,
        cacheControl: '3600',
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

  // Charger le profil existant pour préremplir
  useEffect(() => {
    (async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const uid = userData?.user?.id;
        if (!uid) {
          setLoadingProfile(false);
          return;
        }

        const res = await fetch(`${API_URL}/users/${uid}`);
        if (res.ok) {
          const p: Profile = await res.json();
          setProfile(p);
          setUsername(p.username ?? '');
          setBio(p.bio ?? '');
          setAvatarUri(p.avatar_url ?? null);
          setInitialAvatarUrl(p.avatar_url ?? null);
        } else if (res.status !== 404) {
          const txt = await res.text().catch(() => '');
          console.warn('GET profile non-OK:', res.status, txt);
        }
      } catch (e) {
        console.warn('Erreur GET profile:', e);
      } finally {
        setLoadingProfile(false);
      }
    })();
  }, []);

  // Créer ou mettre à jour le profil
  const handleSubmit = async () => {
    if (!username.trim()) return Alert.alert('Nom d’utilisateur manquant');
    if (!bio.trim()) return Alert.alert('Bio manquante');

    setIsSubmitting(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData?.user?.id;
      if (!uid) {
        Alert.alert('Tu dois être connecté pour modifier ton profil.');
        return;
      }

      let avatar_url = initialAvatarUrl;

      // Upload uniquement si l’avatar a changé et que c’est un fichier local
      const isLocal = avatarUri && !/^https?:\/\//i.test(avatarUri);
      if (isLocal && avatarUri) {
        const uploaded = await uploadToSupabase(avatarUri);
        if (!uploaded) {
          Alert.alert('Échec du téléchargement de la photo');
          return;
        }
        avatar_url = uploaded;
      }

      const body = JSON.stringify({
        auth_id: uid, // requis pour POST
        username: username.trim(),
        avatar_url: avatar_url ?? null,
        bio: bio.trim(),
      });

      let res: Response;
      if (profile) {
        // Update
        res = await fetch(`${API_URL}/users/${uid}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body,
        });
      } else {
        // Create
        res = await fetch(`${API_URL}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
        });
      }

      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        console.error('Erreur API profil:', res.status, txt);
        Alert.alert('Erreur lors de la sauvegarde du profil');
        return;
      }

      const saved: Profile = await res.json();
      setProfile(saved);
      setInitialAvatarUrl(saved.avatar_url ?? null);
      setAvatarUri(saved.avatar_url ?? null);
      Alert.alert('Profil sauvegardé ✅');
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

      {loadingProfile ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F7F7FF' }}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
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
                <Text style={styles.badgeTxt}>Score {profile?.score ?? 0}</Text>
              </View>
              <View style={styles.badge}>
                <Ionicons name="ribbon" size={20} color="#ED254E" />
                <Text style={styles.badgeTxt}>{profile?.total_stickers ?? 0} stickers</Text>
              </View>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* Bouton Enregistrer fixé bas */}
      <View style={styles.footer}>
        <Pressable
          onPress={handleSubmit}
          style={({ pressed }) => [
            styles.saveBtn,
            pressed && { opacity: 0.9 },
            isSubmitting && { opacity: 0.6 },
          ]}
          disabled={isSubmitting || loadingProfile}
        >
          <Ionicons name="checkmark" size={18} color="#fff" />
          <Text style={styles.saveTxt}>{isSubmitting ? 'Enregistrement…' : 'Enregistrer'}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#f7f7ff', flex: 1 },
  scroll: { paddingBottom: 20, backgroundColor: '#F7F7FF' },
  hero: {
    height: 100,
    pointerEvents: 'none',
  },
  avatarWrap: {
    alignItems: 'center',
    marginTop: -46,
    marginBottom: 6,
    zIndex: 10,
  },
  avatarBtn: {
    alignItems: 'center',
    // pour Android, le zIndex nécessite souvent position
    position: 'relative',
    zIndex: 10,
  },
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