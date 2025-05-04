FROM node:lts AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

RUN npm prune --omit=dev

FROM gcr.io/distroless/nodejs

WORKDIR /app

COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/server.js /app/
COPY --from=builder /app/server-common.js /app/
COPY --from=builder /app/signaling-server.js /app/
COPY --from=builder /app/protos /app/protos

ENV PORT=8080

CMD ["server.js"]
