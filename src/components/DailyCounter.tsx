import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslate } from "@/contexts/TranslateContext";
import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";

const MESSAGES = [
  "That's 11 minutes of life affected",
  "Your body notices every one",
  "Each one adds up — awareness is power",
  "11 minutes closer to a better choice",
  "Take a deep breath. You've got this.",
  "Awareness is the first step to change",
];

interface Props {
  count: number;
  onAdd: () => void;
  onRemove: () => void;
}

export default function DailyCounter({ count, onAdd, onRemove }: Props) {
  const { t } = useTranslate();
  const [message, setMessage] = useState<string | null>(null);
  const [msgKey, setMsgKey] = useState(0);

  function handleAdd() {
    onAdd();
    const msg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
    setMessage(msg);
    setMsgKey((k) => k + 1);
  }

  return (
    <div className="hero-gradient rounded-3xl p-6 pb-8 text-primary-foreground">
      <p className="text-sm font-medium opacity-80">{t("Today's Count")}</p>

      <div className="my-6 flex items-center justify-center gap-6">
        <Button
          variant="ghost"
          onClick={onRemove}
          disabled={count === 0}
          className="h-14 w-14 rounded-full border-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground disabled:opacity-30"
        >
          <Minus className="h-6 w-6" />
        </Button>

        <AnimatePresence mode="popLayout">
          <motion.span
            key={count}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.4, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="min-w-[80px] text-center text-7xl font-extrabold tabular-nums"
          >
            {count}
          </motion.span>
        </AnimatePresence>

        <Button
          variant="ghost"
          onClick={handleAdd}
          className="h-14 w-14 rounded-full border-2 border-primary-foreground/30 bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/25 hover:text-primary-foreground"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {message && (
          <motion.p
            key={msgKey}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="text-center text-sm font-medium opacity-80"
          >
            {t(message)}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
