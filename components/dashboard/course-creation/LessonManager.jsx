"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Grip, Plus, Video, FileText, Trash, Edit } from "lucide-react";
import LessonContentEditor from "./LessonContentEditor";

export default function LessonManager({
  courseId,
  courseName,
  moduleId,
  initialLessons = [],
}) {
  const [lessons, setLessons] = useState(initialLessons);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [editingLesson, setEditingLesson] = useState(null);

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
      await fetch(`/api/courses/${courseId}/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "lessons",
          items: updatedLessons,
          moduleId,
        }),
      });
    } catch (error) {
      console.error("Failed to update lesson order:", error);
    }
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    if (!newLessonTitle.trim()) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/courses/${courseId}/modules/${moduleId}/lessons`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            moduleId: moduleId,
            title: newLessonTitle,
            order_index: lessons.length + 1,
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
    <div className="mt-4 space-y-4">
      {error && <div className="text-sm text-red-600">{error}</div>}
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
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                    >
                      <div className="flex items-center space-x-3">
                        <span {...provided.dragHandleProps}>
                          <Grip className="w-4 h-4 text-gray-400" />
                        </span>
                        <span>{lesson.title}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setEditingLesson(lesson)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLesson(lesson.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
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

      {editingLesson && (
        <LessonContentEditor
          courseName={courseName}
          moduleId={moduleId}
          lesson={editingLesson}
          onSave={async (content) => {
            try {
              const response = await fetch(
                `/api/courses/${courseId}/modules/${moduleId}/lessons/${editingLesson.id}`,
                {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(content),
                }
              );

              if (!response.ok) throw new Error("Failed to update lesson");

              // Update local state
              setLessons(
                lessons.map((lesson) =>
                  lesson.id === editingLesson.id
                    ? { ...lesson, ...content }
                    : lesson
                )
              );
              setEditingLesson(null);
            } catch (error) {
              setError("Failed to update lesson");
            }
          }}
          onClose={() => setEditingLesson(null)}
        />
      )}

      {isModalOpen ? (
        <form onSubmit={handleAddLesson} className="space-y-4">
          <div>
            <label
              htmlFor="lessonTitle"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Lesson Title
            </label>
            <input
              id="lessonTitle"
              type="text"
              value={newLessonTitle}
              onChange={(e) => setNewLessonTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter lesson title"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setNewLessonTitle("");
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Lesson"}
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center text-sm text-blue-600 hover:text-blue-800"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Lesson
        </button>
      )}
    </div>
  );
}
