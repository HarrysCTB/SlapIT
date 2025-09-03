import React, { useEffect, useMemo, useState } from 'react';
import { BlurView } from 'expo-blur';
import {
  StyleSheet,
  ActivityIndicator,
  View,
  Text,
  Modal,
  Image,
  Pressable,
  Alert,
} from 'react-native';
import MapView, { UrlTile, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useAuth } from '@/hooks/useAuth';
import { useColorScheme } from '@/hooks/useColorScheme';

const API_URL = 'http://87.106.230.12:8080';

type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

type Sticker = {
  id: string;
  title: string;
  description?: string | null;
  image_url: string;
  lat: number;
  long: number;
  community_id: string;
  auth_id: string;
  created_at?: string;
};

export default function OSMMap() {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const [region, setRegion] = useState<Region | null>(null);
  const [loadingRegion, setLoadingRegion] = useState(true);

  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [loadingStickers, setLoadingStickers] = useState(false);

  const [selected, setSelected] = useState<Sticker | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1) Localisation utilisateur
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg("Permission d’accès à la localisation refusée");
          setLoadingRegion(false);
          return;
        }
        const location = await Location.getCurrentPositionAsync({});
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      } catch (e: any) {
        setErrorMsg(e?.message || 'Erreur localisation');
      } finally {
        setLoadingRegion(false);
      }
    })();
  }, []);

  // 2) Fetch des stickers du user courant
  useEffect(() => {
    if (!user?.id) return; // pas loggé -> rien
    (async () => {
      setLoadingStickers(true);
      try {
        const res = await fetch(`${API_URL}/users/${user.id}/stickers`);
        if (!res.ok) {
          const txt = await res.text().catch(() => '');
          throw new Error(`HTTP ${res.status} ${txt}`);
        }
        const data = (await res.json()) as Sticker[];
        // Filtre de sûreté sur les coords
        setStickers(
          (data || []).filter(
            (s) =>
              typeof s.lat === 'number' &&
              typeof s.long === 'number' &&
              !Number.isNaN(s.lat) &&
              !Number.isNaN(s.long)
          )
        );
      } catch (e: any) {
        console.error('❌ Fetch stickers error:', e);
        Alert.alert('Erreur', "Impossible de charger tes stickers.");
      } finally {
        setLoadingStickers(false);
      }
    })();
  }, [user?.id]);

  const initialRegion = useMemo(() => region, [region]);

  if (loadingRegion || !initialRegion) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0a7ea4" />
        {errorMsg ? <Text style={styles.err}>{errorMsg}</Text> : null}
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <MapView style={styles.map} initialRegion={initialRegion}>
        <UrlTile
          urlTemplate="https://c.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
        />

        {/* Markers des stickers */}
        {stickers.map((s) => (
          <Marker
            key={s.id}
            coordinate={{ latitude: s.lat, longitude: s.long }}
            title={s.title}
            description={s.description || ''}
            onPress={() => setSelected(s)}
          />
        ))}
      </MapView>

      {/* Loader discret pour le fetch des stickers */}
      {loadingStickers && (
        <View style={styles.loaderFloat}>
          <ActivityIndicator size="small" />
          <Text style={styles.loaderTxt}>Chargement des stickers…</Text>
        </View>
      )}

      {/* Popup (Modal) quand on appuie un marker */}
      <Modal
        visible={!!selected}
        transparent
        animationType="slide"
        onRequestClose={() => setSelected(null)}
      >
        <View style={styles.modalBackdrop}>
          {/* ⬇️ Ajoute le blur */}
          <BlurView intensity={50} tint={colorScheme === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />

          <View style={styles.modalCard}>
            {!!selected?.image_url && (
              <Image source={{ uri: selected.image_url }} style={styles.modalImage} />
            )}
            <Text style={styles.modalTitle}>{selected?.title}</Text>
            {!!selected?.description && (
              <Text style={styles.modalDesc}>{selected?.description}</Text>
            )}
            <Pressable
              style={({ pressed }) => [
                styles.modalBtn,
                pressed && { opacity: 0.85 },
              ]}
              onPress={() => setSelected(null)}
            >
              <Text style={styles.modalBtnTxt}>Fermer</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  center: {
    flex: 1,
    gap: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  err: { color: '#C81D3A', marginTop: 8 },

  loaderFloat: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  loaderTxt: { fontSize: 13 },

  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
  },
  modalCard: {
    margin: 12,
    borderRadius: 16,
    backgroundColor: '#fff',
    padding: 12,
    gap: 8,
    maxHeight: '70%',
    overflow: 'hidden',
  },
  modalImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    backgroundColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  modalDesc: {
    fontSize: 14,
    color: '#333',
  },
  modalBtn: {
    marginTop: 8,
    alignSelf: 'flex-end',
    backgroundColor: '#ED254E',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  modalBtnTxt: {
    color: '#fff',
    fontWeight: '700',
  },
});