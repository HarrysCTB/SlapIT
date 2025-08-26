// app/home.tsx
import React, { useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import OSMMap from '@/components/MapComponent';
import Header from '@/components/Header';
import { useColorScheme } from '@/hooks/useColorScheme';
import AddStickerModal from '@/components/AddStickerModal';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const [isAddOpen, setIsAddOpen] = useState(false);

  // callback après succès pour, par ex., rafraîchir les données de la carte
  const handleAdded = () => {
    // TODO: déclenche un refresh de la map si besoin (contexte/app state/query invalidate)
  };

  return (
    <ThemedView style={styles.container}>
      <View>
        <Header />
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.mapContainer}>
          <OSMMap />
        </View>

        <TouchableOpacity
          style={[
            styles.addStickerButton,
            { backgroundColor: colorScheme === 'light' ? 'rgba(237, 37, 78, 0.8)' : '#3A3A3C' }
          ]}
          onPress={() => setIsAddOpen(true)}
        >
          <ThemedText style={styles.addStickerText}>Ajouter un sticker</ThemedText>
        </TouchableOpacity>
      </ScrollView>

      <AddStickerModal
        visible={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={handleAdded}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ED254E',
    paddingHorizontal: 16,
    marginBottom: 10
  },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 4 },
  contentContainer: { flexGrow: 1, padding: 10 },
  mapContainer: {
    height: '70%',
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
  addStickerText: { color: '#F7F7FF', fontSize: 16, fontWeight: '600' },
});