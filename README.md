# Resume Builder

A full-stack application for creating professional resumes with LaTeX formatting, designed to be ATS-friendly and aesthetically pleasing.


## Features

- **User Authentication**: Secure login and registration system
- **Comprehensive Resume Sections**:
  - Personal Information
  - Education
  - Work Experience
  - Projects
  - Skills (categorized)
  - Achievements
  - Social/Professional Links
- **LaTeX Resume Generation**: Produces professional, ATS-friendly resume formats
- **PDF Export**: Convert your resume directly to PDF format
- **Section Customization**: Toggle specific experiences and projects for targeted applications
- **Bold Text Formatting**: Use `**text**` syntax for emphasis in descriptions
- **Live Preview**: See how your resume looks as you build it
- **Mobile-Friendly Interface**: Responsive design works on all devices
- **Data Persistence**: All resume information is securely stored

## Tech Stack

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Formik & Yup (form handling and validation)
- Axios (API requests)
- React Router (navigation)

### Backend
- Node.js
- Express
- Sequelize ORM
- JWT Authentication
- LaTeX PDF generation
- SQLite (development) / PostgreSQL (production)

## Deployment

The application is configured for easy deployment:

- **Frontend**: GitHub Pages
- **Backend**: Any Node.js hosting service (GCP, AWS, Heroku, etc.)

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- [LaTeX](https://www.latex-project.org/get/) installation (for PDF generation on the backend)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/resume-builder.git
   cd resume-builder
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

### Configuration

1. Backend configuration:
   - Create a `.env` file in the backend directory:
   ```
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   NODE_ENV=development
   DB_DIALECT=sqlite
   DB_STORAGE=./database.sqlite
   ```

2. Frontend configuration:
   - Create `.env.development` for local development:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```
   
   - Create `.env.production` for production:
   ```
   REACT_APP_API_URL=https://your-api-domain.com/api
   ```

### Running the Application

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

## Docker Setup

The application includes Docker configuration for easy containerization:

1. Make sure Docker and Docker Compose are installed
2. Run the following command from the project root:
   ```bash
   docker-compose up
   ```

## Deploying to GitHub Pages

1. Update the `homepage` field in `frontend/package.json` with your GitHub Pages URL
2. Run the deployment script:
   ```bash
   cd frontend
   npm run deploy
   ```

## Backend API Endpoints

The API provides the following endpoints:

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/me` - Get current user information

### Resume Data
- Education: `GET|POST|PUT|DELETE /api/education`
- Experience: `GET|POST|PUT|DELETE /api/experience`
- Projects: `GET|POST|PUT|DELETE /api/projects`
- Skills: `GET|POST|PUT|DELETE /api/skills`
- Links: `GET|POST|PUT|DELETE /api/links`
- Achievements: `GET|POST|PUT|DELETE /api/achievements`
- User Profile: `GET|PUT|DELETE /api/users/me`

### PDF Generation
- `POST /api/latex/validate` - Validate LaTeX code
- `POST /api/latex/generate-pdf` - Generate PDF from LaTeX code

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [LaTeX Resume Template](https://github.com/sb2nov/resume) - Base LaTeX template used for resume generation