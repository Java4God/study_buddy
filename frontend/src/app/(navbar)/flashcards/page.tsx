"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/app/components/card";
import Button from "@/app/components/button";
import Input from "@/app/components/input";
import { Plus, ArrowLeft, ChevronRight, BookOpen } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/dialogs";
import {
  getAllFlashcards,
  createFlashcard,
  updateFlashcard,
  deleteFlashcard,
  calculateSM2,
} from "@/app/lib/flashcardService";
import { Flashcard } from "@/app/types";

export default function FlashcardsPage() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [formErrors, setFormErrors] = useState<{
    question?: string;
    answer?: string;
  }>({});

  useEffect(() => {
    fetchFlashcards();
  }, []);

  async function fetchFlashcards() {
    setLoading(true);
    try {
      const data = await getAllFlashcards();
      setFlashcards(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const openCreateModal = () => {
    setNewQuestion("");
    setNewAnswer("");
    setFormErrors({});
    setShowCreateModal(true);
  };

  const handleCreateCard = async () => {
    const errors: { question?: string; answer?: string } = {};
    if (!newQuestion.trim()) errors.question = "Question is required";
    if (!newAnswer.trim()) errors.answer = "Answer is required";
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }

    try {
      const created = await createFlashcard(
        newQuestion.trim(),
        newAnswer.trim(),
      );
      if (created) {
        setFlashcards((prev) => [created, ...prev]);
      }
      setShowCreateModal(false);
    } catch (e) {
      console.error(e);
    }
  };

  const startStudy = (index: number) => {
    setSelectedIndex(index);
    setIsFlipped(false);
  };

  const handleRating = async (rating: 0 | 1 | 2 | 3) => {
    if (selectedIndex === null) return;
    const card = flashcards[selectedIndex];
    const { newEasiness, newRepetition, nextReview } = calculateSM2(
      rating,
      card.easiness,
      card.repetition,
    );

    try {
      await updateFlashcard(
        card.id,
        newRepetition,
        newEasiness,
        nextReview,
        card.question,
        card.answer,
      );
      // Update local copy
      setFlashcards((prev) => {
        const copy = [...prev];
        copy[selectedIndex] = {
          ...copy[selectedIndex],
          repetition: newRepetition,
          easiness: newEasiness,
          nextReview,
        };
        return copy;
      });
    } catch (e) {
      console.error(e);
    }

    // move to next card or exit
    if (selectedIndex < flashcards.length - 1) {
      setSelectedIndex(selectedIndex + 1);
      setIsFlipped(false);
    } else {
      setSelectedIndex(null);
      setIsFlipped(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteFlashcard(id);
      setFlashcards((prev) => prev.filter((f) => f.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  // Study mode
  if (selectedIndex !== null) {
    const card = flashcards[selectedIndex];
    return (
      <div className="w-full bg-switch-background/20">
        <div className="space-y-6 py-8 px-20">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => {
                setSelectedIndex(null);
                setIsFlipped(false);
              }}
            >
              <ArrowLeft className="size-4 mr-2" />
              Back to Cards
            </Button>
            <div className="text-sm text-gray-600">
              {selectedIndex + 1} / {flashcards.length}
            </div>
          </div>

          <div>
            <h1 className="text-3xl mb-2">Study</h1>
          </div>

          <div
            className="relative h-96 cursor-pointer perspective-1000"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div
              className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? "rotate-y-180" : ""}`}
              style={{ transformStyle: "preserve-3d" }}
            >
              <Card
                className={`absolute inset-0 backface-hidden ${isFlipped ? "invisible" : "visible"}`}
              >
                <CardContent className="h-full flex flex-col items-center justify-center p-8 text-center">
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-4">
                    Question
                  </p>
                  <p className="text-2xl">{card.question}</p>
                  <p className="text-sm text-gray-500 mt-8">
                    Click to reveal answer
                  </p>
                </CardContent>
              </Card>

              <Card
                className={`absolute inset-0 backface-hidden rotate-y-180 ${isFlipped ? "visible" : "invisible"}`}
                style={{ transform: "rotateY(180deg)" }}
              >
                <CardContent className="h-full flex flex-col items-center justify-center p-8 text-center">
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-4">
                    Answer
                  </p>
                  <p className="text-2xl text-indigo-600">{card.answer}</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {isFlipped && (
            <div className="grid grid-cols-4 gap-3">
              <Button
                variant="outline"
                onClick={() => handleRating(0)}
                className="h-auto py-4 flex flex-col gap-1"
              >
                <span className="text-xl">😰</span>
                <span className="text-xs">Again</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => handleRating(1)}
                className="h-auto py-4 flex flex-col gap-1"
              >
                <span className="text-xl">😕</span>
                <span className="text-xs">Hard</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => handleRating(2)}
                className="h-auto py-4 flex flex-col gap-1"
              >
                <span className="text-xl">🙂</span>
                <span className="text-xs">Good</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => handleRating(3)}
                className="h-auto py-4 flex flex-col gap-1"
              >
                <span className="text-xl">😄</span>
                <span className="text-xs">Easy</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-switch-background/20">
      <div className="space-y-6 py-8 px-20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl mb-2">Flashcards</h1>
            <p className="text-gray-600">
              Review your cards with spaced repetition
            </p>
          </div>
          <Button className="gap-2" onClick={openCreateModal}>
            <Plus className="size-4" />
            Create Card
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div>Loading...</div>
          ) : flashcards.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
              <div className="p-5 bg-indigo-50 rounded-3xl mb-4">
                <BookOpen className="size-12 text-indigo-500" />
              </div>
              <h3 className="text-xl mb-2 text-gray-700">No flashcards yet</h3>
              <p className="text-gray-500 mb-6 max-w-xs">
                Create your first card to start studying with spaced repetition!
              </p>
              <Button className="gap-2" onClick={openCreateModal}>
                <Plus className="size-4" />
                Create your first card
              </Button>
            </div>
          ) : (
            flashcards.map((card, idx) => (
              <Card
                key={card.id}
                className="border-1 rounded-md hover:shadow-lg transition-shadow cursor-pointer bg-white"
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2">{card.question}</h3>
                        <div className="text-xs rounded-full px-2 py-0.5 bg-indigo-100 text-indigo-700 w-max">
                          Due: {card.nextReview}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Repetition</span>
                        <span className="font-medium">{card.repetition}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Easiness</span>
                        <span className="font-medium text-indigo-600">
                          {card.easiness.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={() => startStudy(idx)}
                      >
                        Study Now
                        <ChevronRight className="size-4 ml-2" />
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDelete(card.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Dialog
          open={showCreateModal}
          onOpenChange={(open) => {
            if (!open) setShowCreateModal(false);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Card</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <label htmlFor="question">
                  Question <span className="text-red-500">*</span>
                </label>
                <Input
                  id="question"
                  placeholder="Enter question"
                  value={newQuestion}
                  setValue={(v) => {
                    setNewQuestion(v);
                    if (formErrors.question)
                      setFormErrors((p) => ({ ...p, question: undefined }));
                  }}
                />
                {formErrors.question && (
                  <p className="text-xs text-red-500">{formErrors.question}</p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="answer">
                  Answer <span className="text-red-500">*</span>
                </label>
                <Input
                  id="answer"
                  placeholder="Enter answer"
                  value={newAnswer}
                  setValue={(v) => {
                    setNewAnswer(v);
                    if (formErrors.answer)
                      setFormErrors((p) => ({ ...p, answer: undefined }));
                  }}
                />
                {formErrors.answer && (
                  <p className="text-xs text-red-500">{formErrors.answer}</p>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleCreateCard}>
                  Create Card
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
