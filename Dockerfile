FROM node:18-alpine

# Install expo CLI
RUN npm install -g expo-cli@6 --no-progress --no-audit --silent

WORKDIR /app

# Copy package files first for caching
COPY package.json package-lock.json* ./

# Install dependencies
RUN if [ -f package-lock.json ]; then npm ci --legacy-peer-deps --no-audit --progress=false; else npm install --legacy-peer-deps --no-audit --progress=false; fi

# Copy app source
COPY . .

# Ensure Expo devtools listens on all interfaces
ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
ENV BROWSER=none

# Common Expo dev ports (including web)
EXPOSE 19000 19001 19002 19006 3000

# Start the Expo web dev server and listen on all interfaces
# Use `npm run web -- --host 0.0.0.0` to forward the host arg to Expo
CMD ["npm", "run", "web", "--", "--host", "0.0.0.0"]
