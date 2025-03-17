// src/admin/pages/Simulator.tsx

import { useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { adminApi } from "../services/adminApi";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import StyleGraph from "../../components/StyleGraph";
import { CreativeTypeIcon } from "../../components/CreativeTypeIcon";
import FormattedText from "../../components/FormattedText";
import { Results, CognitiveStyle } from "../../types/questions";

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
      const data = await adminApi.simulateResults(
        learningScore,
        applicationScore,
      );
      setResults(data);
    } catch (err) {
      setError("Failed to generate simulation results");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper function to convert overall_style to CognitiveStyle type
  const getCognitiveStyle = (overallStyle: string): CognitiveStyle => {
    const style = overallStyle?.toLowerCase() || "";
    if (style.includes("intuitive")) return "intuitive";
    if (style.includes("conceptual")) return "conceptual";
    if (style.includes("pragmatic")) return "pragmatic";
    if (style.includes("deductive")) return "deductive";
    return "intuitive"; // Default fallback
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
              <Button onClick={handleSimulate} disabled={loading}>
                {loading ? "Simulating..." : "Simulate Results"}
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
          <Card className="border border-bronze shadow-md">
            <CardContent className="p-6 space-y-8">
              <div className="space-y-6">
                <h1 className="text-center text-3xl text-primary font-bold">
                  Your Creative Style
                </h1>

                <div className="flex flex-col items-center w-full gap-3">
                  <CreativeTypeIcon
                    style={getCognitiveStyle(results.labels.overall_style)}
                    size={75}
                  />
                  <span className="text-xl font-semibold uppercase text-center">
                    {results.labels.overall_style}
                  </span>
                </div>

                <p className="text-muted-foreground text-center max-w-3xl">
                  {results.detailed_profile.style_description}
                </p>

                {/* Flex container for graph and preferences */}
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Graph on the left */}
                  <div className="md:w-1/2">
                    <StyleGraph
                      learningScore={results.scores.learning_score}
                      applicationScore={results.scores.application_score}
                      cognitiveStyle={getCognitiveStyle(
                        results.labels.overall_style,
                      )}
                    />
                  </div>

                  {/* Preference boxes stacked on the right */}
                  <div className="md:w-1/2 space-y-4">
                    {/* Learning preference card */}
                    <Card className="border border-bronze shadow-md">
                      <CardContent className="pt-6">
                        <h3 className="text-lg font-semibold mb-2 text-primary">
                          You have a {results.labels.learning_strength}{" "}
                          preference to learn through{" "}
                          {results.labels.learning_direction}
                        </h3>
                        <p className="text-muted-foreground">
                          {results.detailed_profile.preference_description}
                        </p>
                      </CardContent>
                    </Card>

                    {/* Application preference card */}
                    <Card className="border border-bronze shadow-md">
                      <CardContent className="pt-6">
                        <h3 className="text-lg font-semibold mb-2 text-primary">
                          You have a {results.labels.application_strength}{" "}
                          preference to apply knowledge for{" "}
                          {results.labels.application_direction}
                        </h3>
                        <p className="text-muted-foreground">
                          {
                            results.detailed_profile
                              .application_preference_description
                          }
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>

              {/* Strengths Card */}
              <Card className="border border-bronze shadow-md">
                <CardHeader>
                  <CardTitle className="text-primary">Strengths</CardTitle>
                </CardHeader>
                <CardContent>
                  {results.detailed_profile.strengths.map((strength, index) => (
                    <FormattedText key={index} text={strength} />
                  ))}
                </CardContent>
              </Card>

              {/* Watch-Outs Card */}
              <Card className="border border-bronze shadow-md">
                <CardHeader>
                  <CardTitle className="text-primary">Watch-Outs</CardTitle>
                </CardHeader>
                <CardContent>
                  {results.detailed_profile.weaknesses.map(
                    (weakness, index) => (
                      <FormattedText key={index} text={weakness} />
                    ),
                  )}
                </CardContent>
              </Card>

              {/* Collaboration Guide */}
              <Card className="border border-bronze shadow-md">
                <CardHeader>
                  <CardTitle className="text-primary">
                    Collaboration Guide
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold mb-4 text-primary">
                      Working with Others
                    </h3>

                    {/* Intuitive Types Card */}
                    <Card className="border border-bronze shadow-md">
                      <CardHeader className="pb-2">
                        <h4 className="font-medium flex items-center gap-2">
                          <span className="flex items-center">
                            <CreativeTypeIcon style={"intuitive"} size={40} />
                          </span>
                          With Intuitive Types
                        </h4>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground whitespace-pre-line">
                          {results.detailed_profile.working_relationships
                            ?.intuitives || ""}
                        </p>
                      </CardContent>
                    </Card>

                    {/* Conceptual Types Card */}
                    <Card className="border border-bronze shadow-md">
                      <CardHeader className="pb-2">
                        <h4 className="font-medium flex items-center gap-2">
                          <span className="flex items-center">
                            <CreativeTypeIcon style={"conceptual"} size={40} />
                          </span>
                          With Conceptual Types
                        </h4>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground whitespace-pre-line">
                          {results.detailed_profile.working_relationships
                            ?.conceptuals || ""}
                        </p>
                      </CardContent>
                    </Card>

                    {/* Pragmatic Types Card */}
                    <Card className="border border-bronze shadow-md">
                      <CardHeader className="pb-2">
                        <h4 className="font-medium flex items-center gap-2">
                          <span className="flex items-center">
                            <CreativeTypeIcon style={"pragmatic"} size={40} />
                          </span>
                          With Pragmatic Types
                        </h4>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground whitespace-pre-line">
                          {results.detailed_profile.working_relationships
                            ?.pragmatists || ""}
                        </p>
                      </CardContent>
                    </Card>

                    {/* Deductive Types Card */}
                    <Card className="border border-bronze shadow-md">
                      <CardHeader className="pb-2">
                        <h4 className="font-medium flex items-center gap-2">
                          <span className="flex items-center">
                            <CreativeTypeIcon style={"deductive"} size={40} />
                          </span>
                          With Deductive Types
                        </h4>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground whitespace-pre-line">
                          {results.detailed_profile.working_relationships
                            ?.deductives || ""}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              {/* Print Button */}
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={handlePrint}
                  variant="outline"
                  className="border-[#016D77] text-primary hover:bg-[#016D77] hover:text-white"
                >
                  Print Simulation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
};

export default ScoreSimulator;
