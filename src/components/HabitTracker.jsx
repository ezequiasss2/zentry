
    import React from 'react';
    import { useHabits } from '@/hooks/useHabits';
    import { HabitForm } from '@/components/habits/HabitForm';
    import { HabitList } from '@/components/habits/HabitList';

    function HabitTracker() {
      const {
        habits,
        loading,
        addHabit,
        deleteHabit,
        logHabitCompletion,
        calculateStreak,
        isCompletedToday
      } = useHabits();

      return (
        <div className="space-y-6">
          <HabitForm onAddHabit={addHabit} loading={loading} />
          <HabitList
            habits={habits}
            loading={loading}
            onDeleteHabit={deleteHabit}
            onLogHabit={logHabitCompletion}
            calculateStreak={calculateStreak}
            isCompletedToday={isCompletedToday}
          />
        </div>
      );
    }

    export default HabitTracker;
  