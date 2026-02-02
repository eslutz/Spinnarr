import { useState, useEffect } from "react";
import Header from "./components/Header";
import FileUpload from "./components/FileUpload";
import Spinner from "./components/Spinner";
import "./styles/App.css";

function App() {
  const [spinners, setSpinners] = useState([]);
  const [currentSpinnerIndex, setCurrentSpinnerIndex] = useState(0);
  const [fileName, setFileName] = useState("");
  const [hasResult, setHasResult] = useState(false);
  const [collectionTitle, setCollectionTitle] = useState("");

  useEffect(() => {
    const defaultFile = import.meta.env.VITE_DEFAULT_SPINNER_FILE;
    if (defaultFile) {
      fetch(defaultFile)
        .then((response) => {
          if (!response.ok) throw new Error("Failed to load default configuration");
          return response.json();
        })
        .then((data) => {
          handleFileLoad(data);
          setFileName("Default Configuration");
        })
        .catch((error) => {
          console.error("Error loading default file:", error);
        });
    }
  }, []);

  const handleFileLoad = (data) => {
    if (data.spinners && Array.isArray(data.spinners)) {
      const isValid = data.spinners.every((spinner) => {
        if (!spinner.name || !spinner.items || !Array.isArray(spinner.items)) {
          return false;
        }
        return spinner.items.every((item) => typeof item === "string");
      });

      if (!isValid) {
        alert('Invalid spinner format. Each spinner must have a "name" and "items" array of strings.');
        return;
      }

      setSpinners(data.spinners);
      setCurrentSpinnerIndex(0);
      setFileName("Uploaded file");
      setHasResult(false);
      setCollectionTitle(data.title || "");
    } else {
      alert('JSON must contain a "spinners" array property. See schema.json for format.');
    }
  };

  const handleReset = () => {
    setSpinners([]);
    setCurrentSpinnerIndex(0);
    setFileName("");
    setHasResult(false);
    setCollectionTitle("");
  };

  const handleNext = () => {
    if (currentSpinnerIndex < spinners.length - 1) {
      setCurrentSpinnerIndex(currentSpinnerIndex + 1);
      setHasResult(false);
    }
  };

  const handlePrevious = () => {
    if (currentSpinnerIndex > 0) {
      setCurrentSpinnerIndex(currentSpinnerIndex - 1);
      setHasResult(false);
    }
  };

  const handleSpinComplete = (result) => {
    setHasResult(true);
  };

  const currentSpinner = spinners[currentSpinnerIndex];

  return (
    <div className="app">
      <Header fileName={fileName} onReset={handleReset} showControls={spinners.length > 0} />
      <main className="main-content">
        {spinners.length === 0 ? (
          <FileUpload onFileLoad={handleFileLoad} />
        ) : (
          <div className="spinner-section">
            {collectionTitle && <h1 className="collection-title">{collectionTitle}</h1>}

            <div className="spinner-wrapper">
              <h2 className="spinner-title">{currentSpinner.name}</h2>
              <Spinner items={currentSpinner.items} onSpinComplete={handleSpinComplete}>
                <div className="navigation-buttons">
                  <button className="nav-button" onClick={handlePrevious} disabled={currentSpinnerIndex === 0}>
                    ← Previous
                  </button>
                  <button
                    className="nav-button"
                    onClick={handleNext}
                    disabled={currentSpinnerIndex === spinners.length - 1 || !hasResult}
                  >
                    Next →
                  </button>
                </div>
              </Spinner>
              <div className="spinner-counter">
                Spinner {currentSpinnerIndex + 1} of {spinners.length}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
