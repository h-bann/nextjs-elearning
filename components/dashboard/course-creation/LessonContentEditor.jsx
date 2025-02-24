"use client";

import { useState } from "react";
import { X, Image as ImageIcon, Plus } from "lucide-react";
import { Upload, Loader2 } from "lucide-react";
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
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(
    lesson.image ? lesson.image.value : null
  );
  const [content, setContent] = useState({
    content: {
      type: "TEXT",
      value: Array.isArray(lesson.content)
        ? lesson.content.find((c) => c.content_type === "TEXT")?.value || ""
        : lesson.content?.type === "TEXT"
        ? lesson.content.value || ""
        : "",
    },
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let imageUrl = null;
      let updatedContent = "";
      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);
        formData.append("lessonTitle", lesson.title);
        formData.append("title", courseName);
        formData.append("moduleId", moduleId);

        const imageResponse = await fetch("/api/courses/image-upload", {
          method: "POST",
          body: formData,
        });

        if (!imageResponse.ok) throw new Error("Failed to upload image");
        const { url } = await imageResponse.json();
        imageUrl = url;

        updatedContent = {
          ...content,
          image: { type: "image", value: imageUrl },
        };
      }
      if (!imageFile) {
        updatedContent = { ...content };
      }

      await onSave(updatedContent);
      onClose();
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Edit Lesson: {lesson.title}</h2>
          <button onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lesson Content
              </label>
              <textarea
                // value={content.text?.value || ""}
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
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Enter lesson content..."
              />
            </div>

            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images
              </label>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* {content.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Lesson image ${index + 1}`}
                      className="w-full h-32 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setContent((prev) => ({
                          ...prev,
                          images: prev.images.filter((_, i) => i !== index),
                        }))
                      }
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))} */}
                <div className=" text-center flex">
                  <div className="flex flex-col text-sm text-gray-600">
                    <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:border-blue-500">
                      <span className="p-1">
                        Upload a file or drag and drop
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                  {imagePreview && (
                    <div className="ml-5">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="mx-auto h-32 w-auto"
                      />
                    </div>
                  )}
                </div>
                {/* <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:border-blue-500">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="text-center">
                    <ImageIcon className="w-8 h-8 mx-auto text-gray-400" />
                    <span className="block mt-2 text-sm text-gray-500">
                      Add Image
                    </span>
                  </div>
                </label> */}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
