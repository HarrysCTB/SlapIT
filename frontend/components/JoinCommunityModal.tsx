import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemedText } from './ThemedText';
import { useAuth } from '@/hooks/useAuth';

interface JoinCommunityModalProps {
  visible: boolean;
  onClose: () => void;
  onJoin: (communityName: string) => void;
}

const JoinCommunityModal: React.FC<JoinCommunityModalProps> = ({ visible, onClose, onJoin }) => {
    const [communityName, setCommunityName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const colorScheme = useColorScheme();
    const { user } = useAuth();

  const handleJoin = async () => {
    if (!communityName.trim()) return;
    
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`http://87.106.230.12:8080/communities/${communityName}/join`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({
            user_id: user?.id,
            }),
        });

        if (!response.ok) {
            throw new Error('Impossible de rejoindre la communauté');
        }

        const data = await response.json();
        onJoin(communityName);
        setCommunityName('');
        onClose();
        } catch (error) {
        setError('Erreur lors de la tentative de rejoindre la communauté');
        console.error('Erreur:', error);
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
            placeholder="ID de la communauté"
            value={communityName}
            onChangeText={setCommunityName}
          />

          <TouchableOpacity style={
            [
                styles.joinButton,
                { backgroundColor: colorScheme === 'light' ? 'rgba(237, 37, 78, 0.8)'  : '#1B2432' }
              ]
          } onPress={handleJoin}>
            <Text style={styles.joinButtonText}>Rejoindre</Text>
          </TouchableOpacity>
        </View>
        </KeyboardAvoidingView>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  blurContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  closeButton: {
    position: 'absolute',
    top: 12,
    left: 0,
    padding: 8,
    zIndex: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f1f1f1',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  joinButton: {
    backgroundColor: '#28a745',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 10,
  },
  joinButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  keyboardView: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default JoinCommunityModal;