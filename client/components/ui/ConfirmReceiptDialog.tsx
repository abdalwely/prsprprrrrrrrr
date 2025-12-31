import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmReceiptDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  loading?: boolean;
  title?: string;
  description?: string;
}

export const ConfirmReceiptDialog: React.FC<ConfirmReceiptDialogProps> = ({
  open,
  onClose,
  onConfirm,
  loading = false,
  title = "تأكيد استلام الطلب",
  description = "هل أنت متأكد أنك استلمت هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.",
}) => {
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-right">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <div className="flex gap-2 w-full justify-end">
            <Button variant="outline" onClick={onClose} size="sm">
              لا
            </Button>
            <Button
              size="sm"
              variant="default"
              onClick={() => {
                void onConfirm();
              }}
              disabled={loading}
            >
              {loading ? "جارٍ..." : "نعم، استلمت"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmReceiptDialog;
