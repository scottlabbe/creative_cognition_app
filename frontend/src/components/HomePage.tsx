import React from "react";
import { Link } from "wouter";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";

const HomePage: React.FC = () => {
  // Add a function to handle image errors
  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>,
  ) => {
    console.error("Failed to load image: /title_image.png");
    // Optionally set a fallback image
    // e.currentTarget.src = "/fallback-image.png";
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="pt-6 text-center">
          <h1 className="sr-only">Your Creative Style</h1>
          <div className="flex justify-center mb-8">
            <img
              src="/title_image.png"
              alt="Your Creative Style"
              className="max-w-full h-auto"
              title="Your Creative Style"
              onError={handleImageError}
            />
          </div>

          <div className="prose prose-slate dark:prose-invert mb-8 mx-auto text-center">
            <p className="mb-8 text-center">
              The results will offer insight into your individual creativity, to
              hopefully empower you to tailor your approach to creative tasks,
              collaborate more effectively with others, and ultimately, feel
              more comfortable applying creativity in your work or everyday
              life.
            </p>
          </div>

          <div className="flex justify-center">
            <Button size="lg" asChild>
              <Link href="/start">Start the questionnaire</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HomePage;
