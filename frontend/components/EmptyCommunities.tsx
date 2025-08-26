import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemedText } from './ThemedText';
import CreateCommunityModal from './CreateCommunityModal';
import JoinCommunityModal from './JoinCommunityModal';

export default function EmptyCommunities() {
const colorScheme = useColorScheme();
const [isModalVisible, setModalVisible] = useState(false);
const [isJoinModalVisible, setJoinModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>
        Y'a pas encore de monde ici… 😶
      </ThemedText>
      <ThemedText style={styles.description}>
        Lance-toi ! Crée ou rejoins une communauté pour vivre l'expérience ensemble !
      </ThemedText>
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor:
              colorScheme === 'light'
                ? 'rgba(237, 37, 78, 0.8)'
                : '#1B2432',
          },
        ]}
        onPress={() => setModalVisible(true)}
      >
        <ThemedText style={styles.buttonText}>Créer une communauté</ThemedText>
      </TouchableOpacity>

      <CreateCommunityModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onCreate={(name, desc) => {
          console.log('Communauté créée :', name, desc);
        }}
      />
      <TouchableOpacity
      style={[
        styles.buttonSecond,
        {
          borderColor:
            colorScheme === 'light'
              ? 'rgba(237, 37, 78, 0.8)'
              : '#1B2432',
        },
      ]}
      onPress={() => setJoinModalVisible(true)} // <--- Ouvre le modal ici
    >
      <ThemedText
        style={[
          styles.buttonTextSecond,
          {
            color:
              colorScheme === 'light'
                ? 'rgba(237, 37, 78, 0.8)'
                : '#FFFFFF',
          },
        ]}
      >
        Rejoindre une communauté
      </ThemedText>
    </TouchableOpacity>
    <JoinCommunityModal
        visible={isJoinModalVisible}
        onClose={() => setJoinModalVisible(false)}
        onJoin={(communityName) => {
          console.log('Nom de la communauté à rejoindre :', communityName);
          // Appelle ici ton API ou autre logique
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
    minHeight: '75%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  button: {
    backgroundColor: '#ED254E',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonSecond: {
    borderWidth: 2,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextSecond: {
    color: 'rgba(237, 37, 78, 0.8)',
    fontSize: 16,
    fontWeight: '600',
  },
});