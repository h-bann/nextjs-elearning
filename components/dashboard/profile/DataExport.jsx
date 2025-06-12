"use client";
import { useState } from "react";
import { Download, FileText, Shield, Clock, AlertCircle } from "lucide-react";

export default function DataExportSection() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleExportData = async () => {
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/profile/export-data?format=pdf", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to export data");
      }

      // Get the filename from the response headers
      const contentDisposition = response.headers.get("Content-Disposition");
      const filename = contentDisposition
        ? contentDisposition.split("filename=")[1].replace(/"/g, "")
        : "user-data-report.pdf";

      // Convert response to blob and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
      <div className="flex items-start space-x-3">
        <Download className="mt-1 h-6 w-6 flex-shrink-0 text-blue-500" />
        <div className="flex-1">
          <h3 className="mb-2 text-lg font-medium text-blue-900">
            Download Your Learning Report
          </h3>
          <p className="mb-4 text-sm text-blue-700">
            Get a comprehensive report of your course purchases, learning
            progress, and personal data.
          </p>

          <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3">
            <div className="flex items-start">
              <AlertCircle className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
              <div>
                <p className="text-xs font-medium text-amber-800">
                  Security Notice
                </p>
                <p className="mt-1 text-xs text-amber-700">
                  Your report contains sensitive personal information. Please
                  store it securely and delete it when no longer needed.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded border border-red-400 bg-red-100 p-3 text-sm text-red-700">
              <div className="flex items-start">
                <AlertCircle className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0" />
                <div>
                  <p className="font-medium">Export Failed</p>
                  <p>{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-4 rounded border border-green-400 bg-green-100 p-3 text-sm text-green-700">
              <div className="flex items-start">
                <FileText className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0" />
                <div>
                  <p className="font-medium">Export Successful!</p>
                  <p>
                    Your data report has been generated and should start
                    downloading shortly.
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleExportData}
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-md border border-transparent bg-blue-600 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Clock className="mr-2 h-5 w-5 animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <Download className="mr-2 h-5 w-5" />
                Download Report
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
