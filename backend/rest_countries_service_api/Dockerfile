# Use a small and secure Node.js base image
FROM node:23-alpine3.20

# Set working directory inside the container
WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install only production dependencies (smaller image)
RUN npm ci --omit=dev

# Copy source files
COPY ./src ./src
COPY ./index.mjs .

# Create and use a non-root user (security best practice)
RUN addgroup -S app && adduser -S app -G app
USER app

# Expose the app's port
EXPOSE 4003

# Define the default command to run your app
CMD ["npm", "run", "start"]
