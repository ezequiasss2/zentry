
    import React, { useState } from 'react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
    import { Calendar } from '@/components/ui/calendar';
    import { Plus, Calendar as CalendarIcon } from 'lucide-react';
    import { format } from 'date-fns';
    import { cn } from '@/lib/utils';

    export function TransactionForm({ onAddTransaction }) {
      const [description, setDescription] = useState('');
      const [amount, setAmount] = useState('');
      const [type, setType] = useState('expense');
      const [category, setCategory] = useState('alimentacao');
      const [transactionDate, setTransactionDate] = useState(new Date());
      const [isCalendarOpen, setIsCalendarOpen] = useState(false);

      const handleSubmit = async (e) => {
        e.preventDefault();
        if (!description.trim() || !amount || !transactionDate) return;

        const success = await onAddTransaction({
          description,
          amount: type === 'expense' ? -Number(amount) : Number(amount),
          category,
          date: transactionDate.toISOString(),
        });

        if (success) {
          setDescription('');
          setAmount('');
          setTransactionDate(new Date());
          // Optionally reset type/category
        }
      };

       const handleDateSelect = (date) => {
         setTransactionDate(date);
         setIsCalendarOpen(false); // Close calendar on selection
      }

      return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-card">
          <h3 className="text-lg font-medium mb-4">Nova Transação</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Almoço, Salário"
                required
              />
            </div>
            <div>
              <Label htmlFor="amount">Valor</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                required
              />
            </div>
            <div>
              <Label htmlFor="transactionDate">Data</Label>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !transactionDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {transactionDate ? format(transactionDate, 'dd/MM/yyyy') : <span>Escolha data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={transactionDate}
                    onSelect={handleDateSelect}
                    initialFocus
                    required
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="type">Tipo</Label>
              <Select value={type} onValueChange={setType} required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Despesa</SelectItem>
                  <SelectItem value="income">Receita</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="lg:col-span-2">
              <Label htmlFor="category">Categoria</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alimentacao">Alimentação</SelectItem>
                  <SelectItem value="transporte">Transporte</SelectItem>
                  <SelectItem value="moradia">Moradia</SelectItem>
                  <SelectItem value="lazer">Lazer</SelectItem>
                  <SelectItem value="salario">Salário</SelectItem>
                  <SelectItem value="investimentos">Investimentos</SelectItem>
                  <SelectItem value="saude">Saúde</SelectItem>
                  <SelectItem value="educacao">Educação</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" className="w-full md:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Adicionar Transação
          </Button>
        </form>
      );
    }
  