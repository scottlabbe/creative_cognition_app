// src/types/questions.ts

export interface Question {
    id: string;
    question: string;
    scaleType?: string;
    scoreType?: string;
  }
  
  export interface ScaleQuestion extends Question {
    scaleType: string;
    scoreType: string;
  }
  
  export interface TextQuestion extends Question {
    textType: string;
  }
  
  export interface SubmissionResponse {
    submission_id: string;
    status: string;
  }
  
  export interface QuestionResponse {
    submission_id: string;
    question_id: string;
    numeric_response?: number;
    text_response?: string;
  }
  
  export interface Scores {
    learning_score: number;
    application_score: number;
  }
  
  export interface Labels {
    learning_direction: string;
    learning_strength: string;
    application_direction: string;
    application_strength: string;
    overall_style: string;
  }
  
  export interface DetailedProfile {
    style_description: string;
    preference_description: string;
    working_relationships: string;
    strengths: string[];
    weaknesses: string[];
  }
  
  export interface Results {
    scores: Scores;
    labels: Labels;
    detailed_profile: DetailedProfile;
    plot_url: string;
  }