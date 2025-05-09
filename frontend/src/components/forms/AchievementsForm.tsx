import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';
import api from '../../utils/api';

// Define interface to match backend model
interface Achievement {
  id?: string;
  text: string[];
}

const AchievementsForm = () => {
  const [achievements, setAchievements] = useState<Achievement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState('');

  // Initial values matching the backend structure
  const initialValues: Achievement = {
    text: []
  };

  const validationSchema = Yup.object({
    text: Yup.array().of(
      Yup.string().required('Achievement text is required')
    )
  });

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setLoading(true);
        const response = await api.get('/achievements');
        if (response.data && response.data.length > 0) {
          setAchievements(response.data[0]); // Assuming one achievement record per user
        } else {
          setAchievements(null);
        }
      } catch (err: any) {
        console.error('Failed to fetch achievements:', err);
        setError(err.response?.data?.message || 'Failed to fetch achievements data');
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  const handleSubmit = async (values: Achievement) => {
    try {
      setError(null);
      setSuccess(false);
      
      let response;
      
      if (achievements?.id) {
        // Update existing achievements
        response = await api.put(`/achievements/${achievements.id}`, values);
        setAchievements(response.data);
      } else {
        // Create new achievements
        response = await api.post('/achievements', values);
        setAchievements(response.data);
      }
      
      setSuccess(true);
      
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error('Failed to save achievements:', err);
      setError(err.response?.data?.message || 'Failed to save achievements data');
    }
  };

  const handleAddAchievement = (values: Achievement, setFieldValue: any) => {
    if (!currentAchievement.trim()) return;
    
    setFieldValue('text', [...values.text, currentAchievement.trim()]);
    setCurrentAchievement('');
  };

  const handleRemoveAchievement = (index: number, values: Achievement, setFieldValue: any) => {
    const updatedAchievements = [...values.text];
    updatedAchievements.splice(index, 1);
    setFieldValue('text', updatedAchievements);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <div className="mb-5 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Achievements</h1>
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
                <span className="block sm:inline">Achievements saved successfully!</span>
              </div>
            )}
            
            <p className="text-gray-700 mb-4">
              Add significant achievements, awards, or other accomplishments to highlight in your resume.
            </p>

            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-blue-500" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
              </div>
            ) : (
              <Formik
                initialValues={achievements || initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize
              >
                {({ values, isSubmitting, setFieldValue }) => (
                  <Form className="space-y-6">
                    <div className="grid grid-cols-1 gap-y-6">
                      <div>
                        <label htmlFor="new-achievement" className="block text-sm font-medium text-gray-700">
                          Add Achievement
                        </label>
                        <p className="text-xs text-gray-500 mb-2">
                          Use <strong>**text**</strong> format to bold important words or phrases (e.g., "Received **Best Paper Award** at the conference").
                        </p>
                        <div className="mt-1 flex rounded-md shadow-sm">
                          <input
                            type="text"
                            id="new-achievement"
                            value={currentAchievement}
                            onChange={(e) => setCurrentAchievement(e.target.value)}
                            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="E.g., Received **Dean's List** recognition for academic excellence"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddAchievement(values, setFieldValue)}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-r-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Your Achievements</h3>
                        {values.text.length === 0 ? (
                          <p className="text-gray-500">No achievements added yet</p>
                        ) : (
                          <ul className="divide-y divide-gray-200">
                            {values.text.map((achievement, index) => (
                              <li key={index} className="py-3 flex justify-between items-center">
                                <div className="text-sm text-gray-800">{achievement}</div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveAchievement(index, values, setFieldValue)}
                                  className="ml-2 text-red-600 hover:text-red-800"
                                >
                                  Remove
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>

                    <div>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Save Achievements
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

export default AchievementsForm;