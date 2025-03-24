// app/home.tsx
import React from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import OSMMap from '@/components/MapComponent';
import Header from '@/components/Header';
import { HelloWave } from '@/components/HelloWave';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();

  return (
    <ThemedView style={styles.container}>
      {/* Header fixe */}
      <View>
        <Header />
      </View>

      {/* Contenu scrollable */}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Par exemple, on affiche une carte */}
        <View style={styles.mapContainer}>
          <OSMMap />
        </View>
        <TouchableOpacity
          style={[
            styles.addStickerButton,
            { backgroundColor: colorScheme === 'light' ? 'rgba(237, 37, 78, 0.8)' : '#1B2432' }
          ]}
          onPress={() => router.push('/stickers/add')}
        >
          <ThemedText style={styles.addStickerText}>Ajouter un sticker</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ED254E', // couleur de fond du header
    paddingHorizontal: 16,
    marginBottom: 10
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  contentContainer: {
    flexGrow: 1,
    padding: 10,
  },
  mapContainer: {
    height: '70%', // Par exemple, 30% de la hauteur de l'écran (tant que le parent a une hauteur définie)
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  addStickerButton: {
    backgroundColor: '#ED254E',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  addStickerText: {
    color: '#F7F7FF',
    fontSize: 16,
    fontWeight: '600',
  },
});
