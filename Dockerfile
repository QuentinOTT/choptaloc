FROM node:18-alpine

WORKDIR /app

# Copier les fichiers package du frontend
COPY package*.json ./

# Installer les dépendances du frontend
RUN npm install

# Copier le code source du frontend
COPY . .

# Build du frontend
RUN npm run build

# Copier les fichiers package du backend
COPY server/package*.json ./

# Installer les dépendances du backend
RUN npm install

# Copier le code source du backend
COPY server/ ./

# Exposer le port 3000
EXPOSE 3000

# Commande de démarrage
CMD ["node", "server.js"]
