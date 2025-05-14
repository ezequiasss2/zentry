
    import React from 'react';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
    import { Camera, LogOut, ArrowLeft } from 'lucide-react'; // Added ArrowLeft
    import { motion } from 'framer-motion';
    import { useUserProfile } from '@/hooks/useUserProfile';
    import { useAvatarUpload } from '@/hooks/useAvatarUpload';
    import { EditNameDialog } from '@/components/profile/EditNameDialog';
    import { EditPasswordDialog } from '@/components/profile/EditPasswordDialog';
    import { DeleteAccountDialog } from '@/components/profile/DeleteAccountDialog';
    import { useToast } from '@/components/ui/use-toast';

    function ProfilePage({ onSignOut, onNavigateBack }) { // Added onNavigateBack prop
      const { profile, loading: profileLoading, fetchProfile, updateProfileMetadata, updateUserCredentials, setLoading: setProfileLoading } = useUserProfile();
      const { toast } = useToast();

      const handleUploadSuccess = (newAvatarUrl) => {
        fetchProfile(); // Refetch profile to update avatar instantly
      };
      const { isUploading, fileInputRef, handleFileChange, triggerFileInput } = useAvatarUpload(handleUploadSuccess);

      const handleUpdateName = async (newName) => {
        const success = await updateProfileMetadata({ name: newName });
        if (success) {
          toast({ title: 'Nome atualizado com sucesso!' });
        }
        return success;
      };

      const handleUpdatePassword = async (newPassword) => {
        const success = await updateUserCredentials({ password: newPassword });
        if (success) {
          toast({ title: 'Senha atualizada com sucesso!' });
        }
        return success;
      };

      const getInitials = (name) => {
        return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
      };

      if (profileLoading && !profile.email) {
        return <p>Carregando perfil...</p>;
      }

      const isLoading = profileLoading || isUploading;

      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <Card>
            <CardHeader className="relative"> {/* Added relative positioning */}
               {/* Internal Back Button */}
               <Button
                 variant="ghost"
                 size="icon"
                 onClick={onNavigateBack}
                 className="absolute left-4 top-4 hidden md:inline-flex" // Show on md+ screens
               >
                 <ArrowLeft className="h-5 w-5" />
               </Button>
              <CardTitle className="text-center text-2xl">Meu Perfil</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-6">
              <div className="relative">
                <Avatar className="h-24 w-24 cursor-pointer" onClick={triggerFileInput}>
                  <AvatarImage src={profile.avatar_url} alt={profile.name} />
                  <AvatarFallback className="text-3xl">{getInitials(profile.name)}</AvatarFallback>
                </Avatar>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute bottom-0 right-0 rounded-full h-8 w-8"
                  onClick={triggerFileInput}
                  disabled={isUploading}
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  disabled={isUploading}
                />
                {isUploading && <p className="text-xs text-center mt-1">Enviando...</p>}
              </div>

              <div className="text-center">
                <p className="text-xl font-semibold">{profile.name}</p>
                <p className="text-muted-foreground">{profile.email}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-sm">
                <EditNameDialog
                  currentName={profile.name}
                  onSave={handleUpdateName}
                  loading={isLoading}
                />
                <EditPasswordDialog
                  onSave={handleUpdatePassword}
                  loading={isLoading}
                />
              </div>

              <div className="border-t pt-6 w-full max-w-sm space-y-4">
                <Button variant="outline" onClick={onSignOut} className="w-full">
                  <LogOut className="mr-2 h-4 w-4" /> Sair da Conta
                </Button>
                <DeleteAccountDialog onSignOut={onSignOut} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      );
    }

    export default ProfilePage;
  