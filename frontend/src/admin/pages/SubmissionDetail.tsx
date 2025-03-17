// src/admin/pages/SubmissionDetail.tsx

import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import AdminLayout from "../components/AdminLayout";
import { adminApi } from "../services/adminApi";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import StyleGraph from "../../components/StyleGraph";
import { CognitiveStyle } from "../../types/questions";

interface SubmissionDetail {
  submission_id: string;
  user_name: string;
  user_email: string;
  submission_time: string;
  is_complete: boolean;
  responses: Array<{
    question_id: string;
    numeric_response?: number;
    text_response?: string;
  }>;
}

const SubmissionDetailPage = () => {
  const { submissionId } = useParams();
  const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
  const [results, setResults] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubmissionData = async () => {
      setLoading(true);
      try {
        // Fetch submission details
        const submissionData = await adminApi.getSubmissionDetail(
          submissionId || "",
        );
        setSubmission(submissionData);

        // If complete, fetch results using the CORRECT domain
        if (submissionData.is_complete) {
          // Get the domain from the current window location
          // This will automatically use the correct domain whether in development or on Replit
          const currentDomain = window.location.origin;

          // Use the SAME domain as the current page, not hardcoded localhost
          const resultsUrl = `${currentDomain}/api/results/${submissionId}`;

          console.log(`Fetching results from: ${resultsUrl}`);

          try {
            const resultsResponse = await fetch(resultsUrl);
            if (resultsResponse.ok) {
              const resultsJson = await resultsResponse.json();
              setResults(resultsJson);
            } else {
              console.error(
                `Error fetching results: ${resultsResponse.status} ${resultsResponse.statusText}`,
              );
            }
          } catch (resultsErr) {
            console.error("Failed to load results:", resultsErr);
          }
        }
      } catch (err) {
        setError("Failed to load submission details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (submissionId) {
      fetchSubmissionData();
    }
  }, [submissionId]);

  // Helper function to convert overall_style to CognitiveStyle type
  const getCognitiveStyle = (overallStyle: string): CognitiveStyle => {
    const style = overallStyle.toLowerCase();
    if (style.includes("intuitive")) return "intuitive";
    if (style.includes("conceptual")) return "conceptual";
    if (style.includes("pragmatic")) return "pragmatic";
    if (style.includes("deductive")) return "deductive";
    return "intuitive"; // Default fallback
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <p>Loading submission details...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error || !submission) {
    return (
      <AdminLayout>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || "Submission not found"}
        </div>
      </AdminLayout>
    );
  }

  // Function to extract question number from ID
  const getQuestionNumber = (questionId: string): number => {
    return parseInt(questionId.replace(/\D/g, ""));
  };

  // Filter responses by question number range
  const numericResponses = submission.responses.filter((r) => {
    const questionNum = getQuestionNumber(r.question_id);
    return (
      questionNum >= 1 && questionNum <= 30 && r.numeric_response !== undefined
    );
  });

  const textResponses = submission.responses.filter((r) => {
    const questionNum = getQuestionNumber(r.question_id);
    return (
      questionNum >= 31 && questionNum <= 34 && r.text_response !== undefined
    );
  });

  // Sort the responses by question number
  const sortByQuestionId = (a: any, b: any) => {
    const numA = getQuestionNumber(a.question_id);
    const numB = getQuestionNumber(b.question_id);
    return numA - numB;
  };

  const sortedNumericResponses = [...numericResponses].sort(sortByQuestionId);
  const sortedTextResponses = [...textResponses].sort(sortByQuestionId);

  // For debugging
  console.log(
    "All question IDs:",
    submission.responses.map((r) => ({
      id: r.question_id,
      number: getQuestionNumber(r.question_id),
      hasNumeric: r.numeric_response !== undefined,
      hasText: r.text_response !== undefined,
    })),
  );
  console.log(
    "Filtered numeric responses (1-30):",
    sortedNumericResponses.map((r) => r.question_id),
  );
  console.log(
    "Filtered text responses (31-34):",
    sortedTextResponses.map((r) => r.question_id),
  );

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Submission Details</h1>
        <Link href="/admin/submissions">
          <a className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            Back to Submissions
          </a>
        </Link>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Name</h3>
              <p>{submission.user_name || "Anonymous"}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Email</h3>
              <p>{submission.user_email || "N/A"}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Submission Date
              </h3>
              <p>{new Date(submission.submission_time).toLocaleString()}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  submission.is_complete
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {submission.is_complete ? "Completed" : "In Progress"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Display Results if available */}
      {results && (
        <div className="space-y-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Assessment Results</CardTitle>
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
                    cognitiveStyle={getCognitiveStyle(
                      results.labels.overall_style,
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">
                    Learning Preference
                  </h3>
                  <p>
                    {results.labels.learning_strength} preference{" "}
                    {results.labels.learning_direction}
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700 mb-2">
                    Application Preference
                  </h3>
                  <p>
                    {results.labels.application_strength} preference{" "}
                    {results.labels.application_direction}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Numeric Responses */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Scale Responses (Questions 1-30)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Question ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Response
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedNumericResponses.length === 0 ? (
                  <tr>
                    <td
                      colSpan={2}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No numeric responses found.
                    </td>
                  </tr>
                ) : (
                  sortedNumericResponses.map((response) => (
                    <tr key={response.question_id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        Question {response.question_id.replace(/\D/g, "")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {response.numeric_response}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Text Responses */}
      <Card>
        <CardHeader>
          <CardTitle>Text Responses (Questions 31-34)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {sortedTextResponses.length === 0 ? (
              <p className="text-center text-gray-500">
                No text responses found.
              </p>
            ) : (
              sortedTextResponses.map((response) => (
                <div
                  key={response.question_id}
                  className="border-b pb-4 last:border-b-0 last:pb-0"
                >
                  <h3 className="font-medium text-gray-700 mb-2">
                    Question {response.question_id.replace(/\D/g, "")}
                  </h3>
                  <p className="text-gray-600 whitespace-pre-line">
                    {response.text_response || "No response provided"}
                  </p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default SubmissionDetailPage;
