# Use Node base image
FROM node:18

WORKDIR /app

# Copy backend dependencies
COPY backend_/package*.json ./

RUN npm install

# Copy backend source code
COPY backend_/ ./

# Copy frontend files (into container)
COPY frontend_ ./frontend_

EXPOSE 5000

CMD ["node", "server.js"]
