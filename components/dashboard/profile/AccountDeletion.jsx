"use client";

import { useState } from "react";
import { Trash2, AlertTriangle, X } from "lucide-react";

export default function AccountDeletion() {
  const [showModal, setShowModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDeleteAccount = async () => {
    if (confirmText !== "DELETE MY ACCOUNT") {
      setError("Please type 'DELETE MY ACCOUNT' exactly as shown");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/profile/delete-account", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete account");
      }

      // Account deleted successfully - redirect to home page
      window.location.href = "/";
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <div className="flex items-start space-x-3">
          <Trash2 className="mt-1 h-6 w-6 flex-shrink-0 text-red-500" />
          <div className="flex-1">
            <h3 className="mb-2 text-lg font-medium text-red-900">
              Delete Account
            </h3>
            <p className="mb-4 text-sm text-red-700">
              Permanently delete your account and all associated data. This
              action cannot be undone.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Delete Account
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setConfirmText("");
                  setError("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Warning Section */}
            <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4">
              <div className="flex items-start">
                <AlertTriangle className="mr-3 mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
                <div>
                  <h4 className="mb-2 text-sm font-medium text-red-800">
                    Warning: This action is permanent
                  </h4>
                  <ul className="space-y-1 text-sm text-red-700">
                    <li>• Your account will be permanently deleted</li>
                    <li>• All your course progress will be lost</li>
                    <li>
                      •{" "}
                      <strong>
                        Any courses you have purchased will not be recoverable
                      </strong>
                    </li>
                    <li>
                      • You will need to purchase courses again if you create a
                      new account
                    </li>
                    <li>
                      • All personal data will be removed from our systems
                    </li>
                    <li>• This action cannot be undone</li>
                  </ul>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded border border-red-400 bg-red-100 p-3 text-red-700">
                {error}
              </div>
            )}

            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                To confirm deletion, type:{" "}
                <span className="rounded bg-gray-100 px-1 font-mono">
                  DELETE MY ACCOUNT
                </span>
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Type here..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setConfirmText("");
                  setError("");
                }}
                className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={loading || confirmText !== "DELETE MY ACCOUNT"}
                className="flex-1 rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
