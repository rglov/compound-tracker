FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

COPY src ./src

ENV PORT=3000
EXPOSE 3000
VOLUME ["/app/data"]

CMD ["npm", "run", "web"]
