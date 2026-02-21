import { useTranslation } from "react-i18next";
import { Separator } from "../ui/separator.jsx";
import { useEngineConfig } from "../../context/EngineConfigContext.jsx";
import { version as engineVersion } from "../../../package.json";

/* global __COMMIT_HASH__ */

export const Footer = () => {
  const { t } = useTranslation();
  const { appVersion: configVersion } = useEngineConfig();
  const appVersion = configVersion || `v${engineVersion}-${__COMMIT_HASH__}`;

  return (
    <footer className="mt-auto hidden md:block">
      <Separator />
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 text-sm text-muted-foreground">
        <span>{t("footer.builtOn")}</span>
        <span className="font-mono text-xs">{appVersion}</span>
        <span>{t("footer.poweredBy")}</span>
      </div>
    </footer>
  );
};
