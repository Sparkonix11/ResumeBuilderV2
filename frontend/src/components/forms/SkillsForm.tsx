import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import api from '../../utils/api';

// Define a type that matches the backend Skills model structure
interface Skills {
  id?: string;
  Languages?: string[];
  Visualization?: string[];
  Cloud?: string[];
  Frameworks?: string[];
  Database?: string[];
  Tools?: string[];
  Webdevelopment?: string[];
}

// Available skill categories that match backend model fields
const SKILL_CATEGORIES = [
  'Languages',
  'Visualization',
  'Cloud',
  'Frameworks',
  'Database',
  'Tools',
  'Webdevelopment'
];

const CATEGORY_DISPLAY_NAMES: {[key: string]: string} = {
  'Languages': 'Languages',
  'Visualization': 'Data Analysis & Visualization',
  'Cloud': 'Cloud',
  'Frameworks': 'Frameworks & Libraries',
  'Database': 'Database',
  'Tools': 'Tools & Technologies',
  'Webdevelopment': 'Web Development'
};

const SkillsForm = () => {
  const [skills, setSkills] = useState<Skills | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [currentCategory, setCurrentCategory] = useState('Languages');
  const [currentSkill, setCurrentSkill] = useState('');

  // Initial values that match the backend structure
  const initialValues: Skills = {
    Languages: [],
    Visualization: [],
    Cloud: [],
    Frameworks: [],
    Database: [],
    Tools: [],
    Webdevelopment: []
  };

  const validationSchema = Yup.object({
    Languages: Yup.array().of(Yup.string()),
    Visualization: Yup.array().of(Yup.string()),
    Cloud: Yup.array().of(Yup.string()),
    Frameworks: Yup.array().of(Yup.string()),
    Database: Yup.array().of(Yup.string()),
    Tools: Yup.array().of(Yup.string()),
    Webdevelopment: Yup.array().of(Yup.string())
  });

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setLoading(true);
        const response = await api.get('/skills');
        if (response.data && response.data.length > 0) {
          setSkills(response.data[0]); // Assuming one skills record per user
        } else {
          setSkills(null);
        }
      } catch (err: any) {
        console.error('Failed to fetch skills:', err);
        setError(err.response?.data?.message || 'Failed to fetch skills data');
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  const handleSubmit = async (values: Skills) => {
    try {
      setError(null);
      setSuccess(false);
      
      let response;
      
      if (skills?.id) {
        // Update existing skills
        response = await api.put(`/skills/${skills.id}`, values);
        setSkills(response.data);
      } else {
        // Create new skills
        response = await api.post('/skills', values);
        setSkills(response.data);
      }
      
      setSuccess(true);
      
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error('Failed to save skills:', err);
      setError(err.response?.data?.message || 'Failed to save skills data');
    }
  };

  const handleAddSkill = (values: Skills, setFieldValue: any) => {
    if (!currentSkill.trim()) return;

    const currentSkills = values[currentCategory as keyof Skills] as string[] || [];
    if (!currentSkills.includes(currentSkill.trim())) {
      setFieldValue(currentCategory, [...currentSkills, currentSkill.trim()]);
      setCurrentSkill('');
    }
  };

  const handleRemoveSkill = (category: string, skillIndex: number, values: Skills, setFieldValue: any) => {
    const currentSkills = values[category as keyof Skills] as string[] || [];
    const updatedSkills = [...currentSkills];
    updatedSkills.splice(skillIndex, 1);
    setFieldValue(category, updatedSkills);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <div className="mb-5 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Skills</h1>
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
                <span className="block sm:inline">Skills saved successfully!</span>
              </div>
            )}

            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-blue-500" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
              </div>
            ) : (
              <Formik
                initialValues={skills || initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize
              >
                {({ values, isSubmitting, setFieldValue }) => (
                  <Form className="space-y-6">
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-6">
                        <p className="text-sm text-gray-500 mb-4">
                          Organize your skills by categories. Select a category and add your skills below.
                        </p>
                        
                        <div className="mb-4">
                          <label htmlFor="currentCategory" className="block text-sm font-medium text-gray-700">
                            Select Category
                          </label>
                          <select
                            id="currentCategory"
                            value={currentCategory}
                            onChange={(e) => setCurrentCategory(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                          >
                            {SKILL_CATEGORIES.map((category) => (
                              <option key={category} value={category}>
                                {CATEGORY_DISPLAY_NAMES[category]}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex">
                          <input
                            type="text"
                            value={currentSkill}
                            onChange={(e) => setCurrentSkill(e.target.value)}
                            placeholder={`Add a new ${CATEGORY_DISPLAY_NAMES[currentCategory]} skill`}
                            className="flex-grow mt-1 block w-full border border-gray-300 rounded-l-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddSkill(values, setFieldValue)}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-r-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Add
                          </button>
                        </div>
                      </div>

                      {/* Display all categories and skills */}
                      {SKILL_CATEGORIES.map((category) => (
                        <div key={category} className="sm:col-span-6">
                          <h3 className="text-lg font-medium text-gray-900 mb-2">{CATEGORY_DISPLAY_NAMES[category]}</h3>
                          <div className="flex flex-wrap gap-2">
                            {(values[category as keyof Skills] as string[] || []).map((skill, index) => (
                              <div 
                                key={index} 
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                              >
                                {skill}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSkill(category, index, values, setFieldValue)}
                                  className="ml-1.5 text-blue-600 hover:text-blue-800 focus:outline-none"
                                >
                                  &times;
                                </button>
                              </div>
                            ))}
                            {(values[category as keyof Skills] as string[] || []).length === 0 && (
                              <p className="text-sm text-gray-500">No {category.toLowerCase()} skills added yet</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Save Skills
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

export default SkillsForm;