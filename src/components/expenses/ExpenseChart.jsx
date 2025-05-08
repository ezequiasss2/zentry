
    import React from 'react';
    import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
    import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

    export function ExpenseChart({ transactions }) {
      const getChartData = () => {
        const start = startOfMonth(new Date());
        const end = endOfMonth(new Date());
        const daysInMonth = eachDayOfInterval({ start, end });

        const dailyTotals = daysInMonth.reduce((acc, day) => {
          acc[format(day, 'dd/MM')] = { income: 0, expense: 0 };
          return acc;
        }, {});

        transactions.forEach(transaction => {
          const dateStr = format(parseISO(transaction.date), 'dd/MM');
          if (dailyTotals[dateStr]) {
            if (transaction.amount > 0) {
              dailyTotals[dateStr].income += Number(transaction.amount);
            } else {
              dailyTotals[dateStr].expense += Math.abs(Number(transaction.amount));
            }
          }
        });

        return Object.entries(dailyTotals).map(([date, amounts]) => ({
          date,
          Receita: amounts.income,
          Despesa: amounts.expense,
        })).sort((a, b) => a.date.localeCompare(b.date, undefined, { numeric: true }));
      };

      const chartData = getChartData();

      return (
        <div className="h-72 w-full mt-6">
          <h3 className="text-lg font-medium mb-4 text-center">Visão Geral do Mês</h3>
          <ResponsiveContainer>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip formatter={(value) => `R$ ${Number(value).toFixed(2)}`} />
              <Legend />
              <Line type="monotone" dataKey="Receita" stroke="#16a34a" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Despesa" stroke="#dc2626" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      );
    }
  