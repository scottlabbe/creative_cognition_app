// src/admin/pages/Dashboard.tsx

import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import AdminLayout from '../components/AdminLayout';
import { adminApi } from '../services/adminApi';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

// Define types for submission objects
interface Submission {
  submission_id: string;
  user_name: string;
  user_email?: string;
  submission_time: string;
  is_complete: boolean;
}

interface DashboardStats {
  totalSubmissions: number;
  completedSubmissions: number;
  recentSubmissions: Array<Submission>;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get all submissions
        const response = await adminApi.getSubmissions();
        const allSubmissions: Submission[] = response.submissions;
        
        // Calculate stats
        const totalSubmissions = allSubmissions.length;
        const completedSubmissions = allSubmissions.filter((sub: Submission) => sub.is_complete).length;
        
        // Get 5 most recent submissions
        const recentSubmissions = allSubmissions
          .sort((a: Submission, b: Submission) => 
            new Date(b.submission_time).getTime() - new Date(a.submission_time).getTime()
          )
          .slice(0, 5);
        
        setStats({
          totalSubmissions,
          completedSubmissions,
          recentSubmissions
        });
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <p>Loading dashboard data...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{stats?.totalSubmissions}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Completed Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{stats?.completedSubmissions}</p>
            <p className="text-gray-500">
              ({Math.round((stats?.completedSubmissions || 0) / (stats?.totalSubmissions || 1) * 100)}% completion rate)
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats?.recentSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      No submissions found.
                    </td>
                  </tr>
                ) : (
                  stats?.recentSubmissions.map((submission: Submission) => (
                    <tr key={submission.submission_id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {submission.user_name || 'Anonymous'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(submission.submission_time).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          submission.is_complete 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {submission.is_complete ? 'Completed' : 'In Progress'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link href={`/admin/submissions/${submission.submission_id}`}>
                          <a className="text-indigo-600 hover:text-indigo-900">View</a>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4">
            <Link href="/admin/submissions">
              <a className="text-indigo-600 hover:text-indigo-900">
                View all submissions →
              </a>
            </Link>
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-8 flex justify-center">
        <Link href="/admin/simulator">
          <a className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
            Open Score Simulator
          </a>
        </Link>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;