
    import { useState, useEffect, useCallback } from 'react';
    import { supabase } from '@/lib/supabase';
    import { useToast } from '@/components/ui/use-toast';

    export function useUserProfile() {
      const [profile, setProfile] = useState({ name: '', email: '', avatar_url: null });
      const [loading, setLoading] = useState(true);
      const { toast } = useToast();

      const fetchProfile = useCallback(async () => {
        setLoading(true);
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            setProfile({
              name: user.user_metadata?.name || 'Usuário',
              email: user.email,
              avatar_url: user.user_metadata?.avatar_url || null,
            });
          } else {
            throw new Error('Usuário não encontrado');
          }
        } catch (error) {
          toast({ title: 'Erro ao buscar perfil', description: error.message, variant: 'destructive' });
        } finally {
          setLoading(false);
        }
      }, [toast]);

      useEffect(() => {
        fetchProfile();
      }, [fetchProfile]);

      const updateProfileMetadata = useCallback(async (metadata) => {
        setLoading(true);
        try {
          const { error } = await supabase.auth.updateUser({ data: metadata });
          if (error) throw error;
          // Refetch profile to confirm update
          await fetchProfile();
          return true; // Indicate success
        } catch (error) {
          toast({ title: 'Erro ao atualizar perfil', description: error.message, variant: 'destructive' });
          return false; // Indicate failure
        } finally {
          setLoading(false);
        }
      }, [toast, fetchProfile]);

      const updateUserCredentials = useCallback(async (credentials) => {
         setLoading(true);
         try {
           const { error } = await supabase.auth.updateUser(credentials);
           if (error) throw error;
           // No need to refetch profile for password change
           return true; // Indicate success
         } catch (error) {
           toast({ title: 'Erro ao atualizar credenciais', description: error.message, variant: 'destructive' });
           return false; // Indicate failure
         } finally {
           setLoading(false);
         }
      }, [toast]);


      return { profile, loading, fetchProfile, updateProfileMetadata, updateUserCredentials, setLoading };
    }
  