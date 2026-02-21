import { useTranslate } from "@/contexts/TranslateContext";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface Props {
  show: boolean;
}

export default function ExpertBooking({ show }: Props) {
  const { t } = useTranslate();

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-accent/10 border border-accent/20 p-5"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/20">
          <Heart className="h-5 w-5 text-accent" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">{t("We're here for you")}</h3>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
            {t(
              "It looks like things have been tough lately. Speaking with a counsellor can make a real difference."
            )}
          </p>
          <Button className="mt-3 rounded-xl" size="sm">
            {t("Talk to a counsellor")}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
