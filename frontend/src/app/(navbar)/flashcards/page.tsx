"use client";

import { useState } from "react";
import { Card, CardContent } from "@/app/components/card";
import Button from "@/app/components/button";
import Input from "@/app/components/input";
import { Plus, Layers, ArrowLeft, ChevronRight, BookOpen } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/dialogs";

interface Deck {
  id: string;
  name: string;
  subject: string;
  cards: number;
  dueToday: number;
}

interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export default function FlashcardsPage() {
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [newDeckName, setNewDeckName] = useState("");
  const [newDeckSubject, setNewDeckSubject] = useState("");
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    subject?: string;
  }>({});

  const [decks, setDecks] = useState<Deck[]>([
    {
      id: "1",
      name: "Calculus Formulas",
      subject: "Mathematics",
      cards: 45,
      dueToday: 12,
    },
    {
      id: "2",
      name: "Chemistry Elements",
      subject: "Chemistry",
      cards: 30,
      dueToday: 8,
    },
    {
      id: "3",
      name: "Historical Dates",
      subject: "History",
      cards: 25,
      dueToday: 5,
    },
    {
      id: "4",
      name: "Spanish Vocabulary",
      subject: "Language",
      cards: 100,
      dueToday: 20,
    },
  ]);

  const sampleCards: Flashcard[] = [
    { id: "1", front: "What is the derivative of sin(x)?", back: "cos(x)" },
    { id: "2", front: "What is the integral of 1/x?", back: "ln|x| + C" },
    {
      id: "3",
      front: "What is the chain rule?",
      back: "d/dx[f(g(x))] = f'(g(x)) · g'(x)",
    },
  ];

  const openCreateModal = () => {
    setNewDeckName("");
    setNewDeckSubject("");
    setFormErrors({});
    setShowCreateModal(true);
  };

  const handleCreateDeck = () => {
    const errors: { name?: string; subject?: string } = {};
    if (!newDeckName.trim()) errors.name = "Deck name is required";
    if (!newDeckSubject.trim()) errors.subject = "Subject is required";
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const newDeck: Deck = {
      id: Date.now().toString(),
      name: newDeckName.trim(),
      subject: newDeckSubject.trim(),
      cards: 0,
      dueToday: 0,
    };
    setDecks((prev) => [...prev, newDeck]);
    setShowCreateModal(false);
  };

  const handleRating = (rating: number) => {
    if (currentCardIndex < sampleCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    } else {
      setSelectedDeck(null);
      setCurrentCardIndex(0);
      setIsFlipped(false);
    }
  };

  if (selectedDeck) {
    const currentCard = sampleCards[currentCardIndex];
    const progress = ((currentCardIndex + 1) / sampleCards.length) * 100;

    return (
      <div className="w-full bg-switch-background/20">
        <div className="space-y-6 py-8 px-20">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => {
                setSelectedDeck(null);
                setCurrentCardIndex(0);
                setIsFlipped(false);
              }}
            >
              <ArrowLeft className="size-4 mr-2" />
              Back to Decks
            </Button>
            <div className="text-sm text-gray-600">
              {currentCardIndex + 1} / {sampleCards.length}
            </div>
          </div>

          <div>
            <h1 className="text-3xl mb-2">Calculus Formulas</h1>
            {/*
            <Progress value={progress} className="h-2" />
            */}
          </div>

          {/* Flashcard */}
          <div
            className="relative h-96 cursor-pointer perspective-1000"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div
              className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
                isFlipped ? "rotate-y-180" : ""
              }`}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Front */}
              <Card
                className={`absolute inset-0 backface-hidden ${isFlipped ? "invisible" : "visible"}`}
              >
                <CardContent className="h-full flex flex-col items-center justify-center p-8 text-center">
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-4">
                    Question
                  </p>
                  <p className="text-2xl">{currentCard.front}</p>
                  <p className="text-sm text-gray-500 mt-8">
                    Click to reveal answer
                  </p>
                </CardContent>
              </Card>

              {/* Back */}
              <Card
                className={`absolute inset-0 backface-hidden rotate-y-180 ${isFlipped ? "visible" : "invisible"}`}
                style={{ transform: "rotateY(180deg)" }}
              >
                <CardContent className="h-full flex flex-col items-center justify-center p-8 text-center">
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-4">
                    Answer
                  </p>
                  <p className="text-2xl text-indigo-600">{currentCard.back}</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Rating Buttons */}
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
              Review your decks with spaced repetition
            </p>
          </div>
          <Button className="gap-2" onClick={openCreateModal}>
            <Plus className="size-4" />
            Create Deck
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {decks.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
              <div className="p-5 bg-indigo-50 rounded-3xl mb-4">
                <BookOpen className="size-12 text-indigo-500" />
              </div>
              <h3 className="text-xl mb-2 text-gray-700">No flashcards yet</h3>
              <p className="text-gray-500 mb-6 max-w-xs">
                Create your first deck to start studying with spaced repetition!
              </p>
              <Button className="gap-2" onClick={openCreateModal}>
                <Plus className="size-4" />
                Create your first deck
              </Button>
            </div>
          ) : (
            decks.map((deck) => (
              <Card
                key={deck.id}
                className="border-1 rounded-md hover:shadow-lg transition-shadow cursor-pointer bg-white"
                onClick={() => setSelectedDeck(deck.id)}
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2">{deck.name}</h3>
                        <div className="text-xs rounded-full px-2 py-0.5 bg-indigo-100 text-indigo-700 w-max">
                          {deck.subject}
                        </div>
                      </div>
                      <Layers className="size-5 text-indigo-600" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Total Cards</span>
                        <span className="font-medium">{deck.cards}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Due Today</span>
                        <span className="font-medium text-indigo-600">
                          {deck.dueToday}
                        </span>
                      </div>
                    </div>

                    <Button className="w-full">
                      Study Now
                      <ChevronRight className="size-4 ml-2" />
                    </Button>
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
              <DialogTitle>Create New Deck</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <label htmlFor="deck-name">
                  Deck Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="deck-name"
                  placeholder="e.g., Physics Formulas"
                  value={newDeckName}
                  setValue={(value) => {
                    setNewDeckName(value);
                    if (formErrors.name)
                      setFormErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                />
                {formErrors.name && (
                  <p className="text-xs text-red-500">{formErrors.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="deck-subject">
                  Subject <span className="text-red-500">*</span>
                </label>
                <Input
                  id="deck-subject"
                  placeholder="e.g., Physics"
                  value={newDeckSubject}
                  setValue={(value) => {
                    setNewDeckSubject(value);
                    if (formErrors.subject)
                      setFormErrors((prev) => ({
                        ...prev,
                        subject: undefined,
                      }));
                  }}
                />
                {formErrors.subject && (
                  <p className="text-xs text-red-500">{formErrors.subject}</p>
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
                <Button className="flex-1" onClick={handleCreateDeck}>
                  Create Deck
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
