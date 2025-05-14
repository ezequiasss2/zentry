
    import { useState, useEffect, useCallback } from 'react';
    import { supabase } from '@/lib/supabase';
    import { useToast } from '@/components/ui/use-toast';
    import { startOfDay, isSameDay, subDays } from 'date-fns';

    export function useHabits() {
      const [habits, setHabits] = useState([]);
      const [habitLogs, setHabitLogs] = useState([]);
      const [loading, setLoading] = useState(true);
      const { toast } = useToast();

      const fetchHabitsAndLogs = useCallback(async () => {
        setLoading(true);
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('Usuário não autenticado');

          // Fetch Habits
          const { data: habitsData, error: habitsError } = await supabase
            .from('habits')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true });

          if (habitsError) throw habitsError;
          setHabits(habitsData || []);

          // Fetch Logs (e.g., last 30 days for streak calculation)
          // Adjust date range as needed
          const thirtyDaysAgo = subDays(new Date(), 30);
          const { data: logsData, error: logsError } = await supabase
            .from('habit_logs')
            .select('*')
            .eq('user_id', user.id)
            .gte('completed_at', thirtyDaysAgo.toISOString());

          if (logsError) throw logsError;
          setHabitLogs(logsData || []);

        } catch (error) {
          toast({ title: 'Erro ao buscar hábitos', description: error.message, variant: 'destructive' });
        } finally {
          setLoading(false);
        }
      }, [toast]);

      useEffect(() => {
        fetchHabitsAndLogs();
      }, [fetchHabitsAndLogs]);

      const addHabit = async (habitName) => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('Usuário não autenticado');

          const { data, error } = await supabase
            .from('habits')
            .insert({ user_id: user.id, name: habitName, target_days: 0 }) // target_days might not be needed based on schema? Assuming 0 default.
            .select()
            .single();

          if (error) throw error;

          setHabits(prevHabits => [...prevHabits, data]);
          toast({ title: 'Hábito adicionado', description: 'Seu novo hábito foi criado!' });
          return true;
        } catch (error) {
          toast({ title: 'Erro ao adicionar hábito', description: error.message, variant: 'destructive' });
          return false;
        }
      };

      const deleteHabit = async (habitId) => {
         if (!window.confirm('Tem certeza que deseja excluir este hábito e todos os seus registros?')) return;
        try {
           // Need to delete logs first due to potential foreign key constraints
           const { error: logError } = await supabase
             .from('habit_logs')
             .delete()
             .eq('habit_id', habitId);

           if (logError) throw logError;

           const { error: habitError } = await supabase
            .from('habits')
            .delete()
            .eq('id', habitId);

          if (habitError) throw habitError;

          setHabits(prevHabits => prevHabits.filter((h) => h.id !== habitId));
          setHabitLogs(prevLogs => prevLogs.filter((l) => l.habit_id !== habitId)); // Also remove logs from local state
          toast({ title: 'Hábito removido', description: 'O hábito foi removido com sucesso.', variant: 'destructive' });
        } catch (error) {
          toast({ title: 'Erro ao remover hábito', description: error.message, variant: 'destructive' });
        }
      };

      const logHabitCompletion = async (habitId) => {
         const today = startOfDay(new Date());
         // Check if already logged today in local state first
         const alreadyLogged = habitLogs.some(log =>
            log.habit_id === habitId && isSameDay(new Date(log.completed_at), today)
         );

         if (alreadyLogged) {
            toast({ title: 'Hábito já registrado hoje', variant: 'default' });
            return;
         }

        try {
           const { data: { user } } = await supabase.auth.getUser();
           if (!user) throw new Error('Usuário não autenticado');

           const { data, error } = await supabase
             .from('habit_logs')
             .insert({ habit_id: habitId, user_id: user.id, completed_at: today.toISOString() })
             .select()
             .single();

            if (error) throw error;

            setHabitLogs(prevLogs => [...prevLogs, data]); // Add new log to state
            toast({ title: 'Hábito completado!', description: 'Bom trabalho!' });

        } catch (error) {
           toast({ title: 'Erro ao registrar hábito', description: error.message, variant: 'destructive' });
        }
      };

      // Helper function to calculate streak based on logs
      const calculateStreak = (habitId) => {
          const logsForHabit = habitLogs
             .filter(log => log.habit_id === habitId)
             .map(log => startOfDay(new Date(log.completed_at))) // Normalize to start of day
             .sort((a, b) => b - a); // Sort descending

          if (logsForHabit.length === 0) return 0;

          let streak = 0;
          let currentDate = startOfDay(new Date());

          // Check if completed today
          if (isSameDay(logsForHabit[0], currentDate)) {
             streak = 1;
             currentDate = subDays(currentDate, 1); // Move to check yesterday
          } else if (!isSameDay(logsForHabit[0], subDays(currentDate, 1))) {
             // If not completed today OR yesterday, streak is 0
             return 0;
          } else {
             // Completed yesterday but not today, start checking from yesterday
             currentDate = subDays(currentDate, 1);
          }


          // Check previous consecutive days
          for (let i = streak > 0 ? 1 : 0; i < logsForHabit.length; i++) {
             if (isSameDay(logsForHabit[i], currentDate)) {
                streak++;
                currentDate = subDays(currentDate, 1); // Move to check the day before
             } else if (isSameDay(logsForHabit[i], subDays(currentDate, 1))) {
                 // Allows skipping days (e.g., logged Mon, Wed - streak is 1)
                 // If we only count consecutive days, we'd break here.
                 // For strict consecutive days, uncomment the break:
                 // break;
                 // For now, just ignore the gap and continue checking from the day before the log
                 currentDate = subDays(startOfDay(logsForHabit[i]), 1);

             } else {
                // Gap found, streak broken
                break;
             }
          }

          return streak;
      };

       // Check if habit was completed today
      const isCompletedToday = (habitId) => {
         const today = startOfDay(new Date());
         return habitLogs.some(log =>
            log.habit_id === habitId && isSameDay(new Date(log.completed_at), today)
         );
      };


      return { habits, loading, addHabit, deleteHabit, logHabitCompletion, calculateStreak, isCompletedToday, fetchHabitsAndLogs };
    }
  