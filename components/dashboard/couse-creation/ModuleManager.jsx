"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Grip, Plus, ChevronDown, ChevronUp, Trash, Edit } from "lucide-react";

export default function ModuleManager({ courseId, initialModules }) {
  const router = useRouter();
  const [modules, setModules] = useState(initialModules);
  const [expandedModules, setExpandedModules] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  console.log(courseId, initialModules);

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
      await fetch(`/api/courses/${courseId}/modules/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modules: updatedModules }),
      });
    } catch (error) {
      console.error("Failed to update module order:", error);
    }
  };

  const toggleModule = (moduleId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const handleAddModule = async () => {
    setLoading(true);
    setError("");
    console.log("Attempting to add module");
    try {
      console.log("Fetch URL:", `/api/courses/${courseId}/modules`);

      const response = await fetch(`/api/courses/${courseId}/modules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "New Module",
          order_index: modules.length,
        }),
      });

      if (!response.ok) throw new Error("Failed to add module");

      const newModule = await response.json();
      setModules([...modules, newModule]);
      setExpandedModules((prev) => ({
        ...prev,
        [newModule.id]: true,
      }));
    } catch (err) {
      setError("Failed to add module");
    } finally {
      setLoading(false);
    }
  };

  //   const handleAddModule = async () => {
  //     setLoading(true);
  //     setError("");

  //     console.log("Starting API call to:", `/api/courses/${courseId}/modules`);

  //     try {
  //       const response = await fetch(`/api/courses/${courseId}/modules`, {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({
  //           title: "Test Module",
  //           order_index: 0,
  //         }),
  //       });
  //       console.log("response", response);
  //       console.log("Response received:", response.status);
  //       //   const data = await response.json();
  //       //   console.log("Data:", data);
  //     } catch (error) {
  //       console.error("Error details:", error);
  //       setError("Failed to add module");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  const handleDeleteModule = async (moduleId) => {
    if (!confirm("Are you sure you want to delete this module?")) return;

    try {
      await fetch(`/api/courses/${courseId}/modules/${moduleId}`, {
        method: "DELETE",
      });

      setModules(modules.filter((m) => m.id !== moduleId));
    } catch (error) {
      setError("Failed to delete module");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-md">
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
                            <Grip className="w-5 h-5 text-gray-400" />
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
                              <ChevronUp className="w-5 h-5" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteModule(module.id)}
                            className="p-2 text-red-500 hover:text-red-700"
                          >
                            <Trash className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {expandedModules[module.id] && (
                        <div className="mt-4 pl-9">
                          {/* Lesson management will go here */}
                          <button
                            onClick={() =>
                              router.push(
                                `/dashboard/courses/${courseId}/modules/${module.id}`
                              )
                            }
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Manage Lessons
                          </button>
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

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleAddModule}
          disabled={loading}
          className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Module
        </button>
      </div>
    </div>
  );
}
