import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import api from '../../utils/api';

// Interface to match backend Links model
interface Links {
  id?: string;
  github: string;
  leetcode: string;
  linkedin: string;
  portfolio: string;
}

const LinksForm = () => {
  const [links, setLinks] = useState<Links | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const initialValues: Links = {
    github: '',
    leetcode: '',
    linkedin: '',
    portfolio: ''
  };

  const validationSchema = Yup.object({
    github: Yup.string().url('Must be a valid URL').required('GitHub URL is required'),
    leetcode: Yup.string().url('Must be a valid URL').required('LeetCode URL is required'),
    linkedin: Yup.string().url('Must be a valid URL').required('LinkedIn URL is required'),
    portfolio: Yup.string().url('Must be a valid URL').required('Portfolio URL is required')
  });

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        setLoading(true);
        const response = await api.get('/links');
        if (response.data && response.data.length > 0) {
          setLinks(response.data[0]); // Assuming one links record per user
        } else {
          setLinks(null);
        }
      } catch (err: any) {
        console.error('Failed to fetch links:', err);
        setError(err.response?.data?.message || 'Failed to fetch links data');
      } finally {
        setLoading(false);
      }
    };

    fetchLinks();
  }, []);

  const handleSubmit = async (values: Links) => {
    try {
      setError(null);
      setSuccess(false);
      
      let response;
      
      if (links?.id) {
        // Update existing links
        response = await api.put(`/links/${links.id}`, values);
        setLinks(response.data);
      } else {
        // Create new links
        response = await api.post('/links', values);
        setLinks(response.data);
      }
      
      setSuccess(true);
      
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error('Failed to save links:', err);
      setError(err.response?.data?.message || 'Failed to save links data');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <div className="mb-5 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Professional Links</h1>
              <Link
                to="/dashboard"
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Back to Dashboard
              </Link>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span className="block sm:inline">Links saved successfully!</span>
              </div>
            )}

            <p className="text-gray-700 mb-4">
              Add your professional links to showcase in your resume. All fields are required.
            </p>

            {loading ? (
              <div className="text-center py-10">
                <div className="spinner-border text-blue-500" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
              </div>
            ) : (
              <Formik
                initialValues={links || initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize
              >
                {({ isSubmitting }) => (
                  <Form className="space-y-6">
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="github" className="block text-sm font-medium text-gray-700">
                          GitHub URL
                        </label>
                        <div className="mt-1">
                          <Field
                            name="github"
                            type="text"
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="https://github.com/yourusername"
                          />
                          <ErrorMessage name="github" component="div" className="text-red-500 text-xs mt-1" />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="leetcode" className="block text-sm font-medium text-gray-700">
                          LeetCode URL
                        </label>
                        <div className="mt-1">
                          <Field
                            name="leetcode"
                            type="text"
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="https://leetcode.com/yourusername"
                          />
                          <ErrorMessage name="leetcode" component="div" className="text-red-500 text-xs mt-1" />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700">
                          LinkedIn URL
                        </label>
                        <div className="mt-1">
                          <Field
                            name="linkedin"
                            type="text"
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="https://www.linkedin.com/in/yourusername"
                          />
                          <ErrorMessage name="linkedin" component="div" className="text-red-500 text-xs mt-1" />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="portfolio" className="block text-sm font-medium text-gray-700">
                          Portfolio URL
                        </label>
                        <div className="mt-1">
                          <Field
                            name="portfolio"
                            type="text"
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="https://yourportfolio.com"
                          />
                          <ErrorMessage name="portfolio" component="div" className="text-red-500 text-xs mt-1" />
                        </div>
                      </div>
                    </div>

                    <div className="pt-5">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        {isSubmitting ? 'Saving...' : 'Save Links'}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinksForm;