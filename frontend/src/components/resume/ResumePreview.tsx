import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  linkedin?: string;
  github?: string;
  website?: string;
  leetcode?: string; // Added to fix TS2339 error
}

interface Education {
  institution: string;
  location: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa?: string;
}

interface Experience {
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  responsibilities: string[];
}

interface Project {
  title: string;
  technologies: string;
  description: string;
  highlights: string[];
  githubUrl?: string;
  liveUrl?: string;
}

interface SkillCategory {
  name: string;
  skills: string[];
}

interface Achievement {
  title: string;
  description: string;
}

interface ResumeData {
  personalInfo: PersonalInfo;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  skills: { categories: SkillCategory[] };
  achievements: Achievement[];
}

const ResumePreview = () => {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [latexCode, setLatexCode] = useState<string>('');
  const [missingSections, setMissingSections] = useState<string[]>([]);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [selectedProjects, setSelectedProjects] = useState<{ [id: string]: boolean }>({});
  const [selectedExperiences, setSelectedExperiences] = useState<{ [id: string]: boolean }>({});
  const [showSelectionOptions, setShowSelectionOptions] = useState<boolean>(false);

  const CATEGORY_DISPLAY_NAMES: {[key: string]: string} = {
    'Languages': 'Languages',
    'Visualization': 'Data Analysis & Visualization',
    'Cloud': 'Cloud',
    'Frameworks': 'Frameworks & Libraries',
    'Database': 'Database',
    'Tools': 'Tools & Technologies',
    'Webdevelopment': 'Web Development'
  };

  useEffect(() => {
    const fetchResumeData = async () => {
      try {
        setLoading(true);
        setError(null);
        setMissingSections([]);
        
        const missing: string[] = [];
        const data: ResumeData = {
          personalInfo: {} as PersonalInfo,
          education: [],
          experience: [],
          projects: [],
          skills: { categories: [] },
          achievements: []
        };

        // First fetch personal info - this is required
        try {
          const personalInfoRes = await api.get('/users/me');
          if (personalInfoRes.data) {
            data.personalInfo = {
              name: personalInfoRes.data.name || '',
              email: personalInfoRes.data.email || '',
              phone: personalInfoRes.data.phone || ''
            };
          } else {
            missing.push('Personal Information');
          }
        } catch (err) {
          missing.push('Personal Information');
          console.error('Failed to fetch personal info:', err);
        }

        // Fetch but handle errors gracefully for all other sections
        // Education section
        try {
          const educationRes = await api.get('/education');
          if (educationRes.data && educationRes.data.length > 0) {
            data.education = educationRes.data.map((edu: any) => ({
              institution: edu.institution || '',
              location: edu.institutionLocation || '',
              degree: edu.degree || '',
              field: edu.fieldOfStudy || '',
              startDate: edu.startDate || '',
              endDate: edu.endDate || '',
              gpa: edu.gpa || ''
            }));
          } else {
            console.log('No education data found');
            // Only mark as missing if needed for resume
            missing.push('Education');
          }
        } catch (err) {
          console.error('Failed to fetch education:', err);
          // Don't treat this as a critical error
        }

        // Experience section - explicitly handle empty case
        try {
          const experienceRes = await api.get('/experience');
          if (experienceRes.data && experienceRes.data.length > 0) {
            data.experience = experienceRes.data.map((exp: any) => ({
              company: exp.companyName || '',
              position: exp.position || '',
              location: exp.companyLocation || '',
              startDate: exp.startDate || '',
              endDate: exp.endDate || '',
              current: exp.isCurrent || false,
              responsibilities: Array.isArray(exp.description) ? exp.description : 
                exp.description ? [exp.description] : []
            }));
          } else {
            console.log('No experience data found - this is optional');
            // Experience is optional, don't add to missing
          }
        } catch (err) {
          console.error('Failed to fetch experience:', err);
          // Don't treat this as a critical error
        }

        // Projects section
        try {
          const projectsRes = await api.get('/projects');
          if (projectsRes.data && projectsRes.data.length > 0) {
            data.projects = projectsRes.data.map((proj: any) => ({
              title: proj.title || '',
              technologies: Array.isArray(proj.technologies) ? proj.technologies.join(', ') : 
                proj.technologies || '',
              description: proj.description || '',
              highlights: Array.isArray(proj.description) ? proj.description : [],
              githubUrl: proj.githubrepository || '',
              liveUrl: proj.livelink || ''
            }));
          } else {
            console.log('No projects data found');
            // Only mark as missing if needed for resume
            missing.push('Projects');
          }
        } catch (err) {
          console.error('Failed to fetch projects:', err);
          // Don't treat this as a critical error
        }

        // Skills section
        try {
          const skillsRes = await api.get('/skills');
          if (skillsRes.data && skillsRes.data.length > 0) {
            const skillsData = skillsRes.data[0];
            
            const categories: SkillCategory[] = [];
            
            if (skillsData) {
              // Map skills data based on available categories in the database
              Object.keys(skillsData).forEach(category => {
                if (Array.isArray(skillsData[category]) && skillsData[category].length > 0) {
                  const displayName = CATEGORY_DISPLAY_NAMES[category] || 
                    (category.charAt(0).toUpperCase() + category.slice(1));
                  categories.push({
                    name: displayName,
                    skills: skillsData[category]
                  });
                }
              });
            }
            
            data.skills = { categories };
            
            if (categories.length === 0) {
              missing.push('Skills');
            }
          } else {
            console.log('No skills data found');
            // Only mark as missing if needed for resume
            missing.push('Skills');
          }
        } catch (err) {
          console.error('Failed to fetch skills:', err);
          // Don't treat this as a critical error
        }

        // Achievements section - also optional
        try {
          const achievementsRes = await api.get('/achievements');
          if (achievementsRes.data && achievementsRes.data.length > 0) {
            const achievementsData = achievementsRes.data[0];
            if (achievementsData && Array.isArray(achievementsData.text) && achievementsData.text.length > 0) {
              data.achievements = achievementsData.text.map((item: string) => {
                if (item.includes(':')) {
                  const parts = item.split(':');
                  return {
                    title: parts[0] || '',
                    description: parts.slice(1).join(':').trim() || ''
                  };
                } else {
                  return {
                    title: item,
                    description: ''
                  };
                }
              });
            } else {
              console.log('No achievements text data found');
            }
          } else {
            console.log('No achievements data found - this is optional');
          }
        } catch (err) {
          console.error('Failed to fetch achievements:', err);
          // Don't treat this as a critical error
        }

        // Links section - optional enhancement for personal info
        try {
          const linksRes = await api.get('/links');
          if (linksRes.data && linksRes.data.length > 0) {
            const links = linksRes.data[0];
            data.personalInfo.linkedin = links.linkedin || '';
            data.personalInfo.github = links.github || '';
            data.personalInfo.website = links.portfolio || '';
            data.personalInfo.leetcode = links.leetcode || '';
          }
        } catch (err) {
          console.log('No links found, continuing without them');
        }

        // Set the data regardless of completion status
        setResumeData(data);
        setMissingSections(missing);
        
        // Only show error if we're completely missing personal info
        if (!data.personalInfo || !data.personalInfo.name) {
          setError('Personal information is required to generate a resume.');
        } else {
          // Generate LaTeX code if we at least have personal info
          generateCustomLatexCode(data);
          setError(null);
        }
      } catch (err: any) {
        console.error('Failed to fetch resume data:', err);
        setError('Failed to fetch resume data. Please ensure all sections are completed.');
      } finally {
        setLoading(false);
      }
    };

    fetchResumeData();
  }, []);

  const generateCustomLatexCode = (data: ResumeData) => {
    if (!data.personalInfo || !data.personalInfo.name) {
      setError('Personal information is missing. Please add your personal details.');
      return;
    }

    // Initialize checkbox states when first loading data
    if (Object.keys(selectedProjects).length === 0 && data.projects && data.projects.length > 0) {
      const initialProjectsState: { [id: string]: boolean } = {};
      data.projects.forEach((_, index) => {
        initialProjectsState[index] = true;
      });
      setSelectedProjects(initialProjectsState);
    }

    if (Object.keys(selectedExperiences).length === 0 && data.experience && data.experience.length > 0) {
      const initialExperiencesState: { [id: string]: boolean } = {};
      data.experience.forEach((_, index) => {
        initialExperiencesState[index] = true;
      });
      setSelectedExperiences(initialExperiencesState);
    }

    let latex = `%-------------------------
% Resume in Latex
% Author : ${escapeLatex(data.personalInfo.name)}
% Based off of: https://github.com/sb2nov/resume
% License : MIT
%------------------------

\\documentclass[letterpaper,11pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\input{glyphtounicode}


%----------FONT OPTIONS----------
% sans-serif
% \\usepackage[sfdefault]{FiraSans}
% \\usepackage[sfdefault]{roboto}
% \\usepackage[sfdefault]{noto-sans}
% \\usepackage[default]{sourcesanspro}

% serif
% \\usepackage{CormorantGaramond}
% \\usepackage{charter}


\\pagestyle{fancy}
\\fancyhf{} % clear all header and footer fields
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

% Adjust margins
\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}

\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% Sections formatting
\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

% Ensure that generate pdf is machine readable/ATS parsable
\\pdfgentounicode=1

%-------------------------
% Custom commands
\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubSubheading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\textit{\\small#1} & \\textit{\\small #2} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & #2 \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubItem}[1]{\\resumeItem{#1}\\vspace{-4pt}}

\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

%-------------------------------------------
%%%%%%  RESUME STARTS HERE  %%%%%%%%%%%%%%%%%%%%%%%%%%%%


\\begin{document}

%----------HEADING----------
\\begin{center}
    \\textbf{\\Huge \\scshape ${escapeLatex(data.personalInfo.name)}} \\\\ \\vspace{1pt}
    \\small ${escapeLatex(data.personalInfo.phone)} $|$ ${escapeLatex(data.personalInfo.email)}`;

    // Add links if available
    if (data.personalInfo.website) {
      latex += ` $|$ \\href{${data.personalInfo.website}}{\\underline{Portfolio}}`;
    }
    if (data.personalInfo.linkedin) {
      latex += ` $|$ \\href{${data.personalInfo.linkedin}}{\\underline{LinkedIn}}`;
    }
    if (data.personalInfo.github) {
      latex += ` $|$ \\href{${data.personalInfo.github}}{\\underline{GitHub}}`;
    }
    if (data.personalInfo.leetcode) {
      latex += ` $|$ \\href{${data.personalInfo.leetcode}}{\\underline{LeetCode}}`;
    }

    latex += `
\\end{center}


`;

    // Education Section
    if (data.education && data.education.length > 0) {
      latex += `%-----------EDUCATION-----------
\\section{Education}
  \\resumeSubHeadingListStart
`;

      data.education.forEach(edu => {
        latex += `    \\resumeSubheading
      {${escapeLatex(edu.institution)}}{${escapeLatex(edu.location)}}
      {${escapeLatex(edu.degree)} in ${escapeLatex(edu.field)}}{${formatDate(edu.startDate)} -- ${edu.endDate ? formatDate(edu.endDate) : 'Present'}}`;
        
        if (edu.gpa) {
          latex += `\\newline{\\textbf{GPA}: ${escapeLatex(edu.gpa)}}`;
        }
      });

      latex += `
  \\resumeSubHeadingListEnd

`;
    }

        // Experience Section
        if (data.experience && data.experience.length > 0) {
          // Filter out unselected experiences
          const filteredExperiences = data.experience.filter((_, index) => selectedExperiences[index] !== false);
          
          if (filteredExperiences.length > 0) {
            latex += `%-----------EXPERIENCE-----------
    \\section{Experience}
      \\resumeSubHeadingListStart
    `;
    
            filteredExperiences.forEach(exp => {
              latex += `    \\resumeSubheading
          {${escapeLatex(exp.company)}}{${escapeLatex(exp.location)}}
          {${escapeLatex(exp.position)}}{${formatDate(exp.startDate)} -- ${exp.current ? 'Present' : formatDate(exp.endDate || '')}}
          \\resumeItemListStart`;
    
              if (Array.isArray(exp.responsibilities)) {
                exp.responsibilities.forEach(responsibility => {
                  if (responsibility.trim()) {
                    latex += `
            \\resumeItem{${escapeLatex(responsibility)}}`;
                  }
                });
              }
    
              latex += `
          \\resumeItemListEnd`;
            });
    
            latex += `
      \\resumeSubHeadingListEnd
    
    `;
        }
      }

    // Projects Section (prioritized as shown in your template)
    if (data.projects && data.projects.length > 0) {
      // Filter out unselected projects
      const filteredProjects = data.projects.filter((_, index) => selectedProjects[index] !== false);
      
      if (filteredProjects.length > 0) {
        latex += `%-----------PROJECTS-----------
\\section{Projects}
  \\resumeSubHeadingListStart
`;

        filteredProjects.forEach(project => {
          let githubLink = '';
          if (project.githubUrl) {
            githubLink = `\\href{${escapeLatex(project.githubUrl)}}{\\underline{GitHub}}`;
          }

          latex += `    \\resumeSubheading
      {\\textbf{${escapeLatex(project.title)}}}{${githubLink}}
      {${escapeLatex(project.technologies)}}{}
      \\resumeItemListStart`;

          if (Array.isArray(project.highlights)) {
            project.highlights.forEach(highlight => {
              if (highlight.trim()) {
                latex += `
        \\resumeItem{${escapeLatex(highlight)}}`;
              }
            });
          } else if (project.description) {
            // Only add description if no highlights are available
            latex += `
        \\resumeItem{${escapeLatex(project.description)}}`;
          }

          latex += `
      \\resumeItemListEnd`;
        });

        latex += `
  \\resumeSubHeadingListEnd

`;
      }
    }
    
    // Achievements Section
    if (data.achievements && data.achievements.length > 0) {
      latex += `%-----------ACHIEVEMENTS-----------
\\section{Achievements}
\\begin{itemize}[itemsep=1pt,label=\\scriptsize\\textbullet]
`;

      data.achievements.forEach(achievement => {
        latex += `  \\resumeItem{${escapeLatex(achievement.title)}${achievement.description ? ': ' + escapeLatex(achievement.description) : ''}}
`;
      });

      latex += `\\end{itemize}


`;
    }

    // Skills Section
    if (data.skills && data.skills.categories && data.skills.categories.length > 0) {
      latex += `%-----------TECHNICAL SKILLS-----------
\\section{Technical Skills}
 \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item`;

      data.skills.categories.forEach((category, index) => {
        latex += `\\textbf{${escapeLatex(category.name)}}{: ${escapeLatex(category.skills.join(', '))}}`;
        if (index < data.skills.categories.length - 1) {
          latex += ` \\\\
    `;
        }
      });

      latex += `}
 \\end{itemize}
`;
    }

    // Add a Relevant Coursework section if you have this data
    // You'll need to update your data model to include coursework
//     latex += `%-----------RELEVANT COURSEWORK-----------
// \\section{Relevant Coursework}
// \\begin{itemize}[itemsep=1pt,label=\\scriptsize\\textbullet]
//   \\resumeItem{Programming in Python, Programming Concepts using Java, Data Structures and Algorithms}
//   \\resumeItem{Database Management Systems, System Commands, Software Engineering, Software Testing}
//   \\resumeItem{Modern Application Development, Computational Thinking}
//   \\resumeItem{Mathematics for Data Science, Statistics for Data Science}
// \\end{itemize}

// `;

    latex += `%-------------------------------------------
\\end{document}
`;

    setLatexCode(latex);
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'
    ];
    
    return `${monthNames[date.getMonth()]}. ${date.getFullYear()}`;
  };

  const escapeLatex = (text: any): string => {
    if (!text) return '';
    
    // Convert to string if it's not already
    const textString = typeof text === 'string' ? text : String(text);
    
    // Handle special characters first (except braces which we'll handle after bold formatting)
    let processedText = textString
      .replace(/&/g, '\\&')
      .replace(/%/g, '\\%')
      .replace(/\\$/g, '\\$')
      .replace(/#/g, '\\#')
      .replace(/_/g, '\\_')
      .replace(/~/g, '\\textasciitilde{}')
      .replace(/\^/g, '\\textasciicircum{}');
      
    // Handle bold formatting (convert **text** to \textbf{$1})
    processedText = processedText.replace(/\*\*(.*?)\*\*/g, '\\textbf{$1}');
    
    return processedText;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(latexCode);
    alert('LaTeX code copied to clipboard!');
  };

  const downloadPDF = async () => {
    try {
      if (!latexCode) {
        alert('No LaTeX code available. Please ensure your resume data is loaded.');
        return;
      }

      // First, validate the LaTeX code
      const validateResponse = await api.post('/latex/validate', { latex: latexCode });
      if (!validateResponse.data.valid) {
        alert(`LaTeX validation failed: ${validateResponse.data.errors.join(', ')}`);
        return;
      }

      // Generate PDF using the backend service
      const response = await api.post('/latex/generate-pdf', 
        { latex: latexCode },
        { responseType: 'blob' }  // Important for receiving binary data
      );
      
      // Create a blob URL from the PDF data
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link to download the PDF
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'resume.pdf');
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate PDF', err);
      alert('Failed to generate PDF. This may be due to LaTeX compilation errors or pdflatex not being available on the server. You can still use the LaTeX code with an external compiler like Overleaf.');
    }
  };

  const downloadLatexFile = () => {
    const element = document.createElement('a');
    const file = new Blob([latexCode], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = 'resume.tex';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const previewPDF = async () => {
    try {
      if (!latexCode) {
        alert('No LaTeX code available. Please ensure your resume data is loaded.');
        return;
      }

      // Validate the LaTeX code
      const validateResponse = await api.post('/latex/validate', { latex: latexCode });
      if (!validateResponse.data.valid) {
        alert(`LaTeX validation failed: ${validateResponse.data.errors.join(', ')}`);
        return;
      }

      // Generate PDF using the backend service
      const response = await api.post('/latex/generate-pdf', 
        { latex: latexCode },
        { responseType: 'blob' }  // Important for receiving binary data
      );

      // Create a blob URL for the PDF preview
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      setPdfPreviewUrl(url);
    } catch (err) {
      console.error('Failed to generate PDF preview', err);
      alert('Failed to generate PDF preview. This may be due to LaTeX compilation errors or pdflatex not being available on the server.');
    }
  };

  const closePreview = () => {
    if (pdfPreviewUrl) {
      window.URL.revokeObjectURL(pdfPreviewUrl);
      setPdfPreviewUrl(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <div className="mb-5 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Resume Preview</h1>
              <Link
                to="/dashboard"
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Back to Dashboard
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-10">
                <div className="spinner-border text-blue-500" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
                <p className="mt-4 text-gray-600">Loading your resume data...</p>
              </div>
            ) : error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
                <p className="mt-2">Please make sure you've filled out all necessary sections.</p>
              </div>
            ) : (
              <div>
                {missingSections.length > 0 && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          <strong>Warning:</strong> The following sections are missing or incomplete:
                        </p>
                        <ul className="mt-1 text-sm text-yellow-700 list-disc list-inside">
                          {missingSections.map(section => (
                            <li key={section}>{section}</li>
                          ))}
                        </ul>
                        <p className="mt-1 text-sm text-yellow-700">
                          Your resume preview may be incomplete. Consider filling out these sections for a complete resume.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">Resume Actions</h2>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={copyToClipboard}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                      disabled={!latexCode}
                    >
                      Copy LaTeX Code
                    </button>
                    <button
                      onClick={downloadLatexFile}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                      disabled={!latexCode}
                    >
                      Download LaTeX File
                    </button>
                    <button
                      onClick={() => setShowSelectionOptions(!showSelectionOptions)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      {showSelectionOptions ? 'Hide Selection Options' : 'Customize Sections'}
                    </button>
                    <button
                      onClick={previewPDF}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700"
                      disabled={!latexCode}
                    >
                      Preview PDF
                    </button>
                    <button
                      onClick={downloadPDF}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                      disabled={!latexCode}
                    >
                      Download PDF
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    To get a perfectly formatted PDF, copy the LaTeX code and compile it using a LaTeX compiler
                    like <a href="https://www.overleaf.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Overleaf</a>.
                  </p>
                </div>

                {/* Section Selection Options */}
                {showSelectionOptions && (
                  <div className="border border-gray-200 rounded-lg p-4 mb-6 bg-gray-50">
                    <h2 className="text-lg font-semibold mb-4">Customize Your Resume</h2>
                    <p className="text-sm text-gray-600 mb-4">
                      Select which items to include in your resume. This is useful for tailoring your resume for specific job applications.
                    </p>
                    
                    {resumeData?.experience && resumeData.experience.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-md font-medium mb-2">Work Experience</h3>
                        <div className="space-y-2 ml-2">
                          {resumeData.experience.map((exp, index) => (
                            <div key={`exp-${index}`} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`exp-${index}`}
                                checked={selectedExperiences[index] !== false}
                                onChange={(e) => {
                                  setSelectedExperiences({
                                    ...selectedExperiences,
                                    [index]: e.target.checked
                                  });
                                }}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label htmlFor={`exp-${index}`} className="ml-2 block text-sm text-gray-900">
                                {exp.company} - {exp.position}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {resumeData?.projects && resumeData.projects.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-md font-medium mb-2">Projects</h3>
                        <div className="space-y-2 ml-2">
                          {resumeData.projects.map((project, index) => (
                            <div key={`proj-${index}`} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`proj-${index}`}
                                checked={selectedProjects[index] !== false}
                                onChange={(e) => {
                                  setSelectedProjects({
                                    ...selectedProjects,
                                    [index]: e.target.checked
                                  });
                                }}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label htmlFor={`proj-${index}`} className="ml-2 block text-sm text-gray-900">
                                {project.title}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          if (resumeData) generateCustomLatexCode(resumeData);
                        }}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Apply Selection
                      </button>
                    </div>
                  </div>
                )}

                {latexCode && (
                  <div className="border border-gray-200 rounded-lg p-4 mb-6">
                    <h2 className="text-xl font-semibold mb-4">LaTeX Code</h2>
                    <div className="bg-gray-50 p-4 rounded overflow-auto max-h-96">
                      <pre className="text-xs text-gray-700 whitespace-pre-wrap">{latexCode}</pre>
                    </div>
                  </div>
                )}

                {/* PDF Preview Section - Shown directly on page */}
                {pdfPreviewUrl && (
                  <div className="border border-gray-200 rounded-lg p-4 mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold">PDF Preview</h2>
                      <button 
                        onClick={closePreview}
                        className="px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Close Preview
                      </button>
                    </div>
                    <div className="bg-white border border-gray-300 rounded">
                      <iframe
                        src={pdfPreviewUrl}
                        title="PDF Preview"
                        className="w-full h-[800px]"
                      ></iframe>
                    </div>
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

export default ResumePreview;