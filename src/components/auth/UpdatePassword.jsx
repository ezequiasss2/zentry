
    import React, { useState } from "react";
    import { motion } from "framer-motion";
    import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
    import { Input } from "@/components/ui/input";
    import { Button } from "@/components/ui/button";
    import { Label } from "@/components/ui/label";
    import { useToast } from "@/components/ui/use-toast";
    import { supabase } from "@/lib/supabase";
    import { Lock } from "lucide-react";

    // This component should be rendered when the user clicks the reset link
    // Supabase handles the session update automatically on redirect if configured correctly
    export default function UpdatePassword() {
      const [loading, setLoading] = useState(false);
      const [password, setPassword] = useState("");
      const [confirmPassword, setConfirmPassword] = useState("");
      const { toast } = useToast();

      const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
          toast({ title: "Erro", description: "As senhas não coincidem.", variant: "destructive" });
          return;
        }
        if (password.length < 6) {
           toast({ title: "Erro", description: "A senha deve ter pelo menos 6 caracteres.", variant: "destructive" });
           return;
        }

        setLoading(true);

        try {
          // The user should be in a session created by the password recovery link
          const { error } = await supabase.auth.updateUser({ password: password });

          if (error) throw error;

          toast({
            title: "Senha atualizada!",
            description: "Sua senha foi redefinida com sucesso. Você pode fazer login agora.",
          });
          // Optionally redirect to login or dashboard after a delay
          // setTimeout(() => { /* redirect logic */ }, 2000);

        } catch (error) {
          toast({
            title: "Erro ao atualizar senha",
            description: error.message,
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      };

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-blue-500/20 p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <Card className="shadow-lg">
              <CardHeader className="space-y-1 p-6">
                <CardTitle className="text-2xl sm:text-3xl font-bold text-center">
                  Definir Nova Senha
                </CardTitle>
                <CardDescription className="text-center">
                  Digite sua nova senha abaixo.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Nova Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 h-11"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 h-11"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 h-11 text-base"
                    disabled={loading}
                  >
                    {loading ? "Atualizando..." : "Atualizar Senha"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      );
    }
  