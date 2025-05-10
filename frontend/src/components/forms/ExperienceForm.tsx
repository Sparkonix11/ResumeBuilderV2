import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';
import api from '../../utils/api';

// Updated interface to match the backend model
interface Experience {
  id?: string;
  companyName: string; // Renamed from company to match backend
  companyLocation: string; // Renamed from location to match backend
  position: string;
  startDate: string;
  isCurrent: boolean; // Renamed from current to match backend
  endDate?: string;
  description: string[]; // Backend stores as JSON
}

const ExperienceForm = () => {
  const [experienceItems, setExperienceItems] = useState<Experience[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const initialValues: Experience = {
    companyName: '',
    companyLocation: '',
    position: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: ['']
  };

  const validationSchema = Yup.object({
    companyName: Yup.string().required('Company name is required'),
    companyLocation: Yup.string().required('Location is required'),
    position: Yup.string().required('Position is required'),
    startDate: Yup.string().required('Start date is required'),
    isCurrent: Yup.boolean(),
    endDate: Yup.string().when('isCurrent', {
      is: false,
      then: (schema) => schema.required('End date is required unless currently working here'),
      otherwise: (schema) => schema.notRequired()
    }),
    description: Yup.array().of(Yup.string().required('Responsibility cannot be empty')).min(1, 'Add at least one responsibility')
  });

  useEffect(() => {
    const fetchExperience = async () => {
      try {
        setLoading(true);
        const response = await api.get('/experience');
        setExperienceItems(response.data);
      } catch (err: any) {
        console.error('Failed to fetch experience:', err);
        setError(err.response?.data?.message || 'Failed to fetch experience data');
      } finally {
        setLoading(false);
      }
    };

    fetchExperience();
  }, []);

  const handleSubmit = async (values: Experience, { resetForm }: any) => {
    try {
      setError(null);
      setSuccess(false);
      
      // Filter out empty descriptions
      const cleanedValues = {
        ...values,
        description: values.description.filter(r => r.trim() !== '')
      };
      
      // If currently employed, endDate can be null/undefined
      if (cleanedValues.isCurrent) {
        cleanedValues.endDate = undefined;
      }
      
      let response;
      
      if (editingIndex !== null && experienceItems[editingIndex]?.id) {
        // Update existing experience
        response = await api.put(`/experience/${experienceItems[editingIndex].id}`, cleanedValues);
        
        const updatedExperience = [...experienceItems];
        updatedExperience[editingIndex] = response.data;
        setExperienceItems(updatedExperience);
      } else {
        // Create new experience
        response = await api.post('/experience', cleanedValues);
        setExperienceItems([...experienceItems, response.data]);
      }
      
      setSuccess(true);
      setEditingIndex(null);
      resetForm();
      
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error('Failed to save experience:', err);
      setError(err.response?.data?.message || 'Failed to save experience data');
    }
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
  };

  const handleDelete = async (id: string, index: number) => {
    try {
      setError(null);
      await api.delete(`/experience/${id}`);
      
      const updatedExperience = [...experienceItems];
      updatedExperience.splice(index, 1);
      setExperienceItems(updatedExperience);
      
      if (editingIndex === index) {
        setEditingIndex(null);
      }
    } catch (err: any) {
      console.error('Failed to delete experience:', err);
      setError(err.response?.data?.message || 'Failed to delete experience data');
    }
  };

  const handleCancel = () => {
    setEditingIndex(null);
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Present';
    
    const date = new Date(dateString);
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <div className="mb-5 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Work Experience</h1>
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
                <span className="block sm:inline">Experience saved successfully!</span>
              </div>
            )}

            <Formik
              initialValues={editingIndex !== null ? experienceItems[editingIndex] : initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ values, isSubmitting, setFieldValue }) => (
                <Form className="space-y-6">
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                        Company Name
                      </label>
                      <Field
                        id="companyName"
                        name="companyName"
                        type="text"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Google Inc."
                      />
                      <ErrorMessage name="companyName" component="div" className="text-red-500 text-xs mt-1" />
                    </div>

                    <div>
                      <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                        Position
                      </label>
                      <Field
                        id="position"
                        name="position"
                        type="text"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Software Engineer"
                      />
                      <ErrorMessage name="position" component="div" className="text-red-500 text-xs mt-1" />
                    </div>

                    <div>
                      <label htmlFor="companyLocation" className="block text-sm font-medium text-gray-700">
                        Location
                      </label>
                      <Field
                        id="companyLocation"
                        name="companyLocation"
                        type="text"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Mountain View, CA"
                      />
                      <ErrorMessage name="companyLocation" component="div" className="text-red-500 text-xs mt-1" />
                    </div>

                    <div className="sm:col-span-1">
                      <div className="flex items-center mt-8">
                        <Field
                          id="isCurrent"
                          name="isCurrent"
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setFieldValue('isCurrent', e.target.checked);
                            if (e.target.checked) {
                              setFieldValue('endDate', '');
                            }
                          }}
                        />
                        <label htmlFor="isCurrent" className="ml-2 block text-sm text-gray-700">
                          I currently work here
                        </label>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                        Start Date
                      </label>
                      <Field
                        id="startDate"
                        name="startDate"
                        type="date"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      <ErrorMessage name="startDate" component="div" className="text-red-500 text-xs mt-1" />
                    </div>

                    {!values.isCurrent && (
                      <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                          End Date
                        </label>
                        <Field
                          id="endDate"
                          name="endDate"
                          type="date"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          disabled={values.isCurrent}
                        />
                        <ErrorMessage name="endDate" component="div" className="text-red-500 text-xs mt-1" />
                      </div>
                    )}

                    <div className="sm:col-span-2">
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Responsibilities & Achievements
                      </label>
                      <p className="text-xs text-gray-500 mb-2">
                        Add bullet points describing your responsibilities and achievements at this position.
                        Use <strong>**text**</strong> format to bold important words or phrases.
                      </p>
                      
                      <FieldArray name="description">
                        {({ remove, push }) => (
                          <div>
                            {values.description.map((_, index) => (
                              <div key={index} className="flex mb-2">
                                <div className="flex-grow mr-2">
                                  <Field
                                    name={`description.${index}`}
                                    placeholder={`e.g., Developed a **key feature** that increased user engagement by 20%`}
                                    type="text"
                                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                  />
                                  <ErrorMessage
                                    name={`description.${index}`}
                                    component="div"
                                    className="text-red-500 text-xs mt-1"
                                  />
                                </div>
                                <button
                                  type="button"
                                  className="inline-flex items-center p-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                                  onClick={() => {
                                    if (values.description.length > 1) {
                                      remove(index);
                                    }
                                  }}
                                >
                                  -
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                              onClick={() => push('')}
                            >
                              + Add Responsibility
                            </button>
                          </div>
                        )}
                      </FieldArray>
                    </div>
                  </div>

                  <div className="flex space-x-3 mt-6">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {editingIndex !== null ? 'Update' : 'Add'} Experience
                    </button>

                    {editingIndex !== null && (
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </Form>
              )}
            </Formik>

            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-blue-500" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
              </div>
            ) : (
              <div className="mt-8">
                <h2 className="text-xl font-medium text-gray-900">Your Experience</h2>
                {experienceItems.length === 0 ? (
                  <p className="text-gray-500 mt-2">No work experience added yet</p>
                ) : (
                  <div className="mt-3 space-y-4">
                    {experienceItems.map((experience, index) => (
                      <div key={experience.id || index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-medium">{experience.companyName}</h3>
                            <p className="text-sm text-gray-600">{experience.position}</p>
                            <p className="text-sm text-gray-600">{experience.companyLocation}</p>
                            <p className="text-sm text-gray-600">
                              {formatDate(experience.startDate)} - {experience.isCurrent ? 'Present' : formatDate(experience.endDate)}
                            </p>
                            <div className="mt-2">
                              <h4 className="text-sm font-medium text-gray-700">Responsibilities:</h4>
                              <ul className="list-disc list-inside text-sm text-gray-600 pl-2">
                                {experience.description.map((item, i) => (
                                  <li key={i}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(index)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => experience.id && handleDelete(experience.id, index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperienceForm;