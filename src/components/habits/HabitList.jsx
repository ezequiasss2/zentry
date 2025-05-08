
    import React from 'react';
    import { Button } from '@/components/ui/button';
    import { Trash2, Check } from 'lucide-react';
    import { motion, AnimatePresence } from 'framer-motion';

    export function HabitList({ habits, onDeleteHabit, onLogHabit, calculateStreak, isCompletedToday, loading }) {

      if (loading) {
        return <p>Carregando hábitos...</p>;
      }

       if (habits.length === 0) {
         return <p className="text-center text-muted-foreground">Nenhum hábito adicionado ainda.</p>;
       }

      return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {habits.map((habit) => {
              const streak = calculateStreak(habit.id);
              const completedToday = isCompletedToday(habit.id);

              return (
                <motion.div
                  key={habit.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-lg border p-4 shadow-sm bg-card transition-all hover:shadow-md"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-medium break-words mr-2">{habit.name}</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteHabit(habit.id)}
                      className="text-red-500 hover:text-red-700 flex-shrink-0 h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Sequência</p>
                      <p className="text-2xl font-bold text-primary">{streak} dias</p>
                    </div>
                    <Button
                      onClick={() => onLogHabit(habit.id)}
                      disabled={completedToday}
                      variant={completedToday ? "secondary" : "default"}
                      size="sm"
                      className="transition-colors"
                    >
                       {completedToday ? <Check className="mr-2 h-4 w-4" /> : null}
                       {completedToday ? 'Feito!' : 'Completar'}
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      );
    }
  