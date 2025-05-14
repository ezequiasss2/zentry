
    import React from 'react';
    import { Button } from '@/components/ui/button';
    import { motion } from 'framer-motion';
    import { Trash2, Bell, Edit3 } from 'lucide-react';
    import { format, parseISO } from 'date-fns';
    import { cn } from '@/lib/utils';

    export function TaskItem({ task, onToggleTask, onDeleteTask, onEditTask, onManageNotifications }) {
      const hasNotifications = task.custom_notifications && task.custom_notifications.length > 0;

      return (
        <motion.div
          layout
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between rounded-lg border p-4 shadow-sm bg-card"
        >
          <div className="flex items-center space-x-4 overflow-hidden">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => onToggleTask(task.id)}
              className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary flex-shrink-0 cursor-pointer"
            />
            <div className="flex-grow overflow-hidden">
              <p className={cn("font-medium truncate", task.completed && "line-through text-muted-foreground")}>
                {task.text}
              </p>
              <div className="mt-1 flex flex-wrap gap-x-2 text-sm text-muted-foreground">
                <span className="capitalize">{task.category}</span>
                {task.due_date && (
                  <span>• {format(parseISO(task.due_date), 'dd/MM/yyyy HH:mm')}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0 ml-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onManageNotifications(task)}
              className={cn("h-8 w-8", hasNotifications ? "text-yellow-500 hover:text-yellow-600" : "text-gray-500 hover:text-gray-700")}
              title="Gerenciar Notificações"
            >
              <Bell className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEditTask(task)}
              className="text-blue-500 hover:text-blue-700 h-8 w-8"
              title="Editar Tarefa"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDeleteTask(task.id)}
              className="text-red-500 hover:text-red-700 h-8 w-8"
              title="Excluir Tarefa"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      );
    }
  