
    export function sendNotification(title, body) {
      if (!("Notification" in window)) {
        console.log("Este navegador não suporta notificações desktop");
        return;
      }

      if (Notification.permission === "granted") {
        // Use a tag to prevent duplicate notifications if scheduled close together
        const options = {
          body: body,
          tag: title + body, // Simple tag based on content
        };
        new Notification(title, options);
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
          if (permission === "granted") {
             const options = {
               body: body,
               tag: title + body, 
             };
            new Notification(title, options);
          }
        });
      }
    }

    // Keep track of scheduled notification timeouts to potentially clear them later if needed
    const scheduledNotifications = {};

    export function scheduleNotification(title, body, date, id = null) {
      const now = new Date().getTime();
      const scheduledTime = new Date(date).getTime();
      
      // Use a unique identifier for the notification if provided
      const notificationId = id || title + date.toISOString(); 

      // Clear any existing timeout for this specific notification ID
      if (scheduledNotifications[notificationId]) {
        clearTimeout(scheduledNotifications[notificationId]);
      }

      if (scheduledTime > now) {
        const timeout = scheduledTime - now;
        
        // Store the timeout ID
        scheduledNotifications[notificationId] = setTimeout(() => {
          sendNotification(title, body);
          // Remove from tracking once fired
          delete scheduledNotifications[notificationId]; 
        }, timeout);

        console.log(`Notification scheduled for ${notificationId} at ${new Date(date)}`);
      } else {
         console.log(`Notification time for ${notificationId} has already passed (${new Date(date)}).`);
      }
    }

    // Optional: Function to clear a specific scheduled notification
    export function clearScheduledNotification(id) {
       if (scheduledNotifications[id]) {
          clearTimeout(scheduledNotifications[id]);
          delete scheduledNotifications[id];
          console.log(`Cleared scheduled notification: ${id}`);
       }
    }

    // Optional: Function to clear all scheduled notifications
    export function clearAllScheduledNotifications() {
       Object.keys(scheduledNotifications).forEach(id => {
          clearTimeout(scheduledNotifications[id]);
          delete scheduledNotifications[id];
       });
       console.log("Cleared all scheduled notifications.");
    }
  