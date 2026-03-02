import sdk from "@farcaster/miniapp-sdk";
import { useMiniAppContext } from "../../hooks/useMiniAppContext.js";

const isAndroid = typeof navigator !== "undefined" && /android/i.test(navigator.userAgent);

export function MiniAppLink({ href, children, ...props }) {
  const { isInMiniApp } = useMiniAppContext();

  // Android Farcaster opens target="_blank" in the system browser.
  // Use sdk.actions.openUrl to keep navigation in-app.
  // iOS handles links correctly without interception — openUrl opens Safari.
  function handleClick(e) {
    if (isInMiniApp && isAndroid) {
      e.preventDefault();
      sdk.actions.openUrl(href);
    }
  }

  return (
    <a
      href={href}
      target={isInMiniApp ? undefined : "_blank"}
      rel="noopener noreferrer"
      onClick={handleClick}
      {...props}
    >
      {children}
    </a>
  );
}
