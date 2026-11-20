
FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy frontend source code
COPY . .

# Expose Vite development server
EXPOSE 5173

# Start Vite and allow external connections
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
