# Étape 1 : Construction (Build)
FROM node:22-slim AS builder
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY ca.pem /app/ca.pem
COPY . .
RUN npm run build

# Étape 2 : Exécution (Production)
FROM node:22-slim
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/ca.pem ./ca.pem

# Exposer le port sur lequel ton NestJS tourne
EXPOSE 3000

# Lancer l'application
CMD ["node", "dist/main"]