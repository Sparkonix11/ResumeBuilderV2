# Backend Dockerfile
FROM node:18-slim

# Set working directory
WORKDIR /app

# Install texlive for PDF generation and build tools for native modules
RUN apt-get update && apt-get install -y \
    texlive-latex-base \
    texlive-fonts-recommended \
    texlive-fonts-extra \
    texlive-latex-extra \
    python3 \
    make \
    gcc g++ \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Rebuild bcrypt and sqlite3 to ensure correct binary format
RUN npm rebuild bcrypt --build-from-source
RUN npm rebuild sqlite3 --build-from-source

# Copy all files
COPY . .

# Expose the port the app runs on
EXPOSE 5000

# Command to run the application
CMD ["npm", "start"]