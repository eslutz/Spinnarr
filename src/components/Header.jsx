import ThemeToggle from "./ThemeToggle";

function Header({ fileName, onReset, showControls }) {
  return (
    <header className="header">
      <div className="header-content">
        <h1 className="logo">Spinnarr</h1>
        <p className="tagline">Spin to pick something at random</p>
      </div>
      {showControls && (
        <div className="header-controls">
          <span className="header-file-name">{fileName}</span>
          <button className="header-reset-button" onClick={onReset}>
            Upload New File
          </button>
        </div>
      )}
      <ThemeToggle />
    </header>
  );
}

export default Header;
