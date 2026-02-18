import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { BackSekiLink } from "@/components/layout/BackSekiLink.jsx";
import { fadeInUp, staggerDelay } from "@/lib/motion.js";

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <motion.h1 className="font-serif text-3xl font-bold" {...fadeInUp}>
        {t("app.name")}
      </motion.h1>
      <motion.p
        className="text-muted-foreground"
        {...fadeInUp}
        transition={{ ...fadeInUp.transition, ...staggerDelay(1) }}
      >
        {t("app.tagline")}
      </motion.p>
      <motion.p
        className="text-sm text-muted-foreground max-w-md text-center"
        {...fadeInUp}
        transition={{ ...fadeInUp.transition, ...staggerDelay(2) }}
      >
        {t("home.placeholder")}
      </motion.p>
      <motion.div {...fadeInUp} transition={{ ...fadeInUp.transition, ...staggerDelay(3) }}>
        <BackSekiLink />
      </motion.div>
    </div>
  );
}
