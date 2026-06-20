FROM node:20-bullseye-slim

RUN apt-get update && apt-get install -y ffmpeg python3 python3-pip curl \
    && pip3 install --break-system-packages -U yt-dlp \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY . .

EXPOSE 3001

CMD ["node", "server.js"]
