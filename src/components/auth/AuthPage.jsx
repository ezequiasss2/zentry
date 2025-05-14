
    import React, { useState } from "react";
    import { motion } from "framer-motion";
    import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
    import { Input } from "@/components/ui/input";
    import { Button } from "@/components/ui/button";
    import { Label } from "@/components/ui/label";
    import { useToast } from "@/components/ui/use-toast";
    import { supabase } from "@/lib/supabase";
    import { Mail, Lock, User } from "lucide-react";
    import ForgotPassword from "@/components/auth/ForgotPassword"; // Import ForgotPassword

    export default function AuthPage() {
      const [isLogin, setIsLogin] = useState(true);
      const [showForgotPassword, setShowForgotPassword] = useState(false); // State for forgot password view
      const [loading, setLoading] = useState(false);
      const [formData, setFormData] = useState({
        email: "",
        password: "",
        name: "",
      });
      const { toast } = useToast();

      const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
          if (isLogin) {
            const { error } = await supabase.auth.signInWithPassword({
              email: formData.email,
              password: formData.password,
            });

            if (error) throw error;

            toast({
              title: "Login realizado com sucesso!",
              description: "Bem-vindo de volta ao Zentry.",
            });
          } else {
            const { error } = await supabase.auth.signUp({
              email: formData.email,
              password: formData.password,
              options: {
                data: {
                  // Store name in user_metadata
                  name: formData.name,
                },
              },
            });

            if (error) throw error;

            toast({
              title: "Cadastro realizado com sucesso!",
              description: "Verifique seu email para confirmar sua conta.",
            });
          }
        } catch (error) {
          toast({
            title: "Erro!",
            description: error.message,
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      };

      if (showForgotPassword) {
        return <ForgotPassword onBackToLogin={() => setShowForgotPassword(false)} />;
      }

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
                  <span className="bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                    Zentry
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="name"
                          placeholder="Seu nome"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="pl-10 h-11"
                          required
                        />
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="pl-10 h-11"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        className="pl-10 h-11"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                  {isLogin && (
                     <div className="text-right text-sm">
                       <button
                         type="button"
                         onClick={() => setShowForgotPassword(true)}
                         className="text-blue-500 hover:underline"
                       >
                         Esqueceu a senha?
                       </button>
                     </div>
                   )}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 h-11 text-base"
                    disabled={loading}
                  >
                    {loading
                      ? "Carregando..."
                      : isLogin
                      ? "Entrar"
                      : "Criar conta"}
                  </Button>
                </form>
                <div className="mt-6 text-center text-sm">
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-blue-500 hover:underline"
                  >
                    {isLogin
                      ? "Não tem uma conta? Cadastre-se"
                      : "Já tem uma conta? Entre"}
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      );
    }
  