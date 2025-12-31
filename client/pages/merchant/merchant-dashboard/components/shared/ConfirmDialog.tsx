import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Check } from "lucide-react";
import { ConfirmDialogState } from "../../types";

interface ConfirmDialogProps {
  confirmDialog: ConfirmDialogState;
  setConfirmDialog: (dialog: ConfirmDialogState) => void;
}

export function ConfirmDialog({
  confirmDialog,
  setConfirmDialog,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={confirmDialog.open}
      onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{confirmDialog.title}</DialogTitle>
          <DialogDescription>{confirmDialog.message}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
          >
            <X className="h-4 w-4 ml-2" />
            إلغاء
          </Button>
          <Button
            onClick={() => {
              confirmDialog.onConfirm();
              setConfirmDialog({ ...confirmDialog, open: false });
            }}
          >
            <Check className="h-4 w-4 ml-2" />
            تأكيد
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
