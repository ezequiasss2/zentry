
    import React, { useState, useEffect } from 'react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
    import { Calendar } from '@/components/ui/calendar';
    import { Plus, Calendar as CalendarIcon, Save } from 'lucide-react';
    import { format, parseISO } from 'date-fns';
    import { cn } from '@/lib/utils';

    export function TaskForm({ onAddTask, onUpdateTask, editingTask, onClearEditing }) {
      const [taskText, setTaskText] = useState('');
      const [category, setCategory] = useState('pessoal');
      const [dueDate, setDueDate] = useState(null);
      const [isCalendarOpen, setIsCalendarOpen] = useState(false);
      const [isEditing, setIsEditing] = useState(false);

      useEffect(() => {
        if (editingTask) {
          setIsEditing(true);
          setTaskText(editingTask.text);
          setCategory(editingTask.category);
          setDueDate(editingTask.due_date ? parseISO(editingTask.due_date) : null);
        } else {
          setIsEditing(false);
          setTaskText('');
          setCategory('pessoal');
          setDueDate(null);
        }
      }, [editingTask]);

      const handleSubmit = async (e) => {
        e.preventDefault();
        if (!taskText.trim()) return;

        const taskData = {
          text: taskText,
          category,
          due_date: dueDate ? dueDate.toISOString() : null,
        };

        let success;
        if (isEditing && editingTask) {
          success = await onUpdateTask(editingTask.id, taskData);
        } else {
          success = await onAddTask(taskData);
        }

        if (success) {
          if (!isEditing) { // Only reset fully if not editing (or if editing and save is successful, parent handles clearing)
             setTaskText('');
             setDueDate(null);
             setCategory('pessoal');
          }
          if (isEditing) {
            onClearEditing(); // Signal parent to clear editing state
          }
        }
      };

      const handleDateSelect = (date) => {
         setDueDate(date);
         setIsCalendarOpen(false);
      };

      const handleCancelEdit = () => {
        onClearEditing();
      };

      return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-card shadow">
          <h3 className="text-lg font-semibold mb-3">{isEditing ? 'Editar Tarefa' : 'Nova Tarefa'}</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <Label htmlFor="taskText">Tarefa</Label>
              <Input
                id="taskText"
                value={taskText}
                onChange={(e) => setTaskText(e.target.value)}
                placeholder="Digite sua tarefa..."
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Categoria</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pessoal">Pessoal</SelectItem>
                  <SelectItem value="trabalho">Trabalho</SelectItem>
                  <SelectItem value="estudos">Estudos</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="dueDate">Data de Conclusão</Label>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !dueDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, 'dd/MM/yyyy HH:mm') : <span>Escolha uma data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={handleDateSelect}
                    initialFocus
                  />
                   <Input 
                      type="time"
                      value={dueDate ? format(dueDate, 'HH:mm') : ''}
                      onChange={(e) => {
                          if (dueDate) {
                              const [hours, minutes] = e.target.value.split(':');
                              const newDate = new Date(dueDate);
                              newDate.setHours(parseInt(hours, 10));
                              newDate.setMinutes(parseInt(minutes, 10));
                              setDueDate(newDate);
                          } else {
                              // If no date is set, create a new date object for time
                              const todayWithTime = new Date();
                              const [hours, minutes] = e.target.value.split(':');
                              todayWithTime.setHours(parseInt(hours, 10));
                              todayWithTime.setMinutes(parseInt(minutes, 10));
                              setDueDate(todayWithTime);
                          }
                      }}
                      className="mt-2"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button type="submit" className="flex-grow">
              {isEditing ? <Save className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
              {isEditing ? 'Salvar Alterações' : 'Adicionar Tarefa'}
            </Button>
            {isEditing && (
              <Button type="button" variant="outline" onClick={handleCancelEdit}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      );
    }
  