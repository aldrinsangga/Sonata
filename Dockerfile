# Use Node.js 20 base image
FROM node:20-slim AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy project files
COPY . .

# Build the application (Vite SPA + Express bundle)
RUN npm run build

# Use a clean image for production
FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
# Note: Since the server is bundled with --packages=external, 
# we still need production node_modules.
RUN npm install --omit=dev

# Copy the built files from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Expose the port (always 3000 in this environment)
EXPOSE 3000

# Start the application
CMD [ "npm", "start" ]
