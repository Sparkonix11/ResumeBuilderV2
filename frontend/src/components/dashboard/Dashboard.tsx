import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

interface DashboardProps {
  onLogout: () => void;
}

interface SectionStatus {
  personalInfo: boolean;
  education: boolean;
  experience: boolean;  // Will be optional
  projects: boolean;
  skills: boolean;
  achievements: boolean;
  links: boolean;
}

interface UserInfo {
  name: string;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [sectionStatus, setSectionStatus] = useState<SectionStatus>({
    personalInfo: false,
    education: false,
    experience: false,
    projects: false,
    skills: false,
    achievements: false,
    links: false
  });
  
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSectionStatus = async () => {
      try {
        setLoading(true);
        
        // Fetch user info - updated to use the correct endpoint
        const userResponse = await api.get('/users/me');
        if (userResponse.data && userResponse.data.name) {
          setUserInfo({ name: userResponse.data.name });
        }
        
        // Check which sections have data - updated personal info endpoint
        const [
          personalInfoRes,
          educationRes,
          experienceRes,
          projectsRes,
          skillsRes,
          achievementsRes,
          linksRes
        ] = await Promise.all([
          api.get('/users/me').then(res => !!res.data).catch(() => false),
          api.get('/education').then(res => res.data && res.data.length > 0).catch(() => false),
          api.get('/experience').then(res => res.data && res.data.length > 0).catch(() => false),
          api.get('/projects').then(res => res.data && res.data.length > 0).catch(() => false),
          api.get('/skills').then(res => res.data && res.data.length > 0).catch(() => false), // Fixed: checking if data exists
          api.get('/achievements').then(res => res.data && res.data.length > 0).catch(() => false),
          api.get('/links').then(res => res.data && res.data.length > 0).catch(() => false) // Fixed: checking if data exists
        ]);
        
        setSectionStatus({
          personalInfo: !!personalInfoRes,
          education: !!educationRes,
          experience: !!experienceRes, 
          projects: !!projectsRes,
          skills: !!skillsRes,
          achievements: !!achievementsRes,
          links: !!linksRes
        });
      } catch (err: any) {
        console.error('Failed to fetch section status:', err);
        setError('Failed to load resume data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSectionStatus();
  }, []);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const calculateCompletionPercentage = () => {
    // Make a copy of the sections but exclude experience from the calculation
    const requiredSections = { ...sectionStatus };
    delete requiredSections.experience;
    
    const totalSections = Object.keys(requiredSections).length;
    const completedSections = Object.values(requiredSections).filter(Boolean).length;
    return Math.round((completedSections / totalSections) * 100);
  };

  const getSectionStatusClass = (isCompleted: boolean, isExperience = false) => {
    // For experience, we'll always use the completed style if it's optional
    if (isExperience) {
      return "bg-gray-50 text-gray-600 border-gray-200";
    }
    
    return isCompleted 
      ? "bg-green-100 text-green-800 border-green-200" 
      : "bg-gray-100 text-gray-800 border-gray-200";
  };

  const sections = [
    { id: 'personalInfo', name: 'Personal Information', path: '/personal-info', status: sectionStatus.personalInfo },
    { id: 'education', name: 'Education', path: '/education', status: sectionStatus.education },
    { id: 'experience', name: 'Work Experience (Optional)', path: '/experience', status: sectionStatus.experience, optional: true },
    { id: 'projects', name: 'Projects', path: '/projects', status: sectionStatus.projects },
    { id: 'skills', name: 'Skills', path: '/skills', status: sectionStatus.skills },
    { id: 'achievements', name: 'Achievements', path: '/achievements', status: sectionStatus.achievements },
    { id: 'links', name: 'Links', path: '/links', status: sectionStatus.links }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold">Resume Builder</h1>
              </div>
            </div>
            <div className="flex items-center">
              {userInfo && (
                <span className="text-gray-700 mr-4">Welcome, {userInfo.name}</span>
              )}
              <button
                onClick={handleLogout}
                className="ml-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Resume Dashboard</h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              <div className="flex flex-wrap gap-6 justify-center">
                {sections.map((section) => (
                  <Link
                    key={section.id}
                    to={section.path}
                    className={`block p-6 border rounded-lg shadow hover:shadow-md transition ${getSectionStatusClass(section.status, section.optional)}`}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">{section.name}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full 
                        ${section.optional 
                          ? 'bg-gray-100 text-gray-600' 
                          : section.status 
                            ? 'bg-green-200 text-green-800' 
                            : 'bg-gray-200 text-gray-800'
                        }`}>
                        {section.optional 
                          ? 'Optional' 
                          : section.status 
                            ? 'Completed' 
                            : 'Incomplete'}
                      </span>
                    </div>
                    <p className="mt-2 text-sm">
                      {section.optional 
                        ? 'Optional section. Click to add or edit.' 
                        : section.status 
                          ? 'Information added. Click to edit.' 
                          : 'No information added yet. Click to add.'}
                    </p>
                  </Link>
                ))}
              </div>
              
              <div className="mt-8 text-center">
                <Link
                  to="/resume-preview"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                >
                  Preview Resume
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;