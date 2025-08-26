import { StyleSheet, Image, Platform, View } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { ThemedText } from '@/components/ThemedText';
import EmptyCommunities from '@/components/EmptyCommunities';
import { ThemedView } from '@/components/ThemedView';
import Header from '@/components/Header';
import React, { useEffect, useState } from 'react';
import CommunityDashboard from '@/components/CommunityDashboard';

export default function TabTwoScreen() {
  const [hasCommunities, setCommunities] = useState<boolean | false>(false);
  const { user } = useAuth();
  useEffect(() => {
    (async () => {
      try {
        if (!user?.id) return;

        const response = await fetch(`http://87.106.230.12:8080/users/${user.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la récupération du profil');
        }

        const data = await response.json();
        setCommunities(!!data.community_id);
      } catch (error) {
        setCommunities(false);
      }
    })();
  }, [user?.id]);

  return (
    <ThemedView style={styles.container}>
      <Header />
      <View style={styles.content}>
        {!hasCommunities ? (
          <EmptyCommunities />
        ) : (
          <View style={styles.communitiesList}>
            <CommunityDashboard />
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