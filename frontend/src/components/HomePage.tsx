
import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="pt-6 text-center">
          <div className="flex justify-center mb-6">
            <img 
              src="/Untitled-1-Results%20Page%20Title%20(1).png" 
              alt="Your Creative Style" 
              className="max-w-full h-auto"
            />
          </div>

          <div className="prose prose-slate dark:prose-invert mb-6 mx-auto">
            <p className="mb-6">
              This assessment is designed to evaluate the ways in which you prefer to be creative,{' '}
              or your individual creative cognitive style.
            </p>
            
            <p className="mb-6">
              This includes a questionnaire to understand your individual preferences for learning and 
              applying knowledge, as well as open-ended exercises intended to understand your ability 
              to generate original ideas, solve problems creatively, and think flexibly.
            </p>
            
            <p className="mb-8">
              The results will offer insight into your individual creativity, to hopefully empower 
              you to tailor your approach to creative tasks, collaborate more effectively with others, 
              and ultimately, feel more comfortable applying creativity in your work or everyday life.
            </p>
          </div>

          <Button
            size="lg"
            className="mx-auto"
            asChild
          >
            <Link href="/start">Start the questionnaire</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default HomePage;
