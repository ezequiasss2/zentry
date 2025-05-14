
    import React from 'react';
    import { Button } from '@/components/ui/button';
    import { Trash2 } from 'lucide-react';
    import { format, parseISO } from 'date-fns';

    export function TransactionList({ transactions, onDeleteTransaction, loading }) {
      if (loading) {
        return <p>Carregando...</p>;
      }

      if (transactions.length === 0) {
        return <p className="text-muted-foreground text-center">Nenhuma transação neste mês.</p>;
      }

      return (
        <div className="space-y-3 mt-6">
          <h3 className="text-lg font-medium">Transações Recentes</h3>
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between rounded-lg border p-3 bg-card"
            >
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className={`h-2 w-2 rounded-full flex-shrink-0 ${transaction.amount >= 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <div className="overflow-hidden">
                  <p className="font-medium truncate">{transaction.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(parseISO(transaction.date), 'dd/MM/yyyy')} •{' '}
                    <span className="capitalize">{transaction.category}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                <span
                  className={`font-medium text-sm ${
                    transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {transaction.amount >= 0 ? '+' : '-'} R$ {Math.abs(transaction.amount).toFixed(2)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteTransaction(transaction.id)}
                  className="text-red-500 hover:text-red-700 h-8 w-8"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      );
    }
  