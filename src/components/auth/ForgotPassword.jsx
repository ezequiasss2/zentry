
    import React, { useState } from "react";
    import { motion } from "framer-motion";
    import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
    import { Input } from "@/components/ui/input";
    import { Button } from "@/components/ui/button";
    import { Label } from "@/components/ui/label";
    import { useToast } from "@/components/ui/use-toast";
    import { supabase } from "@/lib/supabase";
    import { Mail, ArrowLeft } from "lucide-react";

    export default function ForgotPassword({ onBackToLogin }) {
      const [loading, setLoading] = useState(false);
      const [email, setEmail] = useState("");
      const { toast } = useToast();

      const handlePasswordReset = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin, // Redirect back to the app after clicking the link
          });

          if (error) throw error;

          toast({
            title: "Verifique seu e-mail",
            description: "Enviamos um link para redefinição de senha para o seu e-mail.",
          });
        } catch (error) {
          toast({
            title: "Erro ao redefinir senha",
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
                  Redefinir Senha
                </CardTitle>
                <CardDescription className="text-center">
                  Digite seu e-mail para receber o link de redefinição.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-11"
                        required
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 h-11 text-base"
                    disabled={loading}
                  >
                    {loading ? "Enviando..." : "Enviar Link"}
                  </Button>
                </form>
                <div className="mt-6 text-center text-sm">
                  <button
                    type="button"
                    onClick={onBackToLogin}
                    className="text-blue-500 hover:underline flex items-center justify-center w-full"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" /> Voltar para o Login
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      );
    }
  