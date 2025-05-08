
    import React, { useState, useEffect } from 'react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
    import { Bell, PlusCircle, Trash2, X } from 'lucide-react';
    import { format, parseISO, isValid } from 'date-fns';
    import { useToast } from '@/components/ui/use-toast';

    export function TaskNotificationManager({ task, isOpen, onClose, onSaveNotifications }) {
      const [notifications, setNotifications] = useState([]);
      const [newNotificationDateTime, setNewNotificationDateTime] = useState('');
      const { toast } = useToast();

      useEffect(() => {
        if (task && task.custom_notifications) {
          setNotifications(task.custom_notifications.map(n => ({
            id: n.id || Math.random().toString(36).substr(2, 9), // Ensure ID for new ones
            datetime: n.datetime ? format(parseISO(n.datetime), "yyyy-MM-dd'T'HH:mm") : ''
          })));
        } else {
          setNotifications([]);
        }
        setNewNotificationDateTime(''); // Reset input when task changes or dialog opens
      }, [task, isOpen]);

      const handleAddNotification = () => {
        if (!newNotificationDateTime) {
          toast({ title: "Data e hora inválidas", description: "Por favor, selecione uma data e hora.", variant: "destructive" });
          return;
        }
        const newDate = parseISO(newNotificationDateTime);
        if (!isValid(newDate) || newDate < new Date()) {
          toast({ title: "Data inválida", description: "Por favor, escolha uma data e hora futuras.", variant: "destructive" });
          return;
        }

        setNotifications([...notifications, { id: Math.random().toString(36).substr(2, 9), datetime: newNotificationDateTime }]);
        setNewNotificationDateTime('');
      };

      const handleRemoveNotification = (idToRemove) => {
        setNotifications(notifications.filter(n => n.id !== idToRemove));
      };

      const handleSave = () => {
        const formattedNotifications = notifications
          .map(n => ({ ...n, datetime: parseISO(n.datetime).toISOString() }))
          .filter(n => isValid(parseISO(n.datetime)));
        onSaveNotifications(task.id, formattedNotifications);
        onClose();
      };
      
      if (!task) return null;

      return (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5 text-yellow-500" />
                Notificações para: {task.text}
              </DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
              {notifications.length > 0 && (
                <div className="space-y-2">
                  <Label>Lembretes Agendados:</Label>
                  {notifications.map((notification) => (
                    <div key={notification.id} className="flex items-center justify-between p-2 border rounded-md bg-muted/50">
                      <span>{format(parseISO(notification.datetime), "dd/MM/yyyy 'às' HH:mm")}</span>
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveNotification(notification.id)} className="text-red-500 hover:text-red-700 h-7 w-7">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2 pt-2">
                <Label htmlFor="newNotificationDateTime">Novo Lembrete (Data e Hora)</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="newNotificationDateTime"
                    type="datetime-local"
                    value={newNotificationDateTime}
                    onChange={(e) => setNewNotificationDateTime(e.target.value)}
                    className="flex-grow"
                  />
                  <Button onClick={handleAddNotification} variant="outline" size="icon" className="flex-shrink-0">
                    <PlusCircle className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancelar</Button>
              </DialogClose>
              <Button type="button" onClick={handleSave}>Salvar Lembretes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    }
  