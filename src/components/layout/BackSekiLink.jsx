import { useTranslation } from "react-i18next";
import { ExternalLink } from "lucide-react";
import sdk from "@farcaster/miniapp-sdk";
import { Button } from "../ui/button.jsx";
import { useMiniAppContext } from "../../hooks/useMiniAppContext.js";

const HUNT_TOWN_URL = "https://hunt.town/project/SEKI";

export function BackSekiLink() {
  const { t } = useTranslation();
  const { isInMiniApp } = useMiniAppContext();

  function handleClick(e) {
    if (isInMiniApp) {
      e.preventDefault();
      sdk.actions.openUrl(HUNT_TOWN_URL);
    }
  }

  return (
    <Button variant="secondary" size="sm" asChild>
      <a
        href={HUNT_TOWN_URL}
        target={isInMiniApp ? undefined : "_blank"}
        rel="noopener noreferrer"
        onClick={handleClick}
      >
        {t("hunt.backSeki")}
        <ExternalLink className="size-3.5" />
      </a>
    </Button>
  );
}
