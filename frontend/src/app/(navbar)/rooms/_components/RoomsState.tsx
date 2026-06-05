import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/app/components/card";

type Props = {
  error: string;
  loading: boolean;
  isEmpty: boolean;
};

export default function RoomsState({ error, loading, isEmpty }: Props) {
  return (
    <>
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}
      {loading && (
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 px-4 py-6 text-slate-600">
          <Loader2 className="size-5 animate-spin text-indigo-600" />
          Loading rooms...
        </div>
      )}
      {!loading && isEmpty && (
        <Card className="border border-dashed border-slate-300 bg-white/70">
          <CardContent className="px-6 py-10 text-center text-slate-600">
            No public rooms yet. Create the first one.
          </CardContent>
        </Card>
      )}
    </>
  );
}
