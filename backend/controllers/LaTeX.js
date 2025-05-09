const latex = require('node-latex');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Helper function to create a temp directory for LaTeX files
const createTempDir = () => {
  const tempDir = path.join(os.tmpdir(), `latex-${Date.now()}`);
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  return tempDir;
};

// Helper function to clean up temp files
const cleanupTempFiles = (tempDir) => {
  if (fs.existsSync(tempDir)) {
    const files = fs.readdirSync(tempDir);
    files.forEach(file => {
      fs.unlinkSync(path.join(tempDir, file));
    });
    fs.rmdirSync(tempDir);
  }
};

// Compile LaTeX to PDF
exports.generatePDF = async (req, res) => {
  const latexCode = req.body.latex;
  if (!latexCode) {
    return res.status(400).json({ error: 'LaTeX code is required' });
  }

  const tempDir = createTempDir();
  const outputFile = path.join(tempDir, 'resume.pdf');

  try {
    // Set up the LaTeX compilation options
    const options = {
      inputs: tempDir,
      cmd: 'pdflatex', // Requires pdflatex to be installed on the server
      passes: 2,       // Multiple passes for references
    };

    // Compile LaTeX to PDF using the string input
    const output = latex(latexCode, options);
    const pdfStream = fs.createWriteStream(outputFile);

    output.pipe(pdfStream);

    output.on('error', (err) => {
      console.error('LaTeX compilation error:', err);
      cleanupTempFiles(tempDir);
      return res.status(500).json({ 
        error: 'Failed to compile LaTeX', 
        details: err.message
      });
    });

    pdfStream.on('finish', () => {
      // Read the generated PDF
      const pdfData = fs.readFileSync(outputFile);
      
      // Send the PDF back to the client
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename=resume.pdf');
      res.send(pdfData);
      
      // Clean up temporary files
      cleanupTempFiles(tempDir);
    });

  } catch (error) {
    console.error('Error in PDF generation:', error);
    cleanupTempFiles(tempDir);
    return res.status(500).json({ error: 'Error generating PDF', details: error.message });
  }
};

// Just validate the LaTeX without generating PDF
exports.validateLaTeX = async (req, res) => {
  const latexCode = req.body.latex;
  if (!latexCode) {
    return res.status(400).json({ error: 'LaTeX code is required' });
  }

  // Basic validation - in a real app, you might want more sophisticated validation
  try {
    // Check for common LaTeX syntax errors
    const errors = [];
    
    // Check for unmatched curly braces
    let openBraces = 0;
    for (const char of latexCode) {
      if (char === '{') openBraces++;
      if (char === '}') openBraces--;
      if (openBraces < 0) {
        errors.push('Unmatched closing brace }');
        break;
      }
    }
    if (openBraces > 0) {
      errors.push(`${openBraces} unclosed opening brace(s) {`);
    }
    
    // Check for document environment
    if (!latexCode.includes('\\begin{document}') || !latexCode.includes('\\end{document}')) {
      errors.push('Missing document environment (\\begin{document}...\\end{document})');
    }
    
    if (errors.length > 0) {
      return res.status(400).json({ valid: false, errors });
    }
    
    return res.status(200).json({ valid: true, message: 'LaTeX syntax appears valid' });
  } catch (error) {
    console.error('Error validating LaTeX:', error);
    return res.status(500).json({ error: 'Error validating LaTeX', details: error.message });
  }
};