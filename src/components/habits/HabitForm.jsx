
    import React, { useState } from 'react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Plus } from 'lucide-react';

    export function HabitForm({ onAddHabit, loading }) {
      const [newHabit, setNewHabit] = useState('');

      const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newHabit.trim()) return;

        const success = await onAddHabit(newHabit);
        if (success) {
          setNewHabit('');
        }
      };

      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="habit">Novo Hábito</Label>
            <div className="flex space-x-2">
              <Input
                id="habit"
                value={newHabit}
                onChange={(e) => setNewHabit(e.target.value)}
                placeholder="Digite um novo hábito..."
                disabled={loading}
              />
              <Button type="submit" disabled={loading}>
                <Plus className="mr-2 h-4 w-4" /> Adicionar
              </Button>
            </div>
          </div>
        </form>
      );
    }
  