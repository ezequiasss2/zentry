
    import { useState, useRef } from 'react';
    import { supabase } from '@/lib/supabase';
    import { useToast } from '@/components/ui/use-toast';

    export function useAvatarUpload(onUploadSuccess) {
      const [isUploading, setIsUploading] = useState(false);
      const fileInputRef = useRef(null);
      const { toast } = useToast();

      const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('Usuário não autenticado');

          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}-${Date.now()}.${fileExt}`;
          const filePath = `${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
          const avatarUrl = urlData.publicUrl;

          const { error: updateError } = await supabase.auth.updateUser({
            data: { avatar_url: avatarUrl }
          });

          if (updateError) throw updateError;

          toast({ title: 'Foto de perfil atualizada!' });
          if (onUploadSuccess) {
            onUploadSuccess(avatarUrl); // Callback with the new URL
          }

        } catch (error) {
          toast({ title: 'Erro ao atualizar foto', description: error.message, variant: 'destructive' });
        } finally {
          setIsUploading(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      };

      const triggerFileInput = () => {
        fileInputRef.current?.click();
      };

      return { isUploading, fileInputRef, handleFileChange, triggerFileInput };
    }
  