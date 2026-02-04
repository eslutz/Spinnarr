import { useEffect, useState } from "react";
import Header from "./components/Header";
import FileUpload from "./components/FileUpload";
import Spinner from "./components/Spinner";
import type { SpinnerConfig } from "./types";
import { isCollectionConfig } from "./utils/validation";
import "./styles/App.css";

function App() {
  const [spinners, setSpinners] = useState<SpinnerConfig[]>([]);
  const [currentSpinnerIndex, setCurrentSpinnerIndex] = useState(0);
  const [fileName, setFileName] = useState("");
  const [hasResult, setHasResult] = useState(false);
  const [collectionTitle, setCollectionTitle] = useState("");
  const [results, setResults] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);

  function handleFileLoad(data: unknown): boolean {
    if (!isCollectionConfig(data)) {
      alert('JSON must contain a "spinners" array property. See schema.json for format.');
      return false;
    }

    setSpinners(data.spinners);
    setCurrentSpinnerIndex(0);
    setFileName("Uploaded file");
    setHasResult(false);
    setCollectionTitle(data.title ?? "");
    setResults({});
    setShowResults(false);

    return true;
  }

  useEffect(() => {
    const defaultFile = import.meta.env.VITE_DEFAULT_SPINNER_FILE;
    if (defaultFile) {
      fetch(defaultFile)
        .then((response) => {
          if (!response.ok) throw new Error("Failed to load default configuration");
          return response.json() as Promise<unknown>;
        })
        .then((data: unknown) => {
          if (handleFileLoad(data)) {
            setFileName("Default Configuration");
          }
        })
        .catch((error: unknown) => {
          console.error("Error loading default file:", error);
        });
    }
  }, []);

  const handleReset = () => {
    setSpinners([]);
    setCurrentSpinnerIndex(0);
    setFileName("");
    setHasResult(false);
    setCollectionTitle("");
    setResults({});
    setShowResults(false);
  };

  const handleNext = () => {
    if (currentSpinnerIndex === spinners.length - 1) {
      // On last spinner, show results page
      setShowResults(true);
    } else if (currentSpinnerIndex < spinners.length - 1) {
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

  const handleSpinComplete = (result: string) => {
    setHasResult(true);
    setResults((prev) => ({
      ...prev,
      [currentSpinnerIndex]: result,
    }));
  };

  const handleSpinStart = () => {
    setIsSpinning(true);
    setHasResult(false);
  };

  const handleSpinEnd = () => {
    setIsSpinning(false);
  };

  const handleBackToSpinners = () => {
    setShowResults(false);
  };

  const hasSpinners = spinners.length > 0;
  const currentSpinner = hasSpinners ? spinners[currentSpinnerIndex] : undefined;

  return (
    <div className="app">
      <Header fileName={fileName} onReset={handleReset} showControls={hasSpinners} />
      <main className="main-content">
        {!hasSpinners ? (
          <FileUpload onFileLoad={handleFileLoad} />
        ) : showResults ? (
          <div className="results-page">
            <h1 className="results-title">{collectionTitle ?? "Results"}</h1>
            <div className="results-list">
              {spinners.map((spinner, index) => (
                <div key={index} className="result-item">
                  <div className="result-label">{spinner.name}:</div>
                  <div className="result-value">{results[index] ?? "Not spun"}</div>
                </div>
              ))}
            </div>
            <div className="results-actions">
              <button className="nav-button" onClick={handleBackToSpinners}>
                ← Back to Spinners
              </button>
              <button className="nav-button" onClick={handleReset}>
                Start Over
              </button>
            </div>
          </div>
        ) : currentSpinner ? (
          <div className="spinner-section">
            {collectionTitle && <h1 className="collection-title">{collectionTitle}</h1>}

            <div className="spinner-wrapper">
              <h2 className="spinner-title">{currentSpinner.name}</h2>
              <Spinner
                items={currentSpinner.items}
                onSpinComplete={handleSpinComplete}
                onSpinStart={handleSpinStart}
                onSpinEnd={handleSpinEnd}
              >
                <div className="navigation-buttons">
                  <button className="nav-button" onClick={handlePrevious} disabled={currentSpinnerIndex === 0}>
                    ← Previous
                  </button>
                  <button className="nav-button" onClick={handleNext} disabled={!hasResult || isSpinning}>
                    {currentSpinnerIndex === spinners.length - 1 ? "View Results →" : "Next →"}
                  </button>
                </div>
              </Spinner>
              <div className="spinner-counter">
                Spinner {currentSpinnerIndex + 1} of {spinners.length}
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}

export default App;
