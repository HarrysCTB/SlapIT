// remplace ton composant par ceci (seule la logique change, le style reste)
import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemedText } from './ThemedText';
import { useAuth } from '@/hooks/useAuth';

const API_URL = 'http://87.106.230.12:8080';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface JoinCommunityModalProps {
  visible: boolean;
  onClose: () => void;
  onJoin: (communityId: string) => void;
}

const JoinCommunityModal: React.FC<JoinCommunityModalProps> = ({ visible, onClose, onJoin }) => {
  const [communityId, setCommunityId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const colorScheme = useColorScheme();
  const { user } = useAuth();

  const handleJoin = async () => {
    if (!user?.id) {
      setError("Tu dois être connecté.");
      return;
    }
    if (!UUID_RE.test(communityId.trim())) {
      setError("L'ID communauté doit être un UUID valide.");
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/communities/${communityId.trim()}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ user_id: user.id }),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`Join failed (${res.status}) ${txt}`);
      }

      onJoin(communityId.trim());
      setCommunityId('');
      onClose();
    } catch (e: any) {
      console.error(e);
      setError("Erreur lors de la tentative de rejoindre la communauté");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <BlurView intensity={80} tint="light" style={styles.blurContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.popup}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#DCDCDC" />
            </TouchableOpacity>

            <ThemedText style={styles.title}>Rejoindre une communauté</ThemedText>

            <TextInput
              style={styles.input}
              placeholder="ID (UUID) de la communauté"
              value={communityId}
              onChangeText={setCommunityId}
              autoCapitalize="none"
              autoCorrect={false}
            />

            {!!error && <Text style={{ color: '#ED254E', marginTop: 4 }}>{error}</Text>}

            <TouchableOpacity
              style={[
                styles.joinButton,
                { backgroundColor: colorScheme === 'light' ? 'rgba(237, 37, 78, 0.9)' : '#1B2432' },
                isLoading && { opacity: 0.7 },
              ]}
              onPress={handleJoin}
              disabled={isLoading}
            >
              <Text style={styles.joinButtonText}>{isLoading ? '...' : 'Rejoindre'}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  blurContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  popup: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
    position: 'relative',
  },
  closeButton: { position: 'absolute', top: 12, left: 0, padding: 8, zIndex: 10 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 20, textAlign: 'center' },
  input: {
    backgroundColor: '#f1f1f1',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  joinButton: { paddingVertical: 14, borderRadius: 10, marginTop: 10 },
  joinButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16, textAlign: 'center' },
  keyboardView: { flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' },
});

export default JoinCommunityModal;