import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MiniAppLink } from "../miniapp-link.jsx";

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
    mockUseMiniAppContext.mockReturnValue({ isInMiniApp: false });
  });

  it("renders <a> with target=_blank outside MiniApp", () => {
    render(<MiniAppLink href="https://example.com">Click me</MiniAppLink>);
    const link = screen.getByRole("link", { name: "Click me" });
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders <a> without target attribute inside MiniApp", () => {
    mockUseMiniAppContext.mockReturnValue({ isInMiniApp: true });
    render(<MiniAppLink href="https://example.com">Click me</MiniAppLink>);
    const link = screen.getByRole("link", { name: "Click me" });
    expect(link).not.toHaveAttribute("target");
  });

  it("calls sdk.actions.openUrl and preventDefault inside MiniApp", () => {
    mockUseMiniAppContext.mockReturnValue({ isInMiniApp: true });
    render(<MiniAppLink href="https://example.com">Click me</MiniAppLink>);
    const link = screen.getByRole("link", { name: "Click me" });
    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    const preventDefaultSpy = vi.spyOn(event, "preventDefault");
    fireEvent(link, event);
    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(mockOpenUrl).toHaveBeenCalledWith("https://example.com");
  });

  it("does NOT call sdk.actions.openUrl outside MiniApp", () => {
    render(<MiniAppLink href="https://example.com">Click me</MiniAppLink>);
    const link = screen.getByRole("link", { name: "Click me" });
    fireEvent.click(link);
    expect(mockOpenUrl).not.toHaveBeenCalled();
  });

  it("forwards children and extra props", () => {
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
