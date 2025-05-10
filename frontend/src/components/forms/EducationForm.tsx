import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import api from '../../utils/api';

// Updated interface to match the backend model
interface Education {
  id?: string;
  institution: string;
  institutionLocation: string; // Renamed from location to match backend
  degree: string;
  fieldOfStudy: string; // Renamed from field to match backend
  startDate: string;
  isCurrent: boolean; // Added to match backend
  endDate?: string; // Optional if current student
}

const EducationForm = () => {
  const [educationItems, setEducationItems] = useState<Education[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const initialValues: Education = {
    institution: '',
    institutionLocation: '',
    degree: '',
    fieldOfStudy: '',
    startDate: '',
    isCurrent: false,
    endDate: ''
  };

  const validationSchema = Yup.object({
    institution: Yup.string().required('Institution name is required'),
    institutionLocation: Yup.string().required('Location is required'),
    degree: Yup.string().required('Degree is required'),
    fieldOfStudy: Yup.string().required('Field of study is required'),
    startDate: Yup.string().required('Start date is required'),
    isCurrent: Yup.boolean(),
    endDate: Yup.string().when('isCurrent', {
      is: false,
      then: (schema) => schema.required('End date is required unless currently studying'),
      otherwise: (schema) => schema.notRequired()
    })
  });

  useEffect(() => {
    const fetchEducation = async () => {
      try {
        setLoading(true);
        const response = await api.get('/education');
        setEducationItems(response.data);
      } catch (err: any) {
        console.error('Failed to fetch education:', err);
        setError(err.response?.data?.message || 'Failed to fetch education data');
      } finally {
        setLoading(false);
      }
    };

    fetchEducation();
  }, []);

  const handleSubmit = async (values: Education, { resetForm }: any) => {
    try {
      setError(null);
      setSuccess(false);
      
      // If current student, endDate can be null/undefined
      if (values.isCurrent) {
        values.endDate = undefined;
      }
      
      let response;
      
      if (editingIndex !== null && educationItems[editingIndex]?.id) {
        // Update existing education
        response = await api.put(`/education/${educationItems[editingIndex].id}`, values);
        
        const updatedEducation = [...educationItems];
        updatedEducation[editingIndex] = response.data;
        setEducationItems(updatedEducation);
      } else {
        // Create new education
        response = await api.post('/education', values);
        setEducationItems([...educationItems, response.data]);
      }
      
      setSuccess(true);
      setEditingIndex(null);
      resetForm();
      
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error('Failed to save education:', err);
      setError(err.response?.data?.message || 'Failed to save education data');
    }
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
  };

  const handleDelete = async (id: string, index: number) => {
    try {
      setError(null);
      await api.delete(`/education/${id}`);
      
      const updatedEducation = [...educationItems];
      updatedEducation.splice(index, 1);
      setEducationItems(updatedEducation);
      
      if (editingIndex === index) {
        setEditingIndex(null);
      }
    } catch (err: any) {
      console.error('Failed to delete education:', err);
      setError(err.response?.data?.message || 'Failed to delete education data');
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
              <h1 className="text-2xl font-bold text-gray-900">Education</h1>
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
                <span className="block sm:inline">Education saved successfully!</span>
              </div>
            )}

            <Formik
              initialValues={editingIndex !== null ? educationItems[editingIndex] : initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ values, isSubmitting, setFieldValue }) => (
                <Form className="space-y-6">
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label htmlFor="institution" className="block text-sm font-medium text-gray-700">
                        Institution Name
                      </label>
                      <Field
                        id="institution"
                        name="institution"
                        type="text"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Harvard University"
                      />
                      <ErrorMessage name="institution" component="div" className="text-red-500 text-xs mt-1" />
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="institutionLocation" className="block text-sm font-medium text-gray-700">
                        Location
                      </label>
                      <Field
                        id="institutionLocation"
                        name="institutionLocation"
                        type="text"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Cambridge, MA"
                      />
                      <ErrorMessage name="institutionLocation" component="div" className="text-red-500 text-xs mt-1" />
                    </div>

                    <div>
                      <label htmlFor="degree" className="block text-sm font-medium text-gray-700">
                        Degree
                      </label>
                      <Field
                        id="degree"
                        name="degree"
                        type="text"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Bachelor of Science"
                      />
                      <ErrorMessage name="degree" component="div" className="text-red-500 text-xs mt-1" />
                    </div>

                    <div>
                      <label htmlFor="fieldOfStudy" className="block text-sm font-medium text-gray-700">
                        Field of Study
                      </label>
                      <Field
                        id="fieldOfStudy"
                        name="fieldOfStudy"
                        type="text"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Computer Science"
                      />
                      <ErrorMessage name="fieldOfStudy" component="div" className="text-red-500 text-xs mt-1" />
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
                        <label htmlFor="isCurrent" className="ml-2 block text-sm text-gray-900">
                          Currently studying here
                        </label>
                      </div>
                    </div>

                    {!values.isCurrent && (
                      <div className="sm:col-span-2">
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                          End Date
                        </label>
                        <Field
                          id="endDate"
                          name="endDate"
                          type="date"
                          disabled={values.isCurrent}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                        <ErrorMessage name="endDate" component="div" className="text-red-500 text-xs mt-1" />
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {editingIndex !== null ? 'Update' : 'Add'} Education
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
                <h2 className="text-xl font-medium text-gray-900">Your Education</h2>
                {educationItems.length === 0 ? (
                  <p className="text-gray-500 mt-2">No education added yet</p>
                ) : (
                  <div className="mt-3 space-y-4">
                    {educationItems.map((education, index) => (
                      <div key={education.id || index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-medium">{education.institution}</h3>
                            <p className="text-sm text-gray-600">{education.institutionLocation}</p>
                            <p className="text-sm text-gray-700">{education.degree} in {education.fieldOfStudy}</p>
                            <p className="text-sm text-gray-600">
                              {formatDate(education.startDate)} - {education.isCurrent ? 'Present' : formatDate(education.endDate)}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(index)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => education.id && handleDelete(education.id, index)}
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

export default EducationForm;