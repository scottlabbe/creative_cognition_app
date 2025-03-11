// src/components/QuestionImage.tsx

import React from 'react';

interface QuestionImageProps {
  src: string;
  questionId: string;
}

const QuestionImage: React.FC<QuestionImageProps> = ({ src, questionId }) => {
  // Generate alt text based on the question ID
  const altText = `Image for question ${questionId}`;
  
  return (
    <div className="question-image-container my-6">
      <img 
        src={src} 
        alt={altText} 
        className="mx-auto rounded-md max-w-full max-h-[300px] object-contain shadow-md"
      />
    </div>
  );
};

export default QuestionImage;