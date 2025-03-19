import { useState, useEffect } from 'react';
import { supabase } from '@/configurations/supabaseClient'; // Assure-toi que ton client Supabase est configuré ici

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupère la session actuelle dès le montage
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (!error) {
        setUser(session?.user ?? null);
      }
      setLoading(false);
    };

    getSession();

    // Écoute les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Nettoyage : se désabonner lors du démontage du composant
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}