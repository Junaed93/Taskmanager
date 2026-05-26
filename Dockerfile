FROM node:18-alpine

# Install expo CLI
RUN npm install -g expo-cli@6 --no-progress --no-audit --silent

WORKDIR /app

# Copy package files first for caching
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install --legacy-peer-deps --no-audit --progress=false || npm install --no-audit --progress=false

# Copy app source
COPY . .

# Ensure Expo devtools listens on all interfaces
ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0

# Common Expo dev ports
EXPOSE 19000 19001 19002 3000

# Start the Expo dev server
CMD ["npm", "start"]
