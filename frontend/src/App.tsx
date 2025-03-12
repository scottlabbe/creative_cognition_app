import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "./components/ui/toaster";
import HomePage from "./components/HomePage";
import StartForm from "./components/StartForm";
import QuestionWrapper from "./components/QuestionWrapper";
import ResultsPage from "./components/Results";

// Import admin components
import { AdminAuthProvider } from "./admin/hooks/useAdminAuth";
import ProtectedRoute from "./admin/components/ProtectedRoute";
import AdminLoginPage from "./admin/pages/AdminLogin";
import AdminDashboard from "./admin/pages/Dashboard";
import SubmissionsPage from "./admin/pages/Submissions";
import SubmissionDetailPage from "./admin/pages/SubmissionDetail";
import ScoreSimulator from "./admin/pages/Simulator";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={HomePage} />
      <Route path="/start" component={StartForm} />
      <Route 
        path="/question/:submissionId/:questionIndex" 
        component={QuestionWrapper}
      />
      <Route path="/results/:submissionId" component={ResultsPage} />
      
      {/* Admin routes */}
      <Route path="/admin/login" component={AdminLoginPage} />
      
      {/* Protected admin routes */}
      <Route path="/admin">
        {() => (
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/admin/submissions">
        {() => (
          <ProtectedRoute>
            <SubmissionsPage />
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/admin/submissions/:submissionId">
        {(params) => (
          <ProtectedRoute>
            <SubmissionDetailPage />
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/admin/simulator">
        {() => (
          <ProtectedRoute>
            <ScoreSimulator />
          </ProtectedRoute>
        )}
      </Route>
      
      {/* 404 route */}
      <Route>404, Not Found!</Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminAuthProvider>
        <Router />
        <Toaster />
      </AdminAuthProvider>
    </QueryClientProvider>
  );
}

export default App;