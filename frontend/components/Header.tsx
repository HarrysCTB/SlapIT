import React from 'react';
import { View, TouchableOpacity, StyleSheet, useColorScheme, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const Header = () => {
  const colorScheme = useColorScheme();
  const router = useRouter();

  return (
    <View
      style={[
        styles.header,
        { backgroundColor: colorScheme === 'light' ? 'rgba(237, 37, 78, 0.8)' : '#3A3A3C' }
      ]}
    >
      <TouchableOpacity onPress={() => router.push('/profile')}>
        <Feather name="user" size={24} color="white" />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/(tabs)')}>
        <Image 
          source={require('../assets/images/slapit.png')} 
          style={styles.logo}
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/settings')}>
        <Feather name="settings" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 100,
    paddingHorizontal: 20,
    paddingTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  }
});

export default Header;