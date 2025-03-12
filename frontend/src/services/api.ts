// src/services/api.ts

import { Question, SubmissionResponse, QuestionResponse, Results } from '../types/questions';

// This will use the relative path in production or the dev server in development
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api'  // Production: use relative path
  : 'http://127.0.0.1:5001/api';  // Development: use localhost

export const api = {
  // Fetch all questions
  async getQuestions(): Promise<{ questions: Question[], total: number }> {
    const response = await fetch(`${API_BASE_URL}/questions`);
    return response.json();
  },

  // Start new submission
  async startSubmission(name: string, email: string): Promise<SubmissionResponse> {
    const response = await fetch(`${API_BASE_URL}/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email }),
    });
    return response.json();
  },

  // Submit a question response (can be numeric or text)
  async submitResponse(data: QuestionResponse): Promise<{ status: string; message: string }> {
    const response = await fetch(`${API_BASE_URL}/submit-response`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Get results for a submission
  async getResults(submissionId: string): Promise<Results> {
    const response = await fetch(`${API_BASE_URL}/results/${submissionId}`);
    return response.json();
  },

  // Mark submission as complete
  async completeSubmission(submissionId: string): Promise<{ status: string; message: string }> {
    const response = await fetch(`${API_BASE_URL}/complete/${submissionId}`, {
      method: 'POST',
    });
    return response.json();
  },
};