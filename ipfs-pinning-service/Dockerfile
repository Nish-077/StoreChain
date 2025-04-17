# Use Node.js LTS image
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Bundle app source code
COPY . .

# Expose port
EXPOSE 3000

# Start the service
CMD ["node", "index.js"]
