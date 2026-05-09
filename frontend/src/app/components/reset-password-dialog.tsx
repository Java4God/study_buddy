import Button from "./button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialogs";

interface ResetPasswordDialogProps {
  resetDialogOpen: boolean;
  handleResetDialogChange: (open: boolean) => void;
  resetError: string;
  resetMessage: string;
  resetLoading: boolean;
  email: string;
  handleSendResetEmail: () => void;
}
export const ResetPasswordDialog = ({
  resetDialogOpen,
  handleResetDialogChange,
  resetError,
  resetMessage,
  resetLoading,
  email,
  handleSendResetEmail,
}: ResetPasswordDialogProps) => {
  return (
    <Dialog open={resetDialogOpen} onOpenChange={handleResetDialogChange}>
      <DialogTrigger asChild>
        <Button variant="outline">Send password reset email</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send password reset email</DialogTitle>
          <DialogDescription>
            We will send a reset link to {email}.
          </DialogDescription>
        </DialogHeader>

        {resetError && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {resetError}
          </div>
        )}

        {resetMessage && (
          <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
            {resetMessage}
          </div>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={resetLoading}>
              Close
            </Button>
          </DialogClose>
          <Button onClick={handleSendResetEmail} disabled={resetLoading}>
            {resetMessage
              ? "Reset email sent!"
              : resetLoading
                ? "Sending..."
                : "Send reset email"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
