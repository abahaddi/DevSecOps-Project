FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev || npm install --production

# Copy source
COPY . .

EXPOSE 3001

CMD ["node", "server.js"]
