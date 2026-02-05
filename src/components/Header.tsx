import { useEffect, useId, useRef, useState } from "react";
import ThemeToggle from "./ThemeToggle";

interface HeaderProps {
  fileName: string;
  onReset: () => void;
  showControls: boolean;
}

function Header({ fileName, onReset, showControls }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    const handleClickOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-titles">
          <p className="logo">Spinnarr</p>
          <p className="tagline">Spin to pick something at random</p>
        </div>

        <div className="header-menu-container" ref={menuRef}>
          <button
            className={`menu-button ${isMenuOpen ? "is-open" : ""}`}
            type="button"
            onClick={() => {
              setIsMenuOpen((open) => !open);
            }}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            aria-controls={menuId}
            aria-haspopup="menu"
          >
            <div className="icon-container">
              <svg
                className="menu-icon icon-dots"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                width="24"
                height="24"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
              <svg
                className="menu-icon icon-close"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                width="24"
                height="24"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </div>
          </button>

          {isMenuOpen && (
            <div className="menu-dropdown" id={menuId} aria-label="Application menu">
              {showControls && (
                <>
                  <div className="menu-item file-info">
                    <span className="label">File:</span>
                    <span className="value" title={fileName}>
                      {fileName}
                    </span>
                  </div>
                  <div className="menu-item">
                    <button
                      className="menu-action-button"
                      type="button"
                      onClick={() => {
                        onReset();
                        setIsMenuOpen(false);
                      }}
                    >
                      Upload New File
                    </button>
                  </div>
                  <div className="menu-divider"></div>
                </>
              )}
              <div className="menu-item theme-row">
                <span className="label">Theme</span>
                <div className="theme-toggle-wrapper">
                  <ThemeToggle />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
