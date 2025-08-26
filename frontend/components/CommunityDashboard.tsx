import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Alert,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { ThemedText } from './ThemedText';
import { useAuth } from '@/hooks/useAuth';

const API_URL = 'http://87.106.230.12:8080';

type CommunityUser = {
  auth_id: string;
  avatar_url: string;
  bio: string;
  community_id: string;
  created_at: string;
  id: number;
  is_admin: boolean;
  last_login: string | null;
  score: number;
  total_stickers: number;
  username: string;
};

export default function CommunityDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<null | { community_id: string }>(null);
  const [users, setUsers] = useState<CommunityUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [communityName, setCommunityName] = useState('');

  // Récupérer le nom de la communauté
  useEffect(() => {
    if (!profile?.community_id) return;

    const fetchCommunityName = async () => {
      try {
        const res = await fetch(`${API_URL}/communities/${profile.community_id}`);
        const json = await res.json();
        setCommunityName(json.name || 'Ma communauté');
      } catch (err) {
        console.error('❌ Erreur nom communauté :', err);
        setCommunityName('Ma communauté');
      }
    };

    fetchCommunityName();
  }, [profile?.community_id]);

  // Récupérer le profil
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;

      try {
        const res = await fetch(`${API_URL}/users/${user.id}`);
        const json = await res.json();
        setProfile(json);
      } catch (err) {
        console.error('❌ Erreur profil :', err);
      }
    };

    fetchProfile();
  }, [user?.id]);

  // Récupérer les utilisateurs de la communauté
  useEffect(() => {
    if (!profile?.community_id) return;

    const fetchUsers = async () => {
      try {
        const res = await fetch(`${API_URL}/communities/${profile.community_id}/users`);
        const json = await res.json();
        setUsers(json.community_users ?? []);
      } catch (err) {
        console.error('❌ Erreur users :', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [profile?.community_id]);

  const quitCommunity = async () => {
    if (!profile?.community_id) return;

    try {
      const res = await fetch(`${API_URL}/communities/${profile.community_id}/quit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        Alert.alert('Tu as quitté la communauté');
        setProfile(null);
        setUsers([]);
        setCommunityName('');
      } else {
        throw new Error();
      }
    } catch (err) {
      Alert.alert('Erreur lors de la sortie de la communauté');
    }
  };

  const renderItem = ({ item }: { item: CommunityUser }) => (
    <View style={styles.userRow}>
      <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
      <View style={styles.userInfo}>
        <Text style={styles.username}>{item.username}</Text>
        <Text style={styles.score}>Score : {item.score}</Text>
      </View>
      {item.is_admin && <Text style={styles.adminBadge}>👑</Text>}
    </View>
  );

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>{communityName}</ThemedText>
  
      {isLoading ? (
        <ActivityIndicator size="large" style={{ flex: 1 }} />
      ) : (
        <View style={styles.content}>
          <FlatList
            data={users}
            keyExtractor={(item) => item.auth_id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 40 }}
            ListFooterComponent={
              <Pressable
                style={({ pressed }) => [
                  styles.quitButton,
                  pressed && { backgroundColor: '#C81D3A' },
                ]}
                onPress={quitCommunity}
              >
                <Text style={styles.quitButtonText}>🚪 Quitter la communauté</Text>
              </Pressable>
            }
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.4,
    borderColor: '#ccc',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eee',
  },
  userInfo: { marginLeft: 12, flex: 1 },
  username: { fontSize: 16, fontWeight: '600' },
  score: { fontSize: 14, color: '#555' },
  adminBadge: { fontSize: 18, marginRight: 8 },
  quitButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: 'center',
    backgroundColor: '#ED254E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  quitButtonText: {
    fontWeight: 'bold',
    color: '#fff',
    fontSize: 16,
  },
});