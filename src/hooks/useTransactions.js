
    import { useState, useEffect, useCallback } from 'react';
    import { supabase } from '@/lib/supabase';
    import { useToast } from '@/components/ui/use-toast';
    import { startOfMonth, endOfMonth, formatISO } from 'date-fns';

    export function useTransactions() {
      const [transactions, setTransactions] = useState([]);
      const [loading, setLoading] = useState(true);
      const { toast } = useToast();

      // Can be extended to accept date range later
      const fetchTransactions = useCallback(async () => {
        setLoading(true);
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('Usuário não autenticado');

          const start = startOfMonth(new Date());
          const end = endOfMonth(new Date());

          const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user.id)
            .gte('date', formatISO(start))
            .lte('date', formatISO(end))
            .order('date', { ascending: false });

          if (error) throw error;
          setTransactions(data || []);
        } catch (error) {
          toast({ title: 'Erro ao buscar transações', description: error.message, variant: 'destructive' });
        } finally {
          setLoading(false);
        }
      }, [toast]);

      useEffect(() => {
        fetchTransactions();
      }, [fetchTransactions]);

      const addTransaction = async (transactionData) => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('Usuário não autenticado');

          const fullData = { ...transactionData, user_id: user.id };

          const { error } = await supabase
            .from('transactions')
            .insert(fullData);

          if (error) throw error;

          fetchTransactions(); // Refetch after adding
          toast({ title: 'Transação registrada', description: 'Sua transação foi adicionada com sucesso!' });
          return true; // Indicate success
        } catch (error) {
          toast({ title: 'Erro ao adicionar transação', description: error.message, variant: 'destructive' });
          return false; // Indicate failure
        }
      };

      const deleteTransaction = async (transactionId) => {
        if (!window.confirm('Tem certeza que deseja excluir esta transação?')) return;
        try {
          const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', transactionId);

          if (error) throw error;

          setTransactions(prev => prev.filter((t) => t.id !== transactionId));
          toast({ title: 'Transação removida', description: 'A transação foi removida com sucesso.', variant: 'destructive' });
        } catch (error) {
          toast({ title: 'Erro ao remover transação', description: error.message, variant: 'destructive' });
        }
      };

      return { transactions, loading, addTransaction, deleteTransaction, fetchTransactions };
    }
  