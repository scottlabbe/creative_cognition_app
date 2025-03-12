import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'wouter';
import QuestionPage from './QuestionForm';
import { api } from '../services/api';
import { Question, ScaleQuestion, TextQuestion } from '../types/questions';
import { getQuestionImage } from '../types/questionImageMapping';

const QuestionWrapper: React.FC = () => {
  const { submissionId, questionIndex } = useParams();
  const [questionData, setQuestionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestionData = async () => {
      try {
        const { questions, total } = await api.getQuestions();
        const currentIndex = parseInt(questionIndex || '0');
        const currentQuestion = questions[currentIndex];
        
        // Determine if this is a text question or scale question
        // Assuming the last 4 questions are text questions
        const isTextQuestion = currentIndex >= total - 4;
        
        // Get image for the question if it exists
        const imageSrc = getQuestionImage(currentQuestion.id);
        
        setQuestionData({
          questionText: currentQuestion.question,
          questionId: currentQuestion.id,
          totalQuestions: total,
          isTextQuestion: isTextQuestion,
          imageSrc: imageSrc
        });
      } catch (error) {
        console.error('Error fetching question:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionData();
  }, [questionIndex]);

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-bg text-white font-['Inter'] flex items-center justify-center">
        <div className="text-center p-8">Loading...</div>
      </div>
    );
  }

  if (!questionData) {
    return (
      <div className="min-h-screen bg-primary-bg text-white font-['Inter'] flex items-center justify-center">
        <div className="text-center p-8">Question not found</div>
      </div>
    );
  }

  return (
    <QuestionPage
      questionText={questionData.questionText}
      questionIndex={parseInt(questionIndex || '0')}
      totalQuestions={questionData.totalQuestions}
      submissionId={submissionId || ''}
      questionId={questionData.questionId}
      isTextQuestion={questionData.isTextQuestion}
      imageSrc={questionData.imageSrc}
    />
  );
};

export default QuestionWrapper;