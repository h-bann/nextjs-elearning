"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Grip, Plus, Video, FileText, Trash, Edit } from "lucide-react";

export default function LessonManager({
  courseId,
  moduleId,
  initialLessons = [],
}) {
  const [lessons, setLessons] = useState(initialLessons);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(lessons);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedLessons = items.map((item, index) => ({
      ...item,
      order_index: index,
    }));

    setLessons(updatedLessons);

    try {
      await fetch(
        `/api/courses/${courseId}/modules/${moduleId}/lessons/reorder`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lessons: updatedLessons }),
        }
      );
    } catch (error) {
      console.error("Failed to update lesson order:", error);
    }
  };

  const handleAddLesson = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/courses/${courseId}/modules/${moduleId}/lessons`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "New Lesson",
            type: "TEXT",
            content: "",
            order_index: lessons.length,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to add lesson");

      const newLesson = await response.json();
      setLessons([...lessons, newLesson]);
    } catch (err) {
      setError("Failed to add lesson");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return;

    try {
      await fetch(
        `/api/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`,
        {
          method: "DELETE",
        }
      );

      setLessons(lessons.filter((l) => l.id !== lessonId));
    } catch (error) {
      setError("Failed to delete lesson");
    }
  };

  return (
    <div className="mt-4">
      {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId={`lessons-${moduleId}`}>
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {lessons.map((lesson, index) => (
                <Draggable
                  key={lesson.id}
                  draggableId={String(lesson.id)}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="bg-gray-50 rounded-md p-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span {...provided.dragHandleProps}>
                            <Grip className="w-4 h-4 text-gray-400" />
                          </span>
                          {lesson.type === "VIDEO" ? (
                            <Video className="w-4 h-4 text-blue-500" />
                          ) : (
                            <FileText className="w-4 h-4 text-green-500" />
                          )}
                          <span>{lesson.title}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleDeleteLesson(lesson.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              /* TODO: Add edit functionality */
                            }}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <button
        onClick={handleAddLesson}
        disabled={loading}
        className="mt-4 flex items-center text-sm text-blue-600 hover:text-blue-800"
      >
        <Plus className="w-4 h-4 mr-1" />
        Add Lesson
      </button>
    </div>
  );
}
