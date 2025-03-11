// src/admin/pages/Submissions.tsx

import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import AdminLayout from '../components/AdminLayout';
import { adminApi } from '../services/adminApi';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

// Define Submission interface directly in this file
interface Submission {
  submission_id: string;
  user_name: string;
  user_email: string;
  submission_time: string;
  is_complete: boolean;
}

interface SubmissionsResponse {
  submissions: Submission[];
}

const SubmissionsPage = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    date_from: '',
    date_to: ''
  });

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      // Filter out empty strings from filters
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );
      
      const response = await adminApi.getSubmissions(activeFilters) as SubmissionsResponse;
      setSubmissions(response.submissions || []);
    } catch (err) {
      setError('Failed to load submissions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSubmissions();
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Submissions</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFilterSubmit} className="space-y-4 md:space-y-0 md:flex md:space-x-4">
            <div className="w-full md:w-1/3 space-y-2">
              <label className="block text-sm font-medium text-gray-700" htmlFor="status">Status</label>
              <Select
                name="status"  // Add name attribute
                value={filters.status}
                onChange={handleFilterChange}  // Use onChange instead of onValueChange
                id="status"
              >
                <SelectItem value="">All</SelectItem>
                <SelectItem value="1">Completed</SelectItem>
                <SelectItem value="0">In Progress</SelectItem>
              </Select>
            </div>
            
            <div className="w-full md:w-1/3">
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                name="date_from"
                value={filters.date_from}
                onChange={handleFilterChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            
            <div className="w-full md:w-1/3">
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                name="date_to"
                value={filters.date_to}
                onChange={handleFilterChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            
            <div className="flex items-end">
              <Button type="submit">
                Apply Filters
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading submissions...</p>
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
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
                  {submissions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                        No submissions found.
                      </td>
                    </tr>
                  ) : (
                    submissions.map((submission) => (
                      <tr key={submission.submission_id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {submission.user_name || 'Anonymous'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {submission.user_email || 'N/A'}
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
          </CardContent>
        </Card>
      )}
    </AdminLayout>
  );
};

export default SubmissionsPage;