import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

interface ConfirmNoProviderDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmNoProviderDialog({
  open,
  onConfirm,
  onCancel
}: ConfirmNoProviderDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) onCancel();
    }}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
            <span>Confirmação Necessária</span>
          </AlertDialogTitle>
          <AlertDialogDescription className="pt-2 text-base">
            Realmente este pedido não possui prestador parceiro?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="my-2 p-4 bg-amber-50 border border-amber-200 rounded-md text-sm">
          <p className="text-amber-800">
            Se confirmar, a venda será concluída sem nenhum prestador associado.
          </p>
          <p className="mt-1 text-amber-800 font-medium">
            Se a venda deveria ter um prestador, clique em Cancelar para voltar e selecionar.
          </p>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-amber-200 hover:bg-amber-50 hover:text-amber-900">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            Confirmar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}