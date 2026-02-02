import { useState } from "react";

function FileUpload({ onFileLoad }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file) => {
    if (file && file.type === "application/json") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          onFileLoad(data);
        } catch (error) {
          alert("Invalid JSON file. Please check the file format.");
        }
      };
      reader.readAsText(file);
    } else {
      alert("Please upload a valid JSON file.");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
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
