import Button from "./button";
import Input from "./input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./dialogs";

type Props = {
  open: boolean;
  name: string;
  subject: string;
  nameError?: string;
  subjectError?: string;
  onNameChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export default function CreateRoomModal({
  open,
  name,
  subject,
  nameError,
  subjectError,
  onNameChange,
  onSubjectChange,
  onClose,
  onSubmit,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Study Room</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <Input
            label="Room Name *"
            placeholder="e.g., Physics Study Group"
            value={name}
            setValue={onNameChange}
            error={nameError}
          />
          <Input
            label="Subject *"
            placeholder="e.g., Quantum Mechanics"
            value={subject}
            setValue={onSubjectChange}
            error={subjectError}
          />
          <div className="flex gap-3 pt-2">
            <Button className="flex-1" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={onSubmit}>
              Create Room
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
