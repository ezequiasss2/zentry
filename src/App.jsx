
    import React, { useState, useEffect } from "react";
    import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
    import { Button } from "@/components/ui/button";
    import { Calendar as CalendarIconLucide, DollarSign, ListTodo, Settings as SettingsIcon, Moon, Sun, Plus, LogOut, LayoutDashboard, Receipt, User, ArrowLeft } from "lucide-react";
    import { motion, AnimatePresence } from "framer-motion";
    import { Toaster } from "@/components/ui/toaster";
    import { useToast } from "@/components/ui/use-toast";
    import { supabase } from "@/lib/supabase";
    import { format } from "date-fns";

    import TaskManager from "@/components/TaskManager";
    import ExpenseTracker from "@/components/ExpenseTracker";
    import HabitTracker from "@/components/HabitTracker";
    import SettingsPanel from "@/components/Settings";
    import Dashboard from "@/components/Dashboard";
    import AuthPage from "@/components/auth/AuthPage";
    import MonthlyBills from "@/components/MonthlyBills";
    import ProfilePage from "@/components/ProfilePage";
    import UpdatePassword from "@/components/auth/UpdatePassword";

    function App() {
      const [darkMode, setDarkMode] = useState(false);
      const [session, setSession] = useState(null);
      const [activeTab, setActiveTab] = useState("dashboard");
      const [showProfile, setShowProfile] = useState(false);
      const [isPasswordUpdateView, setIsPasswordUpdateView] = useState(false);
      const { toast } = useToast();

      useEffect(() => {
        const hash = window.location.hash;
        if (hash.includes('type=recovery')) {
          setIsPasswordUpdateView(true);
        }

        supabase.auth.getSession().then(({ data: { session } }) => {
          setSession(session);
        });

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
          setSession(session);
          if (_event === 'SIGNED_IN' && isPasswordUpdateView) {
            setIsPasswordUpdateView(false);
            window.location.hash = '';
          }
        });

        return () => subscription.unsubscribe();
      }, [isPasswordUpdateView]);

      useEffect(() => {
        const savedDarkMode = localStorage.getItem("darkMode") === "true";
        setDarkMode(savedDarkMode);
        document.documentElement.classList.toggle("dark", savedDarkMode);

        if ("Notification" in window) {
          Notification.requestPermission().then(permission => {
             if (permission === 'granted') {
                console.log("Permissão para notificações concedida.");
             } else {
                console.log("Permissão para notificações negada.");
             }
          });
        }
      }, []);

      const toggleDarkMode = () => {
        const newDarkMode = !darkMode;
        setDarkMode(newDarkMode);
        localStorage.setItem("darkMode", newDarkMode);
        document.documentElement.classList.toggle("dark", newDarkMode);
        
        toast({
          title: `Modo ${newDarkMode ? "escuro" : "claro"} ativado`,
          duration: 2000,
        });
      };

      const handleSignOut = async () => {
        try {
          await supabase.auth.signOut();
          setShowProfile(false);
          setActiveTab("dashboard");
          toast({
            title: "Logout realizado com sucesso",
            description: "Até logo!",
          });
        } catch (error) {
          toast({
            title: "Erro ao fazer logout",
            description: error.message,
            variant: "destructive",
          });
        }
      };

      const navigateToProfile = () => {
         setShowProfile(true);
         setActiveTab("settings");
      };

      const navigateBackFromProfile = () => {
         setShowProfile(false);
      };

      if (isPasswordUpdateView) {
         return <UpdatePassword />;
      }

      if (!session) {
        return <AuthPage />;
      }

      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 flex flex-col">
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">
                 {showProfile && (
                    <Button variant="ghost" size="icon" onClick={navigateBackFromProfile} className="mr-2 md:hidden">
                       <ArrowLeft className="h-5 w-5" />
                    </Button>
                 )}
                <div className={`flex items-center ${showProfile ? 'flex-grow justify-center' : ''}`}>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                    Zentry
                  </h1>
                </div>
                <div className={`flex items-center space-x-2 sm:space-x-4 ${showProfile && 'md:hidden' ? 'opacity-0 pointer-events-none' : ''}`}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleDarkMode}
                    className="rounded-full"
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={darkMode ? "dark" : "light"}
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 20, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                      </motion.div>
                    </AnimatePresence>
                  </Button>
                   {!showProfile ? (
                      <Button variant="ghost" size="icon" className="rounded-full" onClick={navigateToProfile}>
                         <User className="h-5 w-5" />
                      </Button>
                   ) : (
                      <Button variant="ghost" size="icon" className="rounded-full" onClick={handleSignOut}>
                         <LogOut className="h-5 w-5" />
                      </Button>
                   )}
                </div>
              </div>
            </div>
          </header>

          <main className="flex-grow mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {showProfile ? (
               <ProfilePage onSignOut={handleSignOut} onNavigateBack={navigateBackFromProfile} />
            ) : (
               <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full pb-20 md:pb-0">
                 <TabsContent value="dashboard" className="flex-grow">
                   <Dashboard />
                 </TabsContent>
                 <TabsContent value="tasks" className="flex-grow">
                   <TaskManager />
                 </TabsContent>
                 <TabsContent value="bills" className="flex-grow">
                   <MonthlyBills />
                 </TabsContent>
                 <TabsContent value="expenses" className="flex-grow">
                   <ExpenseTracker />
                 </TabsContent>
                 <TabsContent value="habits" className="flex-grow">
                   <HabitTracker />
                 </TabsContent>
                 <TabsContent value="settings" className="flex-grow">
                   <SettingsPanel onNavigateToProfile={navigateToProfile} />
                 </TabsContent>

                 <TabsList className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-6 h-16 items-center justify-center rounded-t-lg bg-white dark:bg-gray-800 p-1 shadow-lg border-t dark:border-gray-700 md:relative md:inline-flex md:h-12 md:w-auto md:max-w-full md:rounded-lg md:grid-cols-none md:border-none md:bottom-auto md:left-auto md:right-auto">
                   <TabsTrigger value="dashboard" className="flex flex-col items-center justify-center h-full space-y-1 md:flex-row md:space-y-0 md:space-x-2 md:px-3 lg:px-4">
                     <LayoutDashboard className="h-5 w-5" />
                     <span className="text-xs md:text-sm">Dashboard</span>
                   </TabsTrigger>
                   <TabsTrigger value="tasks" className="flex flex-col items-center justify-center h-full space-y-1 md:flex-row md:space-y-0 md:space-x-2 md:px-3 lg:px-4">
                     <CalendarIconLucide className="h-5 w-5" />
                     <span className="text-xs md:text-sm">Agenda</span>
                   </TabsTrigger>
                   <TabsTrigger value="bills" className="flex flex-col items-center justify-center h-full space-y-1 md:flex-row md:space-y-0 md:space-x-2 md:px-3 lg:px-4">
                     <Receipt className="h-5 w-5" />
                     <span className="text-xs md:text-sm">Contas</span>
                   </TabsTrigger>
                   <TabsTrigger value="expenses" className="flex flex-col items-center justify-center h-full space-y-1 md:flex-row md:space-y-0 md:space-x-2 md:px-3 lg:px-4">
                     <DollarSign className="h-5 w-5" />
                     <span className="text-xs md:text-sm">Finanças</span>
                   </TabsTrigger>
                   <TabsTrigger value="habits" className="flex flex-col items-center justify-center h-full space-y-1 md:flex-row md:space-y-0 md:space-x-2 md:px-3 lg:px-4">
                     <ListTodo className="h-5 w-5" />
                     <span className="text-xs md:text-sm">Hábitos</span>
                   </TabsTrigger>
                   <TabsTrigger value="settings" className="flex flex-col items-center justify-center h-full space-y-1 md:flex-row md:space-y-0 md:space-x-2 md:px-3 lg:px-4">
                     <SettingsIcon className="h-5 w-5" />
                     <span className="text-xs md:text-sm">Ajustes</span>
                   </TabsTrigger>
                 </TabsList>
               </Tabs>
            )}
          </main>

          {!showProfile && (
             <Button
               className="fixed bottom-20 right-6 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 z-50 md:hidden"
               size="icon"
             >
               <Plus className="h-6 w-6" />
             </Button>
          )}
          
          <Toaster />
        </div>
      );
    }

    export default App;
  