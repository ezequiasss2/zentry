
    import React, { useState } from 'react';
    import { useTasks } from '@/hooks/useTasks';
    import { TaskForm } from '@/components/tasks/TaskForm';
    import { TaskList } from '@/components/tasks/TaskList';
    import { TaskNotificationManager } from '@/components/tasks/TaskNotificationManager';

    function TaskManager() {
      const { tasks, loading, addTask, deleteTask, toggleTask, updateTask, saveTaskNotifications } = useTasks();
      const [editingTask, setEditingTask] = useState(null);
      const [managingNotificationsTask, setManagingNotificationsTask] = useState(null);

      const handleEditTask = (task) => {
        setEditingTask(task);
      };

      const handleClearEditing = () => {
        setEditingTask(null);
      };

      const handleManageNotifications = (task) => {
        setManagingNotificationsTask(task);
      };

      const handleCloseNotificationManager = () => {
        setManagingNotificationsTask(null);
      };

      return (
        <div className="space-y-6">
          <TaskForm
            onAddTask={addTask}
            onUpdateTask={updateTask}
            editingTask={editingTask}
            onClearEditing={handleClearEditing}
          />
          <TaskList
            tasks={tasks}
            loading={loading}
            onToggleTask={toggleTask}
            onDeleteTask={deleteTask}
            onEditTask={handleEditTask}
            onManageNotifications={handleManageNotifications}
          />
          {managingNotificationsTask && (
            <TaskNotificationManager
              task={managingNotificationsTask}
              isOpen={!!managingNotificationsTask}
              onClose={handleCloseNotificationManager}
              onSaveNotifications={saveTaskNotifications}
            />
          )}
        </div>
      );
    }

    export default TaskManager;
  