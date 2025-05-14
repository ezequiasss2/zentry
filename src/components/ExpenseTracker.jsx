
    import React from 'react';
    import { useTransactions } from '@/hooks/useTransactions';
    import { TransactionForm } from '@/components/expenses/TransactionForm';
    import { TransactionList } from '@/components/expenses/TransactionList';
    import { ExpenseSummary } from '@/components/expenses/ExpenseSummary';
    import { ExpenseChart } from '@/components/expenses/ExpenseChart';

    function ExpenseTracker() {
      const { transactions, loading, addTransaction, deleteTransaction } = useTransactions();

      return (
        <div className="space-y-6">
          <ExpenseSummary transactions={transactions} />
          <TransactionForm onAddTransaction={addTransaction} />
          <ExpenseChart transactions={transactions} />
          <TransactionList
            transactions={transactions}
            loading={loading}
            onDeleteTransaction={deleteTransaction}
          />
        </div>
      );
    }

    export default ExpenseTracker;
  