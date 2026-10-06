import { describe, expect, test } from 'vitest';
import { PASS_MARK, scoreAnswers } from './quiz.js';

const qs = Array.from({ length: 10 }, (_, i) => ({ answer: i % 4 }));

describe('scoreAnswers', () => {
  test('counts correct answers and the pass mark (70%)', () => {
    const answers = qs.map((q, i) => (i < 7 ? q.answer : (q.answer + 1) % 4));
    expect(scoreAnswers(qs, answers)).toEqual({ correct: 7, total: 10, pct: 70, passed: true, answered: 10 });
    const six = qs.map((q, i) => (i < 6 ? q.answer : (q.answer + 1) % 4));
    expect(scoreAnswers(qs, six).passed).toBe(false);
    expect(PASS_MARK).toBe(0.7);
  });
  test('unanswered questions are wrong and not "answered"', () => {
    expect(scoreAnswers(qs, qs.map(() => null))).toMatchObject({ correct: 0, answered: 0, passed: false });
    expect(scoreAnswers([{ answer: 0 }, { answer: 2 }], [0, null])).toMatchObject({ correct: 1, answered: 1, pct: 50 });
  });
  test('index 0 is a real answer, not "nothing"', () => {
    expect(scoreAnswers([{ answer: 0 }], [0]).correct).toBe(1);
  });
  test('no questions → 0%, not passed', () => {
    expect(scoreAnswers([], [])).toMatchObject({ pct: 0, passed: false });
  });
});
