
    import React from "react";
    import { Button } from "@/components/ui/button";
    import { useToast } from "@/components/ui/use-toast";
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
    import { Download, Trash2, User } from "lucide-react"; // Added User icon

    // Renamed Settings to SettingsPanel to avoid conflict with ProfilePage if needed
    function SettingsPanel({ onNavigateToProfile }) { // Added prop to navigate
      const { toast } = useToast();

      // Keep data clearing local for now, Supabase data needs careful handling (Edge Function recommended)
      const clearLocalData = () => {
        localStorage.removeItem("tasks"); // Clear specific keys instead of all
        localStorage.removeItem("transactions");
        localStorage.removeItem("habits");
        localStorage.removeItem("darkMode"); // Keep theme preference? Maybe not.
        
        toast({
          title: "Dados locais limpos",
          description: "Os dados armazenados no navegador foram removidos.",
          variant: "destructive",
        });
         // Consider reloading or updating state if necessary
         // window.location.reload();
      };

      const exportData = () => {
         // This only exports local data, not Supabase data.
         // For full backup, need to fetch from Supabase first.
        const data = {
          tasks: JSON.parse(localStorage.getItem("tasks") || "[]"),
          transactions: JSON.parse(localStorage.getItem("transactions") || "[]"),
          habits: JSON.parse(localStorage.getItem("habits") || "[]"),
          // Add Supabase data here after fetching if needed for a full export
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "zentry-local-backup.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
          title: "Dados locais exportados",
          description: "Um backup dos dados locais foi baixado.",
        });
      };

      return (
        <div className="space-y-6">
          <Card>
             <CardHeader>
               <CardTitle>Ajustes</CardTitle>
               <CardDescription>Gerencie as configurações do aplicativo e sua conta.</CardDescription>
             </CardHeader>
             <CardContent className="space-y-6">
                {/* Profile Section Link */}
                <div>
                   <h3 className="text-lg font-medium mb-2">Conta</h3>
                   <Button onClick={onNavigateToProfile} variant="outline" className="w-full sm:w-auto">
                      <User className="mr-2 h-4 w-4" /> Gerenciar Perfil
                   </Button>
                   <p className="text-sm text-muted-foreground mt-1">Edite seu nome, senha, foto e outras informações.</p>
                </div>

                {/* Data Management Section */}
                <div className="border-t pt-6">
                   <h3 className="text-lg font-medium mb-2">Gerenciamento de Dados (Local)</h3>
                   <div className="space-y-4 sm:space-y-0 sm:flex sm:space-x-4">
                      <div>
                         <Button onClick={exportData} variant="outline" className="w-full sm:w-auto">
                            <Download className="mr-2 h-4 w-4" /> Exportar Dados Locais
                         </Button>
                         <p className="text-sm text-muted-foreground mt-1">Baixar um backup dos dados salvos neste navegador.</p>
                      </div>
                      <div>
                         <Button variant="destructive" onClick={clearLocalData} className="w-full sm:w-auto">
                            <Trash2 className="mr-2 h-4 w-4" /> Limpar Dados Locais
                         </Button>
                         <p className="text-sm text-muted-foreground mt-1">Remove tarefas, finanças e hábitos salvos localmente.</p>
                      </div>
                   </div>
                </div>

             </CardContent>
          </Card>
        </div>
      );
    }

    export default SettingsPanel;
  