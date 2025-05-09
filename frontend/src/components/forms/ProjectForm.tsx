import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';
import api from '../../utils/api';

// Updated interface to match the backend model
interface Project {
  id?: string;
  title: string;
  description: string[]; // Changed from string to string[] for bullet points
  technologies: string; // JSON in backend, string in frontend
  githubrepository?: string; // Renamed to match backend
  livelink?: string; // Renamed to match backend
}

const ProjectForm = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Updated initial values to match backend model
  const initialValues: Project = {
    title: '',
    description: [''], // Changed to array with one empty item
    technologies: '',
    githubrepository: '',
    livelink: ''
  };

  const validationSchema = Yup.object({
    title: Yup.string().required('Project title is required'),
    description: Yup.array().of(Yup.string().required('Description item cannot be empty')).min(1, 'Add at least one description bullet point'),
    technologies: Yup.string().required('Technologies used are required'),
    githubrepository: Yup.string().url('Must be a valid URL'),
    livelink: Yup.string().url('Must be a valid URL')
  });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await api.get('/projects');
        setProjects(response.data);
      } catch (err: any) {
        console.error('Failed to fetch projects:', err);
        setError(err.response?.data?.message || 'Failed to fetch projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleSubmit = async (values: Project, { resetForm }: any) => {
    try {
      setError(null);
      setSuccess(false);
      
      // Format data to match backend expectations
      const projectData = {
        ...values,
        // Convert from string to array for backend JSON fields
        description: values.description,
        technologies: values.technologies.split(',').map(tech => tech.trim())
      };
      
      let response;
      
      if (editingIndex !== null && projects[editingIndex]?.id) {
        // Update existing project
        response = await api.put(`/projects/${projects[editingIndex].id}`, projectData);
        
        const updatedProjects = [...projects];
        updatedProjects[editingIndex] = response.data;
        setProjects(updatedProjects);
      } else {
        // Create new project
        response = await api.post('/projects', projectData);
        setProjects([...projects, response.data]);
      }
      
      setSuccess(true);
      setEditingIndex(null);
      resetForm();
      
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error('Failed to save project:', err);
      setError(err.response?.data?.message || 'Failed to save project');
    }
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
  };

  const handleDelete = async (id: string, index: number) => {
    try {
      setError(null);
      await api.delete(`/projects/${id}`);
      
      const updatedProjects = [...projects];
      updatedProjects.splice(index, 1);
      setProjects(updatedProjects);
      
      if (editingIndex === index) {
        setEditingIndex(null);
      }
    } catch (err: any) {
      console.error('Failed to delete project:', err);
      setError(err.response?.data?.message || 'Failed to delete project');
    }
  };

  const handleCancel = () => {
    setEditingIndex(null);
  };

  // Format technologies for display
  const formatTechnologies = (technologies: string | string[]) => {
    if (Array.isArray(technologies)) {
      return technologies.join(', ');
    }
    return technologies;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <div className="mb-5 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
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
                <span className="block sm:inline">Project saved successfully!</span>
              </div>
            )}

            <Formik
              initialValues={editingIndex !== null ? {
                ...projects[editingIndex],
                // Convert array back to comma-separated string for editing
                technologies: Array.isArray(projects[editingIndex].technologies) ? 
                  projects[editingIndex].technologies.join(', ') : 
                  projects[editingIndex].technologies
              } : initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ values, isSubmitting }) => (
                <Form className="space-y-6">
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Project Title
                      </label>
                      <Field
                        id="title"
                        name="title"
                        type="text"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      <ErrorMessage name="title" component="div" className="text-red-500 text-xs mt-1" />
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Project Description
                      </label>
                      <p className="text-xs text-gray-500 mb-2">
                        Add bullet points describing key details and achievements of this project.
                        Use <strong>**text**</strong> format to bold important words or phrases.
                      </p>
                      
                      <FieldArray name="description">
                        {({ remove, push }) => (
                          <div>
                            {values.description.map((item, index) => (
                              <div key={index} className="flex mb-2">
                                <div className="flex-grow mr-2">
                                  <Field
                                    name={`description.${index}`}
                                    placeholder={`e.g., Implemented **feature X** that achieved Y result`}
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
                              + Add Description Point
                            </button>
                          </div>
                        )}
                      </FieldArray>
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="technologies" className="block text-sm font-medium text-gray-700">
                        Technologies Used (comma-separated)
                      </label>
                      <Field
                        id="technologies"
                        name="technologies"
                        type="text"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., React, Node.js, MongoDB"
                      />
                      <ErrorMessage name="technologies" component="div" className="text-red-500 text-xs mt-1" />
                    </div>

                    <div>
                      <label htmlFor="githubrepository" className="block text-sm font-medium text-gray-700">
                        GitHub URL (optional)
                      </label>
                      <Field
                        id="githubrepository"
                        name="githubrepository"
                        type="text"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      <ErrorMessage name="githubrepository" component="div" className="text-red-500 text-xs mt-1" />
                    </div>

                    <div>
                      <label htmlFor="livelink" className="block text-sm font-medium text-gray-700">
                        Live Project URL (optional)
                      </label>
                      <Field
                        id="livelink"
                        name="livelink"
                        type="text"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      <ErrorMessage name="livelink" component="div" className="text-red-500 text-xs mt-1" />
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {editingIndex !== null ? 'Update' : 'Add'} Project
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
                <h2 className="text-xl font-medium text-gray-900">Your Projects</h2>
                {projects.length === 0 ? (
                  <p className="text-gray-500 mt-2">No projects added yet</p>
                ) : (
                  <div className="mt-3 space-y-4">
                    {projects.map((project, index) => (
                      <div key={project.id || index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-medium">{project.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              <span className="font-medium">Technologies:</span> {formatTechnologies(project.technologies)}
                            </p>
                            <div className="mt-2">
                              <h4 className="text-sm font-medium text-gray-700">Description:</h4>
                              <ul className="list-disc list-inside text-sm text-gray-600 pl-2">
                                {Array.isArray(project.description) ? 
                                  project.description.map((item, i) => (
                                    <li key={i}>{item}</li>
                                  )) : 
                                  <li>{project.description}</li>
                                }
                              </ul>
                            </div>
                            
                            <div className="mt-2 flex space-x-3">
                              {project.githubrepository && (
                                <a 
                                  href={project.githubrepository}
                                  target="_blank"
                                  rel="noopener noreferrer" 
                                  className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                  GitHub Repo
                                </a>
                              )}
                              {project.livelink && (
                                <a 
                                  href={project.livelink}
                                  target="_blank"
                                  rel="noopener noreferrer" 
                                  className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                  Live Project
                                </a>
                              )}
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
                              onClick={() => project.id && handleDelete(project.id, index)}
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

export default ProjectForm;