import { useTranslate } from "@/contexts/TranslateContext";
import { ConsumptionLog } from "@/types";
import { format } from "date-fns";
import { Trash2, Download, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface Props {
  logs: ConsumptionLog[];
  onDelete: (id: number) => void;
}

export default function HistorySheet({ logs, onDelete }: Props) {
  const { t } = useTranslate();

  function exportCSV() {
    const header = "Date,Time,Count\n";
    const rows = logs
      .map((l) => {
        const d = new Date(l.timestamp);
        return `${format(d, "yyyy-MM-dd")},${format(d, "HH:mm")},${l.count}`;
      })
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cigarette-history.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="w-full rounded-xl gap-2">
          <History className="h-4 w-4" />
          {t("View History")}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl">
        <SheetHeader className="flex-row items-center justify-between">
          <SheetTitle>{t("History")}</SheetTitle>
          <Button variant="ghost" size="sm" onClick={exportCSV} className="gap-1.5">
            <Download className="h-4 w-4" />
            {t("Export")}
          </Button>
        </SheetHeader>

        <div className="mt-4 space-y-1 overflow-y-auto max-h-[calc(80vh-100px)]">
          {logs.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">{t("No entries yet")}</p>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between rounded-xl px-3 py-3 hover:bg-muted/50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium">
                    {format(new Date(log.timestamp), "MMM d, yyyy")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(log.timestamp), "h:mm a")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">×{log.count}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => log.id && onDelete(log.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
