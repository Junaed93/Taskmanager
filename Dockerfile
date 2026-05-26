FROM node:20-alpine

WORKDIR /app
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci --legacy-peer-deps --no-audit --progress=false; else npm install --legacy-peer-deps --no-audit --progress=false; fi
COPY . .
ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
ENV BROWSER=none
EXPOSE 19000 19001 19002 19006 3000
CMD ["npx", "expo", "start", "--web", "--host", "lan"]
