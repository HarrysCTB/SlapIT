global.WebSocket = global.WebSocket || WebSocket;
global.window = global;

import Constants from 'expo-constants';
import { createClient } from '@supabase/supabase-js';

const expoConfig = Constants.expoConfig;

if (!expoConfig || !expoConfig.extra) {
  throw new Error('Les variables de configuration extra ne sont pas définies.');
}

const { SUPABASE_URL, SUPABASE_KEY } = expoConfig.extra;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Les variables SUPABASE_URL et SUPABASE_KEY doivent être définies dans la configuration.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);