// src/admin/pages/Simulator.tsx

import { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { adminApi } from '../services/adminApi';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import StyleGraph from '../../components/StyleGraph';
import { Results, CognitiveStyle } from '../../types/questions';

const ScoreSimulator = () => {
  const [learningScore, setLearningScore] = useState<number>(0);
  const [applicationScore, setApplicationScore] = useState<number>(0);
  const [results, setResults] = useState<Results | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSimulate = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await adminApi.simulateResults(learningScore, applicationScore);
      setResults(data);
    } catch (err) {
      setError('Failed to generate simulation results');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to convert overall_style to CognitiveStyle type
  const getCognitiveStyle = (overallStyle: string): CognitiveStyle => {
    const style = overallStyle.toLowerCase();
    if (style.includes('intuitive')) return 'intuitive';
    if (style.includes('conceptual')) return 'conceptual';
    if (style.includes('pragmatic')) return 'pragmatic';
    if (style.includes('deductive')) return 'deductive';
    return 'intuitive'; // Default fallback
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Score Simulator</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Adjust Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Learning Score ({learningScore})
              </label>
              <input
                type="range"
                min="-30"
                max="30"
                value={learningScore}
                onChange={(e) => setLearningScore(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Theory/Contemplation (-30)</span>
                <span>Experience/Hands-on (+30)</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Application Score ({applicationScore})
              </label>
              <input
                type="range"
                min="-30"
                max="30"
                value={applicationScore}
                onChange={(e) => setApplicationScore(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Production (-30)</span>
                <span>Ideation (+30)</span>
              </div>
            </div>
            
            <div className="flex justify-center">
              <Button 
                onClick={handleSimulate}
                disabled={loading}
              >
                {loading ? 'Simulating...' : 'Simulate Results'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {results && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Simulation Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center mb-6">
                <h2 className="text-xl font-bold mb-4">
                  {results.labels.overall_style}
                </h2>
                
                <div className="w-full max-w-md">
                  <StyleGraph 
                    learningScore={results.scores.learning_score}
                    applicationScore={results.scores.application_score}
                    cognitiveStyle={getCognitiveStyle(results.labels.overall_style)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Learning Preference</h3>
                  <p>
                    {results.labels.learning_strength} preference {results.labels.learning_direction}
                  </p>
                  {results.detailed_profile.preference_description && (
                    <p className="mt-2 text-sm text-gray-600">
                      {results.detailed_profile.preference_description}
                    </p>
                  )}
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Application Preference</h3>
                  <p>
                    {results.labels.application_strength} preference {results.labels.application_direction}
                  </p>
                  {results.detailed_profile.application_preference_description && (
                    <p className="mt-2 text-sm text-gray-600">
                      {results.detailed_profile.application_preference_description}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Style Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">{results.detailed_profile.style_description}</p>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Strengths</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2">
                  {results.detailed_profile.strengths.map((strength, index) => (
                    <li key={index}>{strength}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Weaknesses</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2">
                  {results.detailed_profile.weaknesses.map((weakness, index) => (
                    <li key={index}>{weakness}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ScoreSimulator;