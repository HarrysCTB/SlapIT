import { StyleSheet, Image, Platform, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import EmptyCommunities from '@/components/EmptyCommunities';
import { ThemedView } from '@/components/ThemedView';
import Header from '@/components/Header';
import React, { useEffect, useState } from 'react';

export default function TabTwoScreen() {
  const [hasCommunities, setCommunities] = useState<boolean | false>(false);
  useEffect(() => {
      (async () => {
        
       
      })();
    }, []);

  return (
    <ThemedView style={styles.container}>
      <Header />
      <View style={styles.content}>
        {!hasCommunities ? (
          <EmptyCommunities />
        ) : (
          <View style={styles.communitiesList}>
            <ThemedText>Test</ThemedText>
          </View>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  communitiesList: {
    flex: 1,
    gap: 16,
  },
});