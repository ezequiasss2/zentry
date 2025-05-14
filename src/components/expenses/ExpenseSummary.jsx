
    import React from 'react';

    export function ExpenseSummary({ transactions }) {
      const totalIncome = transactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const totalExpenses = transactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

      const balance = totalIncome - totalExpenses;

      return (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border p-4 text-center bg-card">
            <h3 className="text-sm font-medium text-muted-foreground">Receitas (Mês)</h3>
            <p className="text-xl font-bold text-green-600">
              R$ {totalIncome.toFixed(2)}
            </p>
          </div>
          <div className="rounded-lg border p-4 text-center bg-card">
            <h3 className="text-sm font-medium text-muted-foreground">Despesas (Mês)</h3>
            <p className="text-xl font-bold text-red-600">
              R$ {totalExpenses.toFixed(2)}
            </p>
          </div>
          <div className="rounded-lg border p-4 text-center bg-card">
            <h3 className="text-sm font-medium text-muted-foreground">Saldo (Mês)</h3>
            <p className={`text-xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {balance.toFixed(2)}
            </p>
          </div>
        </div>
      );
    }
  