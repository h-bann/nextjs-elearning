"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2 } from "lucide-react";

export default function CourseSettingsForm({ course }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(course.image_url || null);

  const [formData, setFormData] = useState({
    title: course.title || "",
    description: course.description || "",
    price: course.price || "",
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
    setSuccess("");

    try {
      // Upload new image if selected
      let imageUrl = course.image_url;
      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append("image", imageFile);
        imageFormData.append("title", formData.title);

        const imageResponse = await fetch("/api/courses/image-upload", {
          method: "POST",
          body: imageFormData,
        });

        if (!imageResponse.ok) throw new Error("Failed to upload image");
        const { url } = await imageResponse.json();
        imageUrl = url;
      }

      // Update course details
      const response = await fetch(`/api/courses/course-editing/${course.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          price: formData.price,
          imageUrl: imageUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update course");
      }

      setSuccess("Course updated successfully");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg bg-white p-6 shadow">
      {error && (
        <div className="mb-4 rounded-md bg-red-100 p-4 text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-md bg-green-100 p-4 text-green-700">
          {success}
        </div>
      )}

      {/* Image Upload */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Course Thumbnail
        </label>
        <div className="flex items-center space-x-6">
          {imagePreview && (
            <div className="shrink-0">
              <img
                src={imagePreview}
                alt="Course thumbnail"
                className="h-32 w-auto rounded-md object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <label className="flex w-full cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-gray-300 px-6 py-4 hover:border-blue-500">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <span className="relative rounded-md font-medium text-blue-600 hover:text-blue-500">
                    Upload a new image
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Course Title
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            required
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={4}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Price (£)
          </label>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value })
            }
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={loading}
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
  );
}
