import { useRef, useState } from "react";
interface FileUploadProps {
  onFileLoad: (data: unknown, fileName: string) => boolean;
}

function FileUpload({ onFileLoad }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const openFilePicker = () => {
    inputRef.current?.click();
  };

  const handleFile = (file: File | undefined) => {
    const isJsonFile = Boolean(file?.name.toLowerCase().endsWith(".json") || file?.type === "application/json");
    if (!file || !isJsonFile) {
      setErrorMessage("Please upload a valid .json file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        if (event.target?.result && typeof event.target.result === "string") {
          const data = JSON.parse(event.target.result) as unknown;
          const loaded = onFileLoad(data, file.name);
          setErrorMessage(loaded ? null : "JSON format is invalid. See schema.json for the expected shape.");
        }
      } catch {
        setErrorMessage("Invalid JSON file. Please check the file format.");
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    setErrorMessage(null);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (e.relatedTarget instanceof Node && e.currentTarget.contains(e.relatedTarget)) {
      return;
    }
    setIsDragging(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const file = e.target.files?.[0];
    handleFile(file);
    e.target.value = "";
  };

  return (
    <section
      className={`file-upload ${isDragging ? "dragging" : ""}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      aria-labelledby="upload-title"
      aria-describedby="upload-help upload-error"
    >
      <div className="file-upload-content">
        <h1 className="file-upload-title" id="upload-title">
          Load a spinner collection
        </h1>
        <div className="file-upload-icon">📁</div>
        <p className="file-upload-text">Drag and drop your JSON file here</p>
        <p className="file-upload-help" id="upload-help">
          Include a non-empty <code>spinners</code> array with item lists.
        </p>
        <p className="file-upload-or">or</p>
        <button className="file-upload-button" type="button" onClick={openFilePicker}>
          Choose File
        </button>
        <input ref={inputRef} type="file" accept=".json" onChange={handleInputChange} className="sr-only" />
        <p className="file-upload-error" id="upload-error" role="alert" aria-live="polite">
          {errorMessage}
        </p>
      </div>
    </section>
  );
}

export default FileUpload;
