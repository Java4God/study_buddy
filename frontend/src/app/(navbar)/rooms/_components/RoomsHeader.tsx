import { Plus } from "lucide-react";
import Button from "@/app/components/button";

type Props = {
  onCreate: () => void;
};

export default function RoomsHeader({ onCreate }: Props) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="mb-2 text-3xl">Study Rooms</h1>
        <p className="text-gray-600">
          Join or create a collaborative study session
        </p>
      </div>
      <Button className="gap-2" onClick={onCreate} variant="primary">
        <Plus className="size-4" />
        Create Room
      </Button>
    </div>
  );
}
