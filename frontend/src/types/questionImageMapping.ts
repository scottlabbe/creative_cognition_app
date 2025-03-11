const baseUrl = process.env.PUBLIC_URL || '';

// Map question IDs to their corresponding image paths
export const questionImageMapping: Record<string, string> = {
  'Q31': '/brick.jpg',
  'Q32': '/dishes.jpg',
  'Q33': '/mug.jpeg',
  'Q34': '/crowd.jpg'
};

// Helper function to get image for a question
export const getQuestionImage = (questionId: string): string | undefined => {
  return questionImageMapping[questionId];
};