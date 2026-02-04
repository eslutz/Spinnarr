import { useState } from "react";
interface FileUploadProps {
  onFileLoad: (data: unknown) => void;
}

function FileUpload({ onFileLoad }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File | undefined) => {
    const isJsonFile = Boolean(file && (file.type === "application/json" || file.name.toLowerCase().endsWith(".json")));
    if (file && isJsonFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          if (e.target?.result && typeof e.target.result === "string") {
            const data = JSON.parse(e.target.result) as unknown;
            onFileLoad(data);
          }
        } catch {
          alert("Invalid JSON file. Please check the file format.");
        }
      };
      reader.readAsText(file);
    } else {
      alert("Please upload a valid JSON file.");
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFile(file);
  };

  return (
    <div
      className={`file-upload ${isDragging ? "dragging" : ""}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <div className="file-upload-content">
        <div className="file-upload-icon">📁</div>
        <p className="file-upload-text">Drag & drop your JSON file here</p>
        <p className="file-upload-or">or</p>
        <label className="file-upload-button">
          Choose File
          <input type="file" accept=".json" onChange={handleInputChange} style={{ display: "none" }} />
        </label>
      </div>
    </div>
  );
}

export default FileUpload;
