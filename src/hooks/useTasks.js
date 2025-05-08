
    import { useState, useEffect, useCallback } from 'react';
    import { supabase } from '@/lib/supabase';
    import { useToast } from '@/components/ui/use-toast';
    import { scheduleNotification, clearScheduledNotification } from '@/lib/notifications';
    import { parseISO, isValid } from 'date-fns';

    export function useTasks() {
      const [tasks, setTasks] = useState([]);
      const [loading, setLoading] = useState(true);
      const { toast } = useToast();

      const fetchTaskNotifications = async (taskId) => {
        const { data, error } = await supabase
          .from('task_notifications')
          .select('*')
          .eq('task_id', taskId)
          .order('notify_at', { ascending: true });
        if (error) {
          console.error('Error fetching task notifications:', error);
          return [];
        }
        return data;
      };

      const scheduleAllTaskNotifications = (taskWithNotifications) => {
        // Clear existing notifications for this task first
        if (taskWithNotifications.custom_notifications) {
           taskWithNotifications.custom_notifications.forEach(notif => {
             clearScheduledNotification(`task_notif-${notif.id || notif.datetime}`); // Use a unique ID
           });
        }
        
        // Schedule new ones
        (taskWithNotifications.custom_notifications || []).forEach(notif => {
          const notifyAtDate = parseISO(notif.datetime);
          if (isValid(notifyAtDate) && notifyAtDate > new Date()) {
            scheduleNotification(
              `Lembrete: ${taskWithNotifications.text}`,
              notif.message || `Sua tarefa "${taskWithNotifications.text}" tem um lembrete.`,
              notifyAtDate,
              `task_notif-${notif.id || notif.datetime}` // Unique ID for this specific notification
            );
          }
        });

        // Schedule main due_date notification if it exists and is different
        if (taskWithNotifications.due_date && !taskWithNotifications.completed) {
          const dueDate = parseISO(taskWithNotifications.due_date);
          if (isValid(dueDate) && dueDate > new Date()) {
             // Ensure it's not already covered by a custom notification at the exact same time
             const isCovered = (taskWithNotifications.custom_notifications || []).some(n => parseISO(n.datetime).getTime() === dueDate.getTime());
             if (!isCovered) {
                scheduleNotification(
                  `Tarefa Pendente: ${taskWithNotifications.text}`,
                  `Sua tarefa "${taskWithNotifications.text}" está programada para agora.`,
                  dueDate,
                  `task_due-${taskWithNotifications.id}` // Unique ID for due date notification
                );
             }
          }
        }
      };
      
      const clearAllNotificationsForTask = (task) => {
        (task.custom_notifications || []).forEach(notif => {
          clearScheduledNotification(`task_notif-${notif.id || notif.datetime}`);
        });
        if (task.due_date) {
          clearScheduledNotification(`task_due-${task.id}`);
        }
      };


      const fetchTasks = useCallback(async () => {
        setLoading(true);
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('Usuário não autenticado');

          const { data: tasksData, error: tasksError } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (tasksError) throw tasksError;

          const tasksWithNotifications = await Promise.all(
            (tasksData || []).map(async task => {
              const notifications = await fetchTaskNotifications(task.id);
              // Store notifications in the task object itself for easier access
              // The custom_notifications field in tasks table is now the source of truth for UI
              // The task_notifications table is for backend/scheduling
              return { ...task, custom_notifications: notifications.map(n => ({id: n.id, datetime: n.notify_at, message: n.message })) };
            })
          );
          
          setTasks(tasksWithNotifications);
          tasksWithNotifications.forEach(scheduleAllTaskNotifications);

        } catch (error) {
          toast({ title: 'Erro ao buscar tarefas', description: error.message, variant: 'destructive' });
        } finally {
          setLoading(false);
        }
      }, [toast]);

      useEffect(() => {
        fetchTasks();
      }, [fetchTasks]);


      const addTask = async (taskData) => {
        setLoading(true);
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('Usuário não autenticado');

          // custom_notifications will be handled by saveTaskNotifications
          const { custom_notifications, ...restOfTaskData } = taskData; 
          const fullTaskData = { ...restOfTaskData, user_id: user.id, completed: false };
          
          // Insert task first
          const { data: newTask, error: taskError } = await supabase
            .from('tasks')
            .insert(fullTaskData)
            .select()
            .single();

          if (taskError) throw taskError;
          
          // If there are custom notifications to add (though typically added via edit/manage)
          if (custom_notifications && custom_notifications.length > 0) {
             await saveTaskNotifications(newTask.id, custom_notifications);
             const updatedNotifications = await fetchTaskNotifications(newTask.id);
             newTask.custom_notifications = updatedNotifications.map(n => ({id: n.id, datetime: n.notify_at, message: n.message }));
          } else {
             newTask.custom_notifications = [];
          }

          setTasks(prevTasks => [newTask, ...prevTasks]);
          scheduleAllTaskNotifications(newTask);
          toast({ title: 'Tarefa adicionada', description: 'Sua nova tarefa foi criada com sucesso!' });
          return true;
        } catch (error) {
          toast({ title: 'Erro ao adicionar tarefa', description: error.message, variant: 'destructive' });
          return false;
        } finally {
          setLoading(false);
        }
      };
      
      const updateTask = async (taskId, taskData) => {
        setLoading(true);
        try {
          // custom_notifications are handled by saveTaskNotifications
          const { custom_notifications, ...restOfTaskData } = taskData;

          const { data: updatedTask, error } = await supabase
            .from('tasks')
            .update(restOfTaskData)
            .eq('id', taskId)
            .select()
            .single();

          if (error) throw error;
          
          // Refetch notifications as they might have changed if saveTaskNotifications was called separately
          const currentNotifications = await fetchTaskNotifications(updatedTask.id);
          updatedTask.custom_notifications = currentNotifications.map(n => ({id: n.id, datetime: n.notify_at, message: n.message }));

          setTasks(prevTasks => prevTasks.map(t => (t.id === taskId ? updatedTask : t)));
          scheduleAllTaskNotifications(updatedTask); // Reschedule all notifications for this task
          toast({ title: 'Tarefa atualizada', description: 'Tarefa atualizada com sucesso!' });
          return true;
        } catch (error) {
          toast({ title: 'Erro ao atualizar tarefa', description: error.message, variant: 'destructive' });
          return false;
        } finally {
          setLoading(false);
        }
      };


      const deleteTask = async (taskId) => {
        const taskToDelete = tasks.find(t => t.id === taskId);
        if (taskToDelete) {
          clearAllNotificationsForTask(taskToDelete); // Clear before deleting from DB
        }
        try {
          // Deleting from 'tasks' will cascade delete from 'task_notifications'
          const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', taskId);

          if (error) throw error;

          setTasks(prevTasks => prevTasks.filter((task) => task.id !== taskId));
          toast({ title: 'Tarefa removida', description: 'A tarefa foi removida com sucesso.', variant: 'destructive' });
        } catch (error) {
          toast({ title: 'Erro ao remover tarefa', description: error.message, variant: 'destructive' });
        }
      };

      const toggleTask = async (taskId) => {
        const taskToUpdate = tasks.find(task => task.id === taskId);
        if (!taskToUpdate) return;

        const newCompletedStatus = !taskToUpdate.completed;

        try {
          const { data: updatedTask, error } = await supabase
            .from('tasks')
            .update({ completed: newCompletedStatus })
            .eq('id', taskId)
            .select()
            .single();

          if (error) throw error;
          
          // Preserve existing custom notifications on the task object
          updatedTask.custom_notifications = taskToUpdate.custom_notifications;

          setTasks(prevTasks =>
            prevTasks.map((task) =>
              task.id === taskId ? updatedTask : task
            )
          );

          if (newCompletedStatus) {
            clearAllNotificationsForTask(updatedTask); // Clear all if completed
          } else {
            scheduleAllTaskNotifications(updatedTask); // Reschedule if marked incomplete
          }

        } catch (error) {
          toast({ title: 'Erro ao atualizar tarefa', description: error.message, variant: 'destructive' });
        }
      };

      const saveTaskNotifications = async (taskId, newNotifications) => {
        setLoading(true);
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('Usuário não autenticado');

          // 1. Fetch existing notifications for this task from DB
          const { data: existingDbNotifications, error: fetchError } = await supabase
            .from('task_notifications')
            .select('id, notify_at')
            .eq('task_id', taskId);
          if (fetchError) throw fetchError;

          // 2. Determine notifications to delete
          const newNotificationDatetimes = newNotifications.map(n => parseISO(n.datetime).toISOString());
          const notificationsToDelete = existingDbNotifications.filter(
            dbNotif => !newNotificationDatetimes.includes(parseISO(dbNotif.notify_at).toISOString())
          );
          
          if (notificationsToDelete.length > 0) {
            const idsToDelete = notificationsToDelete.map(n => n.id);
            // Clear scheduled browser notifications before deleting from DB
            notificationsToDelete.forEach(n => clearScheduledNotification(`task_notif-${n.id || n.notify_at}`));
            const { error: deleteError } = await supabase
              .from('task_notifications')
              .delete()
              .in('id', idsToDelete);
            if (deleteError) throw deleteError;
          }

          // 3. Determine notifications to add/update (Supabase upsert can handle this)
          const notificationsToUpsert = newNotifications.map(n => ({
            task_id: taskId,
            user_id: user.id,
            notify_at: parseISO(n.datetime).toISOString(),
            message: n.message || `Lembrete para tarefa.`, // Default message
            // If n.id exists and is a valid UUID from DB, use it for upsert. Otherwise, let DB generate.
            // For simplicity, we'll let upsert handle conflicts on task_id + notify_at if we add a unique constraint.
            // Or, we can just insert new ones and rely on the delete step.
            // For now, let's assume we are adding new ones if they don't match existing by datetime.
          }));
          
          // Filter out notifications that already exist (by datetime) to avoid duplicates if no unique constraint
          const existingDatetimes = existingDbNotifications.map(n => parseISO(n.notify_at).toISOString());
          const finalNotificationsToInsert = notificationsToUpsert.filter(
            nToUpsert => !existingDatetimes.includes(parseISO(nToUpsert.notify_at).toISOString())
          );


          if (finalNotificationsToInsert.length > 0) {
            const { error: insertError } = await supabase
              .from('task_notifications')
              .insert(finalNotificationsToInsert);
            if (insertError) throw insertError;
          }
          
          // Update the task's custom_notifications field in the `tasks` table (optional, if you want to store it denormalized)
          // For now, we fetch fresh from task_notifications table after save.

          // Refetch the task to get its updated notification list and re-schedule
          const { data: updatedTaskData, error: taskFetchError } = await supabase
            .from('tasks')
            .select('*')
            .eq('id', taskId)
            .single();
          if (taskFetchError) throw taskFetchError;

          const finalUpdatedNotifications = await fetchTaskNotifications(taskId);
          updatedTaskData.custom_notifications = finalUpdatedNotifications.map(n => ({id: n.id, datetime: n.notify_at, message: n.message }));

          setTasks(prevTasks => prevTasks.map(t => (t.id === taskId ? updatedTaskData : t)));
          scheduleAllTaskNotifications(updatedTaskData);

          toast({ title: 'Notificações salvas', description: 'Lembretes atualizados com sucesso!' });
        } catch (error) {
          toast({ title: 'Erro ao salvar notificações', description: error.message, variant: 'destructive' });
        } finally {
          setLoading(false);
        }
      };


      return { tasks, loading, addTask, deleteTask, toggleTask, updateTask, saveTaskNotifications, fetchTasks };
    }
  