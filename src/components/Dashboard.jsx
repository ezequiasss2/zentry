
    import React, { useEffect, useState } from "react";
    import { Card } from "@/components/ui/card";
    import { Calendar as CalendarIcon, DollarSign, ListTodo, TrendingUp, AlertCircle } from "lucide-react";
    import { motion } from "framer-motion";
    import { useTasks } from "@/hooks/useTasks";
    import { useTransactions } from "@/hooks/useTransactions";
    import { useHabits } from "@/hooks/useHabits";
    import { isToday, parseISO, isFuture } from 'date-fns';
    import { TaskList } from "@/components/tasks/TaskList"; // Reusing TaskList for upcoming tasks
    import { TransactionList } from "@/components/expenses/TransactionList"; // Reusing TransactionList

    function Dashboard() {
      const { tasks, loading: tasksLoading, deleteTask: deleteTaskHook, toggleTask: toggleTaskHook } = useTasks();
      const { transactions, loading: transactionsLoading, deleteTransaction: deleteTransactionHook } = useTransactions();
      const { habits, loading: habitsLoading, calculateStreak, isCompletedToday } = useHabits();
      const [tasksTodayCount, setTasksTodayCount] = useState(0);
      const [monthlyExpenses, setMonthlyExpenses] = useState(0);
      // Savings calculation is complex, replacing with Balance for simplicity
      const [monthlyBalance, setMonthlyBalance] = useState(0);
      const [habitsCompletedToday, setHabitsCompletedToday] = useState(0);
      const [upcomingTasks, setUpcomingTasks] = useState([]);
      const [recentTransactions, setRecentTransactions] = useState([]);

      useEffect(() => {
        // Process Tasks
        const todayTasks = tasks.filter(task => !task.completed && task.due_date && isToday(parseISO(task.due_date)));
        setTasksTodayCount(todayTasks.length);

        const futureTasks = tasks
          .filter(task => !task.completed && task.due_date && isFuture(parseISO(task.due_date)))
          .sort((a, b) => parseISO(a.due_date) - parseISO(b.due_date))
          .slice(0, 5); // Limit to 5 upcoming tasks
        setUpcomingTasks(futureTasks);

      }, [tasks]);

      useEffect(() => {
        // Process Transactions (assuming they are for the current month from the hook)
        const expenses = transactions
          .filter(t => t.amount < 0)
          .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);
        setMonthlyExpenses(expenses);

        const balance = transactions.reduce((acc, curr) => acc + Number(curr.amount), 0);
        setMonthlyBalance(balance);

         const recent = transactions.slice(0, 5); // Already sorted by date descending in hook
         setRecentTransactions(recent);

      }, [transactions]);

      useEffect(() => {
        // Process Habits
        const completedCount = habits.filter(habit => isCompletedToday(habit.id)).length;
        setHabitsCompletedToday(completedCount);
      }, [habits, isCompletedToday]); // Dependency on isCompletedToday from hook

      const loading = tasksLoading || transactionsLoading || habitsLoading;

      const container = {
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: { staggerChildren: 0.1 }
        }
      };

      const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
      };

      const formatCurrency = (value) => `R$ ${value.toFixed(2)}`;

      return (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {/* Summary Cards */}
          <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
            <motion.div variants={item}>
              <Card className="p-4 sm:p-6 bg-gradient-to-br from-red-500 to-pink-500 text-white overflow-hidden">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <CalendarIcon className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium truncate">Tarefas Hoje</p>
                    <h3 className="text-lg sm:text-2xl font-bold">{loading ? '...' : tasksTodayCount}</h3>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="p-4 sm:p-6 bg-gradient-to-br from-purple-500 to-indigo-500 text-white overflow-hidden">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium truncate">Gastos (Mês)</p>
                    <h3 className="text-lg sm:text-2xl font-bold">{loading ? '...' : formatCurrency(monthlyExpenses)}</h3>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="p-4 sm:p-6 bg-gradient-to-br from-green-500 to-emerald-500 text-white overflow-hidden">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium truncate">Saldo (Mês)</p>
                    <h3 className={`text-lg sm:text-2xl font-bold ${monthlyBalance >= 0 ? '' : 'text-red-200'}`}>{loading ? '...' : formatCurrency(monthlyBalance)}</h3>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="p-4 sm:p-6 bg-gradient-to-br from-blue-500 to-cyan-500 text-white overflow-hidden">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <ListTodo className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium truncate">Hábitos (Hoje)</p>
                    <h3 className="text-lg sm:text-2xl font-bold">{loading ? '...' : `${habitsCompletedToday}/${habits.length}`}</h3>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Upcoming Tasks and Recent Expenses */}
          <div className="grid gap-6 md:grid-cols-2">
            <motion.div variants={item}>
              <Card className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold mb-4">Próximas Tarefas</h3>
                {loading ? (
                   <p>Carregando...</p>
                ) : upcomingTasks.length > 0 ? (
                  // Using TaskList component - Note: delete/toggle might not be ideal here, but shows data
                  <TaskList
                     tasks={upcomingTasks}
                     onToggleTask={toggleTaskHook}
                     onDeleteTask={deleteTaskHook}
                     loading={false} // Already handled above
                  />
                ) : (
                   <div className="flex items-center justify-center text-muted-foreground p-4">
                      <AlertCircle className="h-5 w-5 mr-2" />
                      <span>Nenhuma tarefa futura encontrada.</span>
                   </div>
                )}
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold mb-4">Últimos Gastos</h3>
                 {loading ? (
                   <p>Carregando...</p>
                ) : recentTransactions.length > 0 ? (
                   // Using TransactionList component
                   <TransactionList
                      transactions={recentTransactions}
                      onDeleteTransaction={deleteTransactionHook}
                      loading={false} // Already handled above
                   />
                 ) : (
                   <div className="flex items-center justify-center text-muted-foreground p-4">
                      <AlertCircle className="h-5 w-5 mr-2" />
                      <span>Nenhum gasto registrado recentemente.</span>
                   </div>
                 )}
              </Card>
            </motion.div>
          </div>
        </motion.div>
      );
    }

    export default Dashboard;
  