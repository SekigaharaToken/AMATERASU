import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const mockOpenUrl = vi.fn();
const mockUseMiniAppContext = vi.fn(() => ({
  isInMiniApp: false,
}));

vi.mock("@farcaster/miniapp-sdk", () => ({
  default: {
    actions: { openUrl: (...args) => mockOpenUrl(...args) },
  },
}));

vi.mock("../../../hooks/useMiniAppContext.js", () => ({
  useMiniAppContext: (...args) => mockUseMiniAppContext(...args),
}));

describe("MiniAppLink", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mockUseMiniAppContext.mockReturnValue({ isInMiniApp: false });
  });

  it("renders <a> with target=_blank outside MiniApp", async () => {
    const { MiniAppLink } = await import("../miniapp-link.jsx");
    render(<MiniAppLink href="https://example.com">Click me</MiniAppLink>);
    const link = screen.getByRole("link", { name: "Click me" });
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders <a> without target attribute inside MiniApp", async () => {
    mockUseMiniAppContext.mockReturnValue({ isInMiniApp: true });
    const { MiniAppLink } = await import("../miniapp-link.jsx");
    render(<MiniAppLink href="https://example.com">Click me</MiniAppLink>);
    const link = screen.getByRole("link", { name: "Click me" });
    expect(link).not.toHaveAttribute("target");
  });

  it("does NOT call sdk.actions.openUrl on iOS MiniApp (lets webview handle it)", async () => {
    mockUseMiniAppContext.mockReturnValue({ isInMiniApp: true });
    // jsdom UA is not Android → simulates iOS
    const { MiniAppLink } = await import("../miniapp-link.jsx");
    render(<MiniAppLink href="https://example.com">Click me</MiniAppLink>);
    const link = screen.getByRole("link", { name: "Click me" });
    fireEvent.click(link);
    expect(mockOpenUrl).not.toHaveBeenCalled();
  });

  it("calls sdk.actions.openUrl on Android MiniApp", async () => {
    mockUseMiniAppContext.mockReturnValue({ isInMiniApp: true });
    vi.stubGlobal("navigator", {
      ...navigator,
      userAgent: "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36",
    });
    const { MiniAppLink } = await import("../miniapp-link.jsx");
    render(<MiniAppLink href="https://example.com">Click me</MiniAppLink>);
    const link = screen.getByRole("link", { name: "Click me" });
    fireEvent.click(link);
    expect(mockOpenUrl).toHaveBeenCalledWith("https://example.com");
    vi.unstubAllGlobals();
  });

  it("does NOT call sdk.actions.openUrl outside MiniApp", async () => {
    const { MiniAppLink } = await import("../miniapp-link.jsx");
    render(<MiniAppLink href="https://example.com">Click me</MiniAppLink>);
    const link = screen.getByRole("link", { name: "Click me" });
    fireEvent.click(link);
    expect(mockOpenUrl).not.toHaveBeenCalled();
  });

  it("forwards children and extra props", async () => {
    const { MiniAppLink } = await import("../miniapp-link.jsx");
    render(
      <MiniAppLink href="https://example.com" className="custom" data-testid="my-link">
        <span>child</span>
      </MiniAppLink>,
    );
    const link = screen.getByTestId("my-link");
    expect(link).toHaveClass("custom");
    expect(link).toHaveTextContent("child");
  });
});
