
    import React from 'react';
    import { AnimatePresence } from 'framer-motion';
    import { TaskItem } from '@/components/tasks/TaskItem';

    export function TaskList({ tasks, onToggleTask, onDeleteTask, onEditTask, onManageNotifications, loading }) {
      if (loading) {
        return <p className="text-center text-muted-foreground">Carregando tarefas...</p>;
      }

      if (tasks.length === 0) {
        return <p className="text-center text-muted-foreground">Nenhuma tarefa encontrada.</p>;
      }

      return (
        <div className="space-y-4">
          <AnimatePresence>
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggleTask={onToggleTask}
                onDeleteTask={onDeleteTask}
                onEditTask={onEditTask}
                onManageNotifications={onManageNotifications}
              />
            ))}
          </AnimatePresence>
        </div>
      );
    }
  