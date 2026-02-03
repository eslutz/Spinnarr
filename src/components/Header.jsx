import { useState, useRef, useEffect } from "react";
import ThemeToggle from "./ThemeToggle";

function Header({ fileName, onReset, showControls }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-titles">
          <h1 className="logo">Spinnarr</h1>
          <p className="tagline">Spin to pick something at random</p>
        </div>

        <div className="header-menu-container" ref={menuRef}>
          <button
            className={`menu-button ${isMenuOpen ? "is-open" : ""}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            <div className="icon-container">
              <svg
                className="menu-icon icon-dots"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                width="24"
                height="24"
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
              >
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </div>
          </button>

          {isMenuOpen && (
            <div className="menu-dropdown">
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
