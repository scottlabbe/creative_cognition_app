import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="pt-6">
          <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Creative Cognitive Style Assessment
          </h1>
          <h2 className="text-2xl font-medium mb-6">How am I Creative?</h2>

          <div className="prose prose-slate dark:prose-invert mb-6">
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
            className="w-full sm:w-auto"
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