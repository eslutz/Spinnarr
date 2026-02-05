import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Header from "./components/Header";
import FileUpload from "./components/FileUpload";
import Spinner from "./components/Spinner";
import type { SpinnerConfig } from "./types";
import { isCollectionConfig } from "./utils/validation";
import "./styles/App.css";

const DEFAULT_FILE_LABEL = "Default Configuration";
const UPLOAD_FILE_LABEL = "Uploaded file";

interface HistoryState {
  spinnerIndex: number;
  showResults: boolean;
}

function App() {
  const [spinners, setSpinners] = useState<SpinnerConfig[]>([]);
  const [currentSpinnerIndex, setCurrentSpinnerIndex] = useState(0);
  const [fileName, setFileName] = useState("");
  const [hasResult, setHasResult] = useState(false);
  const [collectionTitle, setCollectionTitle] = useState("");
  const [results, setResults] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [muted, setMuted] = useState(true);
  const isRestoringFromHistory = useRef(false);

  const pushHistoryState = useCallback((spinnerIndex: number, showResultsPage: boolean) => {
    const state: HistoryState = {
      spinnerIndex,
      showResults: showResultsPage,
    };
    const url = new URL(window.location.href);
    if (showResultsPage) {
      url.searchParams.set("view", "results");
      url.searchParams.delete("spinner");
    } else {
      url.searchParams.set("spinner", String(spinnerIndex + 1));
      url.searchParams.delete("view");
    }
    window.history.pushState(state, "", url);
  }, []);

  const resetCollection = useCallback(() => {
    setSpinners([]);
    setCurrentSpinnerIndex(0);
    setFileName("");
    setHasResult(false);
    setCollectionTitle("");
    setResults({});
    setShowResults(false);
    setIsSpinning(false);
    setMuted(true);
    const url = new URL(window.location.href);
    url.searchParams.delete("spinner");
    url.searchParams.delete("view");
    window.history.pushState(null, "", url);
  }, []);

  const handleFileLoad = useCallback((data: unknown, sourceFileName: string = UPLOAD_FILE_LABEL): boolean => {
    if (!isCollectionConfig(data)) {
      alert('JSON must include a non-empty "spinners" array with non-empty names/items. See schema.json for format.');
      return false;
    }

    setSpinners(data.spinners);
    setCurrentSpinnerIndex(0);
    setFileName(sourceFileName || UPLOAD_FILE_LABEL);
    setHasResult(false);
    setCollectionTitle(data.title ?? "");
    setResults({});
    setShowResults(false);
    setIsSpinning(false);

    return true;
  }, []);

  useEffect(() => {
    const defaultFile = import.meta.env.VITE_DEFAULT_SPINNER_FILE;
    if (!defaultFile) {
      return;
    }

    const abortController = new AbortController();

    const loadDefaultFile = async () => {
      try {
        const response = await fetch(defaultFile, { signal: abortController.signal });
        if (!response.ok) {
          throw new Error("Failed to load default configuration");
        }

        const data = (await response.json()) as unknown;
        handleFileLoad(data, DEFAULT_FILE_LABEL);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        console.error("Error loading default file:", error);
      }
    };

    void loadDefaultFile();

    return () => {
      abortController.abort();
    };
  }, [handleFileLoad]);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state as HistoryState | null;

      if (!state) {
        return;
      }

      isRestoringFromHistory.current = true;

      if (state.showResults) {
        setShowResults(true);
      } else {
        setShowResults(false);
        setCurrentSpinnerIndex(state.spinnerIndex);
        setHasResult(results[state.spinnerIndex] !== undefined);
      }

      isRestoringFromHistory.current = false;
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [results]);

  useEffect(() => {
    if (spinners.length === 0 || isRestoringFromHistory.current) {
      return;
    }

    const url = new URL(window.location.href);
    const spinnerParam = url.searchParams.get("spinner");
    const viewParam = url.searchParams.get("view");

    if (viewParam === "results") {
      setShowResults(true);
      const state: HistoryState = {
        spinnerIndex: currentSpinnerIndex,
        showResults: true,
      };
      window.history.replaceState(state, "", url);
    } else if (spinnerParam !== null) {
      const index = parseInt(spinnerParam, 10) - 1;
      if (!isNaN(index) && index >= 0 && index < spinners.length) {
        setCurrentSpinnerIndex(index);
        const state: HistoryState = {
          spinnerIndex: index,
          showResults: false,
        };
        window.history.replaceState(state, "", url);
      }
    } else {
      const state: HistoryState = {
        spinnerIndex: 0,
        showResults: false,
      };
      url.searchParams.set("spinner", "1");
      window.history.replaceState(state, "", url);
    }
  }, [spinners.length, currentSpinnerIndex]);

  const handleNext = useCallback(() => {
    if (currentSpinnerIndex === spinners.length - 1) {
      setShowResults(true);
      pushHistoryState(currentSpinnerIndex, true);
    } else if (currentSpinnerIndex < spinners.length - 1) {
      const newIndex = currentSpinnerIndex + 1;
      setCurrentSpinnerIndex(newIndex);
      setHasResult(false);
      pushHistoryState(newIndex, false);
    }
  }, [currentSpinnerIndex, spinners.length, pushHistoryState]);

  const handlePrevious = useCallback(() => {
    if (currentSpinnerIndex > 0) {
      const newIndex = currentSpinnerIndex - 1;
      setCurrentSpinnerIndex(newIndex);
      setHasResult(false);
      pushHistoryState(newIndex, false);
    }
  }, [currentSpinnerIndex, pushHistoryState]);

  const handleSpinComplete = useCallback(
    (result: string) => {
      setHasResult(true);
      setResults((prev) => ({
        ...prev,
        [currentSpinnerIndex]: result,
      }));
    },
    [currentSpinnerIndex],
  );

  const handleSpinStart = useCallback(() => {
    setIsSpinning(true);
    setHasResult(false);
  }, []);

  const handleSpinEnd = useCallback(() => {
    setIsSpinning(false);
  }, []);

  const handleBackToSpinners = useCallback(() => {
    setShowResults(false);
    pushHistoryState(currentSpinnerIndex, false);
  }, [currentSpinnerIndex, pushHistoryState]);

  const hasSpinners = spinners.length > 0;
  const currentSpinner = useMemo(
    () => (hasSpinners ? spinners[currentSpinnerIndex] : undefined),
    [currentSpinnerIndex, hasSpinners, spinners],
  );

  return (
    <div className="app">
      <Header fileName={fileName} onReset={resetCollection} showControls={hasSpinners} />
      <main className="main-content">
        {!hasSpinners ? (
          <FileUpload onFileLoad={handleFileLoad} />
        ) : showResults ? (
          <div className="results-page">
            <h1 className="results-title">{collectionTitle || "Results"}</h1>
            <dl className="results-list">
              {spinners.map((spinner, index) => (
                <div key={index} className="result-item">
                  <dt className="result-label">{spinner.name}</dt>
                  <dd className="result-value">{results[index] ?? "Not spun"}</dd>
                </div>
              ))}
            </dl>
            <div className="results-actions">
              <button className="nav-button" onClick={handleBackToSpinners} type="button">
                ← Back to Spinners
              </button>
              <button className="nav-button" onClick={resetCollection} type="button">
                Start Over
              </button>
            </div>
          </div>
        ) : currentSpinner ? (
          <div className="spinner-section">
            <h1 className="collection-title">{collectionTitle || "Spinner Collection"}</h1>

            <div className="spinner-wrapper">
              <h2 className="spinner-title">{currentSpinner.name}</h2>
              <Spinner
                key={currentSpinnerIndex}
                items={currentSpinner.items}
                onSpinComplete={handleSpinComplete}
                onSpinStart={handleSpinStart}
                onSpinEnd={handleSpinEnd}
                muted={muted}
                onMutedChange={setMuted}
                initialResult={results[currentSpinnerIndex]}
              >
                <div className="navigation-buttons">
                  <button
                    className="nav-button"
                    onClick={handlePrevious}
                    disabled={currentSpinnerIndex === 0}
                    type="button"
                  >
                    ← Previous
                  </button>
                  <button className="nav-button" onClick={handleNext} disabled={!hasResult || isSpinning} type="button">
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
