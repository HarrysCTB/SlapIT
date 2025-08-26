import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { useAuth } from '@/hooks/useAuth';

interface CreateCommunityModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string) => void;
}

const CreateCommunityModal: React.FC<CreateCommunityModalProps> = ({ visible, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const colorScheme = useColorScheme();
  const { user } = useAuth();

  const handleCreate = async () => {
    if (!name.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      console.log('⏳ Envoi du POST...');
      const response = await fetch('http://87.106.230.12:8080/communities/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'ReactNativeApp',
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          admin_id: user?.id
        }),
      });
    
      console.log('✅ Réponse reçue');
    
      if (!response.ok) {
        const text = await response.text();
        console.error('❌ Réponse non OK:', response.status, text);
        throw new Error('Impossible de créer la communauté');
      }
    
      const data = await response.json();
      console.log('📦 JSON reçu :', data);
    
      onCreate(name, description);
      setName('');
      setDescription('');
      onClose();
    
    } catch (error) {
      console.error('❌ Erreur de création :', error);
      setError('Erreur lors de la création de la communauté');
    } finally {
      console.log('🧹 Fin du chargement');
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

          <ThemedText style={styles.title}>Créer une communauté</ThemedText>

          <TextInput
            style={styles.input}
            placeholder="Nom de la communauté"
            value={name}
            onChangeText={setName}
          />

          <TextInput
            style={[styles.input, { height: 80 }]}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            multiline
          />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            
            <TouchableOpacity 
              style={[
                styles.createButton,
                { backgroundColor: colorScheme === 'light' ? 'rgba(237, 37, 78, 0.8)' : '#1B2432' },
                isLoading && styles.disabledButton
              ]} 
              onPress={handleCreate}
              disabled={isLoading}
            >
              <Text style={styles.createButtonText}>
                {isLoading ? 'Création...' : 'Créer la communauté'}
              </Text>
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
    padding: 8,
    zIndex: 10,
  },
  title: {
    fontSize: 20,
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
  createButton: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 10,
  },
  createButtonText: {
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
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  disabledButton: {
    opacity: 0.7,
  },
});

export default CreateCommunityModal;