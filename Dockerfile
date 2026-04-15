# Étape 1 : Build du frontend avec Node.js
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copier les fichiers package du frontend
COPY package*.json ./

# Installer les dépendances du frontend
RUN npm ci

# Copier le code source du frontend
COPY . .

# Build du frontend
RUN npm run build

# Étape 2 : Build du backend avec Node.js
FROM node:18-alpine AS backend-builder

WORKDIR /app

# Copier les fichiers package du backend
COPY server/package*.json ./

# Installer les dépendances du backend
RUN npm ci

# Copier le code source du backend
COPY server/ .

# Étape 3 : Image finale combinée
FROM node:18-alpine

WORKDIR /app

# Copier les dépendances du backend
COPY --from=backend-builder /app/node_modules ./node_modules
COPY --from=backend-builder /app/package*.json ./

# Copier le code source du backend
COPY --from=backend-builder /app ./

# Copier le build du frontend dans le dossier public
COPY --from=frontend-builder /app/frontend/dist ./public

# Exposer le port 3000
EXPOSE 3000

# Commande de démarrage
CMD ["npm", "start"]
