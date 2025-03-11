import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Progress } from '../components/ui/progress';
import { Card, CardContent } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import { api } from '../services/api';
import { QuestionResponse } from '../types/questions';
import QuestionImage from './QuestionImage';

interface QuestionPageProps {
  questionText: string;
  questionIndex: number;
  totalQuestions: number;
  submissionId: string;
  questionId: string;
  isTextQuestion: boolean;
  imageSrc?: string;  // Optional image source
}

const QuestionPage: React.FC<QuestionPageProps> = ({
  questionText,
  questionIndex,
  totalQuestions,
  submissionId,
  questionId,
  isTextQuestion,
  imageSrc
}) => {
  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const [textResponse, setTextResponse] = useState<string>('');
  const [, navigate] = useLocation();

  useEffect(() => {
    // Reset inputs when question changes
    setSelectedValue(null);
    setTextResponse('');
  }, [questionIndex]);

  const handleSelectButton = (value: number) => {
    setSelectedValue(value);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextResponse(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // For scale questions, validate numeric response
    if (!isTextQuestion && selectedValue === null) return;
    
    // For text questions, validate text response
    if (isTextQuestion && textResponse.trim() === '') return;

    try {
      // Create the response object with the correct type
      const responseData: QuestionResponse = {
        submission_id: submissionId,
        question_id: questionId
      };
      
      // Add the appropriate response type
      if (isTextQuestion) {
        responseData.text_response = textResponse;
      } else if (selectedValue !== null) {
        responseData.numeric_response = selectedValue;
      }

      // Submit the response
      await api.submitResponse(responseData);

      if (questionIndex + 1 < totalQuestions) {
        navigate(`/question/${submissionId}/${questionIndex + 1}`);
      } else {
        // Complete the submission and navigate to results
        await api.completeSubmission(submissionId);
        navigate(`/results/${submissionId}`);
      }
    } catch (error) {
      console.error('Error submitting response:', error);
    }
  };

  const progress = ((questionIndex + 1) / totalQuestions) * 100;

  return (
    <div className="min-h-screen bg-background flex items-center p-4">
      <div className="max-w-2xl mx-auto w-full">
        <Progress value={progress} className="mb-8" />
  
        <Card>
          <CardContent className="pt-6">
            <header className="text-center mb-8">
              {/* Removed question number display */}
              <p className="text-xl mb-4 font-sans">{questionText}</p>
              
              {/* Display image if available */}
              {imageSrc && (
                <QuestionImage src={imageSrc} questionId={questionId} />
              )}
            </header>
  
            <form onSubmit={handleSubmit}>
              <div className="space-y-8">
                {isTextQuestion ? (
                  // Text question input
                  <div className="relative">
                    <Textarea 
                      placeholder="Type your answer here..."
                      value={textResponse}
                      onChange={handleTextChange}
                      className="min-h-[150px]"
                    />
                  </div>
                ) : (
                  // Scale question input with redesigned structure
                  <div className="relative">
                    <div className="grid grid-cols-7 gap-4 mb-2">
                      {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                        <div key={value} className="flex flex-col items-center">
                          <button
                            type="button"
                            onClick={() => handleSelectButton(value)}
                            className={`scale-button ${
                              selectedValue === value ? 'selected' : ''
                            }`}
                          >
                            {value}
                          </button>
                          
                          {/* Add labels under only the first and last buttons */}
                          {value === 1 && (
                            <div className="text-center text-sm text-muted-foreground mt-2">
                              Strongly<br />Disagree
                            </div>
                          )}
                          {value === 7 && (
                            <div className="text-center text-sm text-muted-foreground mt-2">
                              Strongly<br />Agree
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
  
                {/* Submit button */}
                <div className="flex justify-between pt-6">
                  <button
                    type="button"
                    onClick={() => navigate(`/question/${submissionId}/${Math.max(0, questionIndex - 1)}`)}
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium text-lg transition-colors"
                    disabled={questionIndex === 0}
                  >
                    Previous
                  </button>
                  <button
                    type="submit"
                    disabled={isTextQuestion ? textResponse.trim() === '' : selectedValue === null}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-lg font-medium text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {questionIndex + 1 === totalQuestions ? 'Submit' : 'Next'}
                  </button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuestionPage;