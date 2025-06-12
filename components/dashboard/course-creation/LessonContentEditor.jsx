// components/dashboard/course-creation/LessonContentEditor.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  Image as ImageIcon,
  Film,
  Upload,
  Loader2,
  Trash,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function LessonContentEditor({
  lesson,
  courseName,
  moduleId,
  onSave,
  onClose,
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [error, setError] = useState("");
  const [mediaFile, setMediaFile] = useState(null);

  // Track media deletion state
  const [deleteMedia, setDeleteMedia] = useState(false);

  // Determine if lesson already has media and which type
  const existingImage = Array.isArray(lesson.content)
    ? lesson.content.find((c) => c.content_type === "IMAGE")?.value
    : null;

  const existingVideo = Array.isArray(lesson.content)
    ? lesson.content.find((c) => c.content_type === "VIDEO")?.value
    : null;

  // Default to existing media type, or IMAGE if none exists
  const [mediaType, setMediaType] = useState(existingVideo ? "VIDEO" : "IMAGE");

  // Set initial preview based on existing media
  const [mediaPreview, setMediaPreview] = useState(
    existingImage || existingVideo || null,
  );

  // Reference to uploaded media URL
  const uploadedMediaRef = useRef(null);

  // Get text content
  const existingText = Array.isArray(lesson.content)
    ? lesson.content.find((c) => c.content_type === "TEXT")?.value || ""
    : lesson.content?.value || "";

  const [content, setContent] = useState({
    content: {
      type: "TEXT",
      value: existingText,
    },
  });

  // When mediaType changes, update preview to show existing content
  useEffect(() => {
    if (!deleteMedia) {
      if (mediaType === "IMAGE" && existingImage) {
        setMediaPreview(existingImage);
      } else if (mediaType === "VIDEO" && existingVideo) {
        setMediaPreview(existingVideo);
      } else {
        setMediaPreview(null);
      }
    }
  }, [mediaType, deleteMedia, existingImage, existingVideo]);

  const handleMediaTypeChange = (type) => {
    setMediaType(type);
    setMediaFile(null);

    // Reset deletion state when switching media types
    setDeleteMedia(false);

    // Update preview
    if (type === "IMAGE" && existingImage) {
      setMediaPreview(existingImage);
    } else if (type === "VIDEO" && existingVideo) {
      setMediaPreview(existingVideo);
    } else {
      setMediaPreview(null);
    }
  };

  const handleMediaChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      setDeleteMedia(false);

      if (mediaType === "IMAGE") {
        // For images, show preview immediately using FileReader
        const reader = new FileReader();
        reader.onloadend = () => {
          setMediaPreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        // For videos, upload immediately and show preview when ready
        await handleVideoUpload(file);
      }
    }
  };

  const handleVideoUpload = async (file) => {
    setUploadingMedia(true);
    try {
      // Show file name as temp preview during upload
      setMediaPreview(`Uploading: ${file.name}...`);

      const formData = new FormData();
      formData.append("video", file);
      formData.append("lessonTitle", lesson.title);
      formData.append("title", courseName);
      formData.append("moduleId", moduleId);

      const videoResponse = await fetch("/api/courses/video-upload", {
        method: "POST",
        body: formData,
      });

      if (!videoResponse.ok) {
        throw new Error("Failed to upload video");
      }

      const { url } = await videoResponse.json();

      // Set the actual video URL as preview
      setMediaPreview(url);
      // Store the uploaded URL for use in form submission
      uploadedMediaRef.current = url;

      console.log("Video uploaded successfully:", url);
    } catch (err) {
      console.error("Video upload error:", err);
      setError("Failed to upload video. Please try again.");
      setMediaPreview(null);
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleRemoveMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setDeleteMedia(true); // Set delete flag to true
    uploadedMediaRef.current = null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Start with text content
      const updatedContent = {
        content: {
          type: "TEXT",
          value: content.content.value,
        },
      };

      // Track if we need to delete a file from storage
      let fileToDelete = null;

      // If we're deleting media and there's an existing media, mark it for deletion
      if (deleteMedia) {
        if (mediaType === "IMAGE" && existingImage) {
          fileToDelete = existingImage;
        } else if (mediaType === "VIDEO" && existingVideo) {
          fileToDelete = existingVideo;
        }

        // Add deletion flag for database
        updatedContent.deleteMedia = {
          type: mediaType,
          shouldDelete: true,
        };
      }

      // Handle media content
      if (mediaFile) {
        // If we're replacing existing media, mark the old one for deletion
        if (mediaType === "IMAGE" && existingImage) {
          fileToDelete = existingImage;
        } else if (mediaType === "VIDEO" && existingVideo) {
          fileToDelete = existingVideo;
        }

        if (mediaType === "IMAGE") {
          // Image upload happens here during form submission
          const formData = new FormData();
          formData.append("image", mediaFile);
          formData.append("lessonTitle", lesson.title);
          formData.append("title", courseName);
          formData.append("moduleId", moduleId);

          const imageResponse = await fetch("/api/courses/image-upload", {
            method: "POST",
            body: formData,
          });

          if (!imageResponse.ok) throw new Error("Failed to upload image");
          const { url } = await imageResponse.json();

          updatedContent.image = {
            type: "IMAGE",
            value: url,
          };
        } else {
          // For videos, we already have the URL from earlier upload
          if (uploadedMediaRef.current) {
            updatedContent.video = {
              type: "VIDEO",
              value: uploadedMediaRef.current,
            };
          }
        }
      } else if (!deleteMedia) {
        // Keep existing media if not deleting
        if (mediaType === "IMAGE" && existingImage) {
          updatedContent.image = {
            type: "IMAGE",
            value: existingImage,
          };
        } else if (mediaType === "VIDEO" && existingVideo) {
          updatedContent.video = {
            type: "VIDEO",
            value: existingVideo,
          };
        }
      }

      // Update the database
      await onSave(updatedContent);

      // Then delete the file from storage if needed
      if (fileToDelete) {
        try {
          console.log("Deleting file from storage:", fileToDelete);
          await fetch("/api/courses/file-delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileUrl: fileToDelete }),
          });
        } catch (deleteError) {
          console.error("Error deleting file from storage:", deleteError);
          // Don't fail the whole operation if only the file deletion fails
        }
      }

      // Everything successful
      onClose();
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="flex h-[80vh] w-full max-w-4xl flex-col rounded-lg bg-white">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-xl font-semibold">Edit Lesson: {lesson.title}</h2>
          <button onClick={onClose}>
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-4">
          {error && (
            <div className="mb-4 rounded-md bg-red-100 p-4 text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Lesson Content
              </label>
              <textarea
                value={content.content.value}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    content: {
                      ...prev.content,
                      type: "TEXT",
                      value: e.target.value,
                    },
                  }))
                }
                rows={10}
                className="w-full rounded-md border p-3 focus:ring-2 focus:ring-blue-500"
                placeholder="Enter lesson content..."
              />
            </div>

            <div className="mt-2">
              <div className="mb-4 flex space-x-4">
                <button
                  type="button"
                  onClick={() => handleMediaTypeChange("IMAGE")}
                  className={`flex items-center rounded-md px-4 py-2 ${
                    mediaType === "IMAGE"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Image
                </button>
                <button
                  type="button"
                  onClick={() => handleMediaTypeChange("VIDEO")}
                  className={`flex items-center rounded-md px-4 py-2 ${
                    mediaType === "VIDEO"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  <Film className="mr-2 h-4 w-4" />
                  Video
                </button>
              </div>

              <label className="mb-2 block text-sm font-medium text-gray-700">
                {deleteMedia
                  ? `No ${mediaType.toLowerCase()} selected`
                  : mediaType === "IMAGE"
                    ? "Image"
                    : "Video"}
              </label>

              {/* Current media preview */}
              {mediaPreview && !deleteMedia && (
                <div className="mb-4 flex items-center justify-center rounded-lg border p-4">
                  <div className="text-center">
                    {mediaType === "IMAGE" ? (
                      <img
                        src={mediaPreview}
                        alt="Preview"
                        className="mx-auto max-h-64 rounded-lg"
                      />
                    ) : uploadingMedia ? (
                      <div className="flex flex-col items-center">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        <p className="mt-2 text-sm">Uploading video...</p>
                      </div>
                    ) : typeof mediaPreview === "string" &&
                      mediaPreview.includes("http") ? (
                      // Show embedded video player for URLs
                      <video
                        src={mediaPreview}
                        className="max-h-64 max-w-full rounded-lg"
                        controls
                      >
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      // Show file name for newly selected files
                      <div className="flex items-center rounded-md bg-gray-100 px-4 py-2">
                        <Film className="mr-2 h-5 w-5 text-blue-600" />
                        <span>{mediaPreview}</span>
                      </div>
                    )}

                    <div className="mt-2">
                      <button
                        type="button"
                        disabled={uploadingMedia}
                        onClick={handleRemoveMedia}
                        className="mt-2 flex items-center justify-center rounded-md bg-red-100 px-3 py-1 text-sm text-red-600 hover:bg-red-200 disabled:opacity-50"
                      >
                        <Trash className="mr-1 h-4 w-4" />
                        Remove {mediaType.toLowerCase()}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload new media */}
              <div className="mb-4">
                <label className="flex h-32 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500">
                  <div className="flex flex-col items-center">
                    {uploadingMedia ? (
                      <>
                        <Loader2 className="mb-2 h-8 w-8 animate-spin text-blue-600" />
                        <span className="text-sm font-medium text-gray-700">
                          Uploading video...
                        </span>
                      </>
                    ) : (
                      <>
                        <Upload className="mb-2 h-8 w-8 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">
                          {!deleteMedia && mediaPreview
                            ? `Replace current ${mediaType.toLowerCase()}`
                            : `Upload a ${mediaType.toLowerCase()}`}
                        </span>
                        <span className="mt-1 text-xs text-gray-500">
                          {mediaType === "IMAGE"
                            ? "PNG, JPG, GIF up to 10MB"
                            : "MP4, WEBM, OGG up to 100MB"}
                        </span>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept={mediaType === "IMAGE" ? "image/*" : "video/*"}
                    onChange={handleMediaChange}
                    disabled={uploadingMedia}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={uploadingMedia || loading}
              className="rounded-md border px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploadingMedia}
              className="flex items-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
