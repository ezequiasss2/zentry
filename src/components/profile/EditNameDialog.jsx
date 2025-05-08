
    import React, { useState, useEffect } from 'react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
    import { User } from 'lucide-react';

    export function EditNameDialog({ currentName, onSave, loading }) {
      const [isOpen, setIsOpen] = useState(false);
      const [newName, setNewName] = useState(currentName);

      useEffect(() => {
        setNewName(currentName); // Sync when dialog opens or currentName changes
      }, [currentName, isOpen]);

      const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await onSave(newName);
        if (success) {
          setIsOpen(false);
        }
      };

      return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline"><User className="mr-2 h-4 w-4" /> Editar Nome</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Nome</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="newName">Novo Nome</Label>
                <Input id="newName" value={newName} onChange={(e) => setNewName(e.target.value)} required />
              </div>
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="outline">Cancelar</Button></DialogClose>
                <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      );
    }
  