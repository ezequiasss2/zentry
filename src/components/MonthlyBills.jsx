
    import React, { useState, useEffect, useCallback } from "react";
    import { supabase } from "@/lib/supabase";
    import { useToast } from "@/components/ui/use-toast";
    import { Button } from "@/components/ui/button";
    import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
    import { Input } from "@/components/ui/input";
    import { Label } from "@/components/ui/label";
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
    import { Switch } from "@/components/ui/switch";
    import { Textarea } from "@/components/ui/textarea";
    import { Plus, Edit, Trash2, Bell, BellOff, AlertCircle } from "lucide-react";
    import { motion, AnimatePresence } from "framer-motion";
    import { scheduleNotification } from "@/lib/notifications";
    import { format, addMonths, subDays, setDate, isBefore, startOfDay } from 'date-fns';

    const BillForm = ({ bill, onSave, onClose }) => {
      const [formData, setFormData] = useState({
        name: bill?.name || "",
        amount: bill?.amount || "",
        due_day: bill?.due_day || 1,
        payment_type: bill?.payment_type || "boleto",
        category: bill?.category || "servicos",
        notification_enabled: bill?.notification_enabled ?? true,
        notification_days_before: bill?.notification_days_before || 0,
        notes: bill?.notes || "",
      });
      const [loading, setLoading] = useState(false);
      const { toast } = useToast();

      const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
          ...prev,
          [name]: type === 'checkbox' ? checked : value,
        }));
      };

      const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
      };

      const handleSwitchChange = (name, checked) => {
        setFormData(prev => ({ ...prev, [name]: checked }));
      };

      const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
          await onSave({ ...formData, amount: Number(formData.amount), due_day: Number(formData.due_day), notification_days_before: Number(formData.notification_days_before) });
          onClose();
        } catch (error) {
          toast({ title: "Erro ao salvar conta", description: error.message, variant: "destructive" });
        } finally {
          setLoading(false);
        }
      };

      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome da Conta</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Valor (R$)</Label>
              <Input id="amount" name="amount" type="number" step="0.01" value={formData.amount} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="due_day">Dia do Vencimento</Label>
              <Input id="due_day" name="due_day" type="number" min="1" max="31" value={formData.due_day} onChange={handleChange} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="payment_type">Tipo de Pagamento</Label>
              <Select name="payment_type" value={formData.payment_type} onValueChange={(value) => handleSelectChange('payment_type', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="boleto">Boleto</SelectItem>
                  <SelectItem value="cartao">Cartão</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="debito">Débito Automático</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="category">Categoria</Label>
              <Select name="category" value={formData.category} onValueChange={(value) => handleSelectChange('category', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="servicos">Serviços (Internet, Streaming)</SelectItem>
                  <SelectItem value="moradia">Moradia (Aluguel, Condomínio)</SelectItem>
                  <SelectItem value="contas">Contas (Água, Luz, Gás)</SelectItem>
                  <SelectItem value="lazer">Lazer (Academia)</SelectItem>
                  <SelectItem value="financeiro">Financeiro (Empréstimo)</SelectItem>
                  <SelectItem value="educacao">Educação</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="notification_enabled" name="notification_enabled" checked={formData.notification_enabled} onCheckedChange={(checked) => handleSwitchChange('notification_enabled', checked)} />
            <Label htmlFor="notification_enabled">Ativar Notificação?</Label>
          </div>
          {formData.notification_enabled && (
            <div>
              <Label htmlFor="notification_days_before">Notificar quantos dias antes? (0 = no dia)</Label>
              <Input id="notification_days_before" name="notification_days_before" type="number" min="0" value={formData.notification_days_before} onChange={handleChange} />
            </div>
          )}
          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancelar</Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>{loading ? "Salvando..." : "Salvar Conta"}</Button>
          </DialogFooter>
        </form>
      );
    };

    function MonthlyBills() {
      const [bills, setBills] = useState([]);
      const [loading, setLoading] = useState(true);
      const [isFormOpen, setIsFormOpen] = useState(false);
      const [editingBill, setEditingBill] = useState(null);
      const { toast } = useToast();

      const fetchBills = useCallback(async () => {
        setLoading(true);
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Usuário não autenticado");

          const { data, error } = await supabase
            .from("monthly_bills")
            .select("*")
            .eq("user_id", user.id)
            .order("due_day", { ascending: true });

          if (error) throw error;
          setBills(data || []);
          scheduleAllNotifications(data || []);
        } catch (error) {
          toast({ title: "Erro ao buscar contas", description: error.message, variant: "destructive" });
        } finally {
          setLoading(false);
        }
      }, [toast]);

      useEffect(() => {
        fetchBills();
      }, [fetchBills]);

      const getNextDueDate = (dueDay) => {
        const today = startOfDay(new Date());
        const currentMonthDue = setDate(today, dueDay);
        
        if (isBefore(currentMonthDue, today)) {
          // If due date this month has passed, schedule for next month
          return setDate(addMonths(today, 1), dueDay);
        } else {
          // Otherwise, schedule for this month
          return currentMonthDue;
        }
      };

      const scheduleSingleNotification = (bill) => {
        if (bill.notification_enabled && "Notification" in window && Notification.permission === "granted") {
          const nextDueDate = getNextDueDate(bill.due_day);
          const notificationDate = subDays(nextDueDate, bill.notification_days_before);
          
          // Ensure notification date is in the future
          if (isBefore(startOfDay(new Date()), notificationDate)) {
             scheduleNotification(
              `Lembrete: ${bill.name}`,
              `Sua conta de R$ ${bill.amount.toFixed(2)} vence ${bill.notification_days_before > 0 ? `em ${bill.notification_days_before} dia(s)` : 'hoje'} (dia ${bill.due_day}).`,
              notificationDate
            );
          }
        }
      };
      
      const scheduleAllNotifications = (currentBills) => {
         if ("Notification" in window && Notification.permission === "granted") {
            currentBills.forEach(scheduleSingleNotification);
         }
      };

      const handleSaveBill = async (formData) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado");

        const billData = { ...formData, user_id: user.id };

        if (editingBill) {
          // Update
          const { error } = await supabase
            .from("monthly_bills")
            .update(billData)
            .eq("id", editingBill.id);
          if (error) throw error;
          toast({ title: "Conta atualizada com sucesso!" });
        } else {
          // Create
          const { error } = await supabase
            .from("monthly_bills")
            .insert(billData);
          if (error) throw error;
          toast({ title: "Conta adicionada com sucesso!" });
        }
        setEditingBill(null);
        fetchBills(); // Refetch to update list and reschedule notifications
      };

      const handleDeleteBill = async (billId) => {
        if (!window.confirm("Tem certeza que deseja excluir esta conta?")) return;
        try {
          const { error } = await supabase
            .from("monthly_bills")
            .delete()
            .eq("id", billId);
          if (error) throw error;
          toast({ title: "Conta excluída com sucesso!", variant: "destructive" });
          fetchBills(); // Refetch to update list
        } catch (error) {
          toast({ title: "Erro ao excluir conta", description: error.message, variant: "destructive" });
        }
      };

      const openEditForm = (bill) => {
        setEditingBill(bill);
        setIsFormOpen(true);
      };

      const openNewForm = () => {
        setEditingBill(null);
        setIsFormOpen(true);
      };

      const closeForm = () => {
        setIsFormOpen(false);
        setEditingBill(null); // Ensure editing state is cleared
      };
      
      const isBillDueSoon = (dueDay) => {
         const today = new Date();
         const nextDueDate = getNextDueDate(dueDay);
         const daysUntilDue = Math.ceil((nextDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
         return daysUntilDue <= 3 && daysUntilDue >= 0; // Due within the next 3 days or today
      };

      const totalFixedExpenses = bills.reduce((sum, bill) => sum + Number(bill.amount), 0);

      return (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Contas Mensais</span>
                 <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={openNewForm} size="sm">
                        <Plus className="mr-2 h-4 w-4" /> Nova Conta
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[480px]">
                      <DialogHeader>
                        <DialogTitle>{editingBill ? "Editar Conta" : "Adicionar Nova Conta"}</DialogTitle>
                      </DialogHeader>
                      <BillForm bill={editingBill} onSave={handleSaveBill} onClose={closeForm} />
                    </DialogContent>
                  </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
               <div className="mb-4 p-4 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-300">Total de Gastos Fixos Mensais</p>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">R$ {totalFixedExpenses.toFixed(2)}</p>
               </div>
              {loading ? (
                <p>Carregando contas...</p>
              ) : bills.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400">Nenhuma conta mensal cadastrada ainda.</p>
              ) : (
                <motion.ul layout className="space-y-3">
                  <AnimatePresence>
                    {bills.map((bill) => (
                      <motion.li
                        key={bill.id}
                        layout
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                           {isBillDueSoon(bill.due_day) && (
                              <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0" title="Vencimento próximo!" />
                           )}
                           <div>
                              <p className="font-medium">{bill.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Valor: R$ {Number(bill.amount).toFixed(2)} | Vencimento: Dia {bill.due_day}
                              </p>
                              <p className="text-xs text-muted-foreground capitalize">
                                {bill.category} - {bill.payment_type}
                              </p>
                           </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {bill.notification_enabled ? (
                            <Bell className="h-4 w-4 text-green-500" title={`Notificação ativa (${bill.notification_days_before} dias antes)`}/>
                          ) : (
                            <BellOff className="h-4 w-4 text-gray-400" title="Notificação desativada"/>
                          )}
                          <Dialog open={editingBill?.id === bill.id && isFormOpen} onOpenChange={(open) => { if (!open) closeForm(); else openEditForm(bill); }}>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => openEditForm(bill)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            {/* DialogContent is rendered outside via Portal, but needs state trigger */}
                          </Dialog>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteBill(bill.id)} className="text-red-500 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </motion.ul>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    export default MonthlyBills;
  