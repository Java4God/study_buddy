import axios from "axios";
import { Api } from "@/app/routes";
import { Flashcard } from "@/app/types";

export async function getAllFlashcards(): Promise<Flashcard[]> {
  const res = await axios.get<Flashcard[]>(Api.FLASHCARDS);
  if (res.status !== 200) return [];
  return res.data;
}

export async function createFlashcard(
  question: string,
  answer: string,
): Promise<Flashcard | null> {
  const payload = {
    question,
    answer,
    repetition: 0,
    easiness: 2.5,
    nextReview: new Date().toISOString().split("T")[0],
  };
  const res = await axios.post(Api.FLASHCARDS, payload);
  if (res.status !== 200) return null;
  return res.data as Flashcard;
}

export async function updateFlashcard(
  id: string,
  repetition: number,
  easiness: number,
  nextReview: string,
  question: string,
  answer: string,
) {
  const payload = { repetition, easiness, nextReview, question, answer };
  await axios.put(`${Api.FLASHCARDS}?id=${id}`, payload);
}

export async function deleteFlashcard(id: string) {
  await axios.delete(`${Api.FLASHCARDS}?id=${id}`);
}

export function calculateSM2(
  rating: 0 | 1 | 2 | 3,
  currentEasiness: number,
  currentRepetition: number,
  lastIntervalDays: number = 0,
) {
  const q = 5 - (rating === 0 ? 0 : rating === 1 ? 2 : rating === 2 ? 4 : 5);
  // But better: map rating 0..3 to quality 0..5: 0->0,1->2,2->4,3->5
  const quality = rating === 0 ? 0 : rating === 1 ? 2 : rating === 2 ? 4 : 5;

  let newEF =
    currentEasiness + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEF < 1.3) newEF = 1.3;

  let intervalDays = 1;
  let newRepetition = currentRepetition;

  if (quality < 3) {
    newRepetition = 1;
    intervalDays = 1;
  } else {
    if (currentRepetition === 0) intervalDays = 1;
    else if (currentRepetition === 1) intervalDays = 3;
    else
      intervalDays =
        Math.round(lastIntervalDays * newEF) || Math.round(3 * newEF);
    newRepetition = currentRepetition + 1;
  }

  const today = new Date();
  const next = new Date(today.getTime() + intervalDays * 24 * 60 * 60 * 1000);
  const nextReview = next.toISOString().split("T")[0];

  return { newEasiness: newEF, newRepetition, intervalDays, nextReview };
}
