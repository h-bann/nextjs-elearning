"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Grip,
  Plus,
  ChevronDown,
  ChevronUp,
  Trash,
  Edit,
  CodeSquare,
} from "lucide-react";
import LessonManager from "./LessonManager";

export default function ModuleManager({ course, addModule }) {
  const { id, title } = course;
  const router = useRouter();
  const [modules, setModules] = useState(course.modules);
  const [expandedModules, setExpandedModules] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState("");

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(modules);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order_index for each module
    const updatedModules = items.map((item, index) => ({
      ...item,
      order_index: index,
    }));

    setModules(updatedModules);

    try {
      await fetch(`/api/courses/${id}/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "modules", items: updatedModules }),
      });
    } catch (error) {
      console.error("Failed to update module order:", error);
    }
  };

  const toggleModule = (moduleId) => {
    setExpandedModules((prev) => {
      // Create a new object with all modules collapsed
      const newState = {};
      // Toggle only the clicked module
      newState[moduleId] = !prev[moduleId];
      return newState;
    });
  };

  const handleAddModule = async (e) => {
    e.preventDefault(); // Prevent form submission

    if (!newModuleTitle.trim()) return;

    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("title", newModuleTitle);
      formData.append("order_index", course.modules.length + 1);

      // await addModule(formData);
      const response = await fetch(
        `/api/courses/course-editing/${id}/modules`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: formData.get("title"),
            order_index: formData.get("order_index"),
          }),
        },
      );
      const newModule = await response.json();

      setModules([...course.modules, newModule]);
      setExpandedModules((prev) => ({
        ...prev,
        [newModule.id]: true,
      }));
      setNewModuleTitle("");
      setIsModalOpen(false);
      router.refresh();
    } catch (err) {
      setError("Failed to add module");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!confirm("Are you sure you want to delete this module?")) return;

    try {
      await fetch(`/api/courses/course-editing/${id}/modules/${moduleId}`, {
        method: "DELETE",
      });

      setModules(modules.filter((m) => m.id !== moduleId));
    } catch (error) {
      setError("Failed to delete module");
    }
  };

  return (
    <div className="rounded-lg bg-white text-black shadow">
      {error && (
        <div className="mb-4 rounded-md bg-red-100 p-4 text-red-700">
          {error}
        </div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="modules">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="divide-y divide-gray-200"
            >
              {modules.map((module, index) => (
                <Draggable
                  key={module.id}
                  draggableId={String(module.id)}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <span {...provided.dragHandleProps}>
                            <Grip className="h-5 w-5 text-gray-400" />
                          </span>
                          <h3 className="text-lg font-medium">
                            {module.title}
                          </h3>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleModule(module.id)}
                            className="p-2 text-gray-500 hover:text-gray-700"
                          >
                            {expandedModules[module.id] ? (
                              <ChevronUp className="h-5 w-5" />
                            ) : (
                              <ChevronDown className="h-5 w-5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteModule(module.id)}
                            className="p-2 text-red-500 hover:text-red-700"
                          >
                            <Trash className="h-5 w-5" />
                          </button>
                        </div>
                      </div>

                      {expandedModules[module.id] && (
                        <div className="mt-4 pl-9">
                          <LessonManager
                            courseId={id}
                            courseName={title}
                            moduleId={module.id}
                            initialLessons={module.lessons || []}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <div className="border-t border-gray-200 p-4">
        {isModalOpen ? (
          <form onSubmit={handleAddModule} className="space-y-4">
            <div>
              <label
                htmlFor="moduleTitle"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Module Title
              </label>
              <input
                id="moduleTitle"
                type="text"
                value={newModuleTitle}
                onChange={(e) => setNewModuleTitle(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter module title"
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setNewModuleTitle("");
                }}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? (
                  "Adding..."
                ) : (
                  <>
                    <Plus className="mr-2 h-5 w-5" />
                    Add Module
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add Module
          </button>
        )}
      </div>
    </div>
  );
}
