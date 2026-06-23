import { useState } from "react";
import axios from "axios";
import "./CSVUpload.css";
import { toast } from "react-toastify";
function CSVUpload() {

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {

    if (!file) {
      alert("Please select a CSV file.");
      return;
    }

    try {

      setLoading(true);

      const formData = new FormData();

      formData.append("file", file);

      const response = await axios.post(
        "http://localhost:5000/api/admin/upload-csv",
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      toast.success(
        `${response.data.totalProducts} products uploaded successfully!`
      );

    } catch (error) {

      console.log(error);

      toast.error("CSV upload failed.");

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="csv-page">

      <div className="csv-card">

        <h1>Bulk CSV Upload</h1>

        <p>
          Upload hundreds of saree products instantly.
        </p>

        <input
          type="file"
          accept=".csv"
          onChange={(e) =>
            setFile(e.target.files[0])
          }
        />

        <button
          onClick={handleUpload}
        >
          {loading
            ? "Uploading..."
            : "Upload CSV"}
        </button>

      </div>

    </div>
  );
}

export default CSVUpload;