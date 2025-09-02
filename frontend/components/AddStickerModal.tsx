import React, { useEffect, useRef, useState } from 'react';
import {
  Modal, View, StyleSheet, TextInput, TouchableOpacity,
  TouchableWithoutFeedback, Keyboard,
  ActivityIndicator, Image, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Location from 'expo-location';
import * as FileSystem from 'expo-file-system';
import { decode as atob } from 'base-64';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { supabase } from '@/configurations/supabaseClient';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultCommunityId?: string | null;
  authId?: string;
  bucketName?: string; // 'avatars' ou 'stickers'
};

export default function AddStickerModal({
  visible,
  onClose,
  onSuccess,
  defaultCommunityId = null,
  authId = '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  bucketName = 'avatars',
}: Props) {
  const colorScheme = useColorScheme();
  const [communityId, setCommunityId] = useState<string>(defaultCommunityId ?? '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // refs de contrôle
  const abortRef = useRef<AbortController | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // si le modal se ferme: stoppe loading + annule requêtes
  useEffect(() => {
    if (!visible) {
      setLoading(false);
      abortRef.current?.abort();
    }
  }, [visible]);

  // ---------- helpers ----------
  const withTimeout = <T,>(p: Promise<T>, ms: number, label: string) =>
    Promise.race<T>([
      p,
      new Promise<T>((_, rej) => setTimeout(() => rej(new Error(`${label} timeout après ${ms}ms`)), ms)),
    ]);

  const safeSet = <K extends keyof StateLike>(setter: (v: any) => void, v: any) => {
    if (isMounted.current) setter(v);
  };
  type StateLike = { [k: string]: any };

  const postSticker = (payload: any, signal: AbortSignal) =>
    fetch('http://87.106.230.12:8080/stickers/', {
      method: 'POST',
      headers: { accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal,
    });

  const base64ToUint8Array = (base64: string) => {
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  };

  // ---------- localisation (timeout + fallback) ----------
  useEffect(() => {
    if (!visible) return;
    setCommunityId(defaultCommunityId ?? '');

    let didCancel = false;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (!didCancel) Alert.alert('Permission refusée', 'Active la localisation pour positionner le sticker.');
          return;
        }

        try {
          const loc = await withTimeout(
            Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
            12000,
            'Localisation'
          );
          if (!didCancel && loc) {
            setLat(loc.coords.latitude);
            setLng(loc.coords.longitude);
            return;
          }
        } catch { /* fallback below */ }

        const last = await Location.getLastKnownPositionAsync();
        if (!didCancel && last) {
          setLat(last.coords.latitude);
          setLng(last.coords.longitude);
          return;
        }

        if (!didCancel) {
          Alert.alert('Position indisponible', 'Impossible de récupérer la position. Tu peux continuer quand même.');
        }
      } catch (e: any) {
        if (!didCancel) Alert.alert('Erreur localisation', e?.message || 'Erreur inconnue.');
      }
    })();

    return () => { didCancel = true; };
  }, [visible, defaultCommunityId]);

  // ---------- permissions média ----------
  const ensureMediaPermissions = async () => {
    const camera = await ImagePicker.requestCameraPermissionsAsync();
    const media = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (camera.status !== 'granted' || media.status !== 'granted') {
      Alert.alert('Permissions requises', 'Caméra et galerie nécessaires.');
      return false;
    }
    return true;
  };

  // ---------- capture/sélection (base64 + compression) ----------
  const prepareImage = async (uri: string) => {
    // compression pour réduire la taille mémoire/temps upload
    const manipulated = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1600 } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );
    // on renvoie un asset "like" avec base64 dispo
    return {
      uri: manipulated.uri,
      width: manipulated.width,
      height: manipulated.height,
      base64: manipulated.base64!,
      fileName: 'photo.jpg',
      mimeType: 'image/jpeg',
    } as unknown as ImagePicker.ImagePickerAsset;
  };

  const pickFromCamera = async () => {
    const ok = await ensureMediaPermissions();
    if (!ok) return;
    const res = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.8 });
    if (!res.canceled) {
      const prepared = await prepareImage(res.assets[0].uri);
      setImage(prepared);
    }
  };

  const pickFromLibrary = async () => {
    const ok = await ensureMediaPermissions();
    if (!ok) return;
    const res = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.8 });
    if (!res.canceled) {
      const prepared = await prepareImage(res.assets[0].uri);
      setImage(prepared);
    }
  };

  // ---------- upload supabase ----------
  const uploadToSupabase = async (asset: ImagePicker.ImagePickerAsset): Promise<string> => {
    // on essaye base64 direct (compressé), sinon fallback lecture FS
    let b64 = (asset as any).base64 as string | undefined;
    if (!b64) {
      const b64FromFs = await FileSystem.readAsStringAsync(asset.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      b64 = b64FromFs;
    }
    if (!b64) throw new Error('Image base64 introuvable');

    const bytes = base64ToUint8Array(b64);

    const ext = (asset.fileName?.split('.').pop() || 'jpg').toLowerCase();
    const contentType = (asset as any).mimeType || (ext === 'png' ? 'image/png' : 'image/jpeg');
    const path = `stickers/${authId}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage.from(bucketName).upload(path, bytes, {
      contentType,
      upsert: true,
    });
    if (error) throw new Error(`Upload Supabase: ${error.message}`);

    const { data } = supabase.storage.from(bucketName).getPublicUrl(path);
    if (!data?.publicUrl) throw new Error('Impossible de générer l’URL publique');

    // libère la mémoire base64 dès que possible
    if (isMounted.current) setImage((prev) => (prev ? { ...prev, base64: undefined } as any : prev));

    return data.publicUrl;
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setImage(null);
  };

  // ---------- submit ----------
  const submit = async () => {
    if (loading) return;
    if (!title.trim()) return Alert.alert('Titre manquant', 'Ajoute un titre.');
    if (!image) return Alert.alert('Photo manquante', 'Prends/choisis une photo.');
    if (lat == null || lng == null) return Alert.alert('Localisation', 'Position en cours…');

    try {
      setLoading(true);

      // 1) Upload (timeout 45s)
      const publicUrl = await withTimeout(uploadToSupabase(image), 45000, 'Upload');

      // 2) POST avec Abort + timeout 25s + 1 retry
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      if (!communityId || !communityId.trim()) {
        Alert.alert('Communauté requise', 'Choisis une communauté avant de publier.');
        return;
      }

      const payload = {
        community_id: communityId.trim(),
        title: title.trim(),
        description: description.trim(),
        image_url: publicUrl,
        long: Number(lng),
        lat: Number(lat),
        auth_id: authId,
      };

      let res = await withTimeout(postSticker(payload, controller.signal), 25000, 'POST /stickers');
      if (!res.ok) {
        // retry unique si code >=500 (réseau lent/serveur)
        if (res.status >= 500) {
          res = await withTimeout(postSticker(payload, controller.signal), 25000, 'POST /stickers (retry)');
        }
      }
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status} – ${txt || 'Erreur API'}`);
      }

      Alert.alert('Sticker ajouté', 'Publié avec succès 🎉');
      onSuccess?.();
      resetForm();
      onClose();
    } catch (e: any) {
      const msg = e?.name === 'AbortError' ? 'Requête annulée' : (e?.message || 'Erreur inconnue');
      Alert.alert('Erreur', msg);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  return (
    <Modal visible={visible} onRequestClose={onClose} transparent animationType="fade">
  <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <View style={{ flex: 1 }}>
      <BlurView
        intensity={40}
        tint={colorScheme === 'dark' ? 'dark' : 'light'}
        style={styles.blur}
      >
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: 'padding', android: undefined })}
          style={styles.kav}
        >
          <View style={styles.card}>
            <View style={styles.header}>
              <View style={styles.handle} />
              <ThemedText style={styles.title}>Ajouter un sticker</ThemedText>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose} disabled={loading}>
                <ThemedText style={styles.closeTxt}>✕</ThemedText>
              </TouchableOpacity>
            </View>

            {/* Boutons photo */}
            <View style={styles.row}>
              <TouchableOpacity style={[styles.photoBtn, styles.primaryBtn]} onPress={pickFromCamera} disabled={loading}>
                <ThemedText style={styles.photoBtnText}>Prendre une photo</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.photoBtn, styles.ghostBtn]} onPress={pickFromLibrary} disabled={loading}>
                <ThemedText style={styles.photoGhostText}>Galerie</ThemedText>
              </TouchableOpacity>
            </View>

            {/* Preview image */}
            {image && (
              <View style={styles.previewContainer}>
                <Image source={{ uri: image.uri }} style={styles.preview} />
              </View>
            )}

            {/* Inputs */}
            <TextInput
              placeholder="Titre"
              placeholderTextColor="#8E8E93"
              value={title}
              onChangeText={setTitle}
              style={styles.input}
            />
            <TextInput
              placeholder="Description"
              placeholderTextColor="#8E8E93"
              value={description}
              onChangeText={setDescription}
              style={[styles.input, styles.textarea]}
              multiline
            />

            {/* Bouton publier */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.submitBtn, loading && { opacity: 0.7 }]}
                onPress={submit}
                disabled={loading}
              >
                {loading ? <ActivityIndicator /> : <ThemedText style={styles.submitTxt}>Publier</ThemedText>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </BlurView>
    </View>
  </TouchableWithoutFeedback>
</Modal>
  );
}

const styles = StyleSheet.create({
  blur: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  kav: { width: '100%', paddingHorizontal: 16 },

  card: {
    width: '100%',
    maxWidth: 540,
    alignSelf: 'center',
    borderRadius: 20,
    padding: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(142,142,147,0.25)',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
    backgroundColor: 'white',
  },

  header: { alignItems: 'center', marginBottom: 8 },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    marginTop: 4,
    marginBottom: 10,
    backgroundColor: 'rgba(142,142,147,0.4)',
  },
  title: { fontSize: 18, fontWeight: '700' },
  closeBtn: { position: 'absolute', right: 6, top: 6, padding: 8, borderRadius: 8 },
  closeTxt: { fontSize: 16, opacity: 0.8 },

  row: { flexDirection: 'row', gap: 10, marginVertical: 10 },

  // Boutons "Prendre une photo" / "Galerie"
  photoBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtn: { backgroundColor: '#ED254E' },
  ghostBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(142,142,147,0.35)',
  },
  photoBtnText: { color: '#F7F7FF', fontWeight: '700' },
  photoGhostText: { color: '#111', fontWeight: '700', opacity: 0.9 },

  // Preview image
  previewContainer: {
    width: '100%',
    height: 190,
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  preview: { width: '100%', height: '100%' },

  // Inputs
  input: {
    backgroundColor: 'rgba(142,142,147,0.14)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 10,
    color: '#000',
    borderWidth: 1,
    borderColor: 'rgba(142,142,147,0.25)',
  },
  textarea: { minHeight: 90, textAlignVertical: 'top' },

  // Coordonnées
  coords: { opacity: 0.8, fontSize: 12, marginTop: 2, marginBottom: 6, textAlign: 'center' },

  // Actions (Publier)
  actions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  actionBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  submitBtn: { backgroundColor: '#ED254E' },
  submitTxt: { color: '#F7F7FF', fontWeight: '700' },
});