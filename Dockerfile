FROM node:18-alpine

WORKDIR /app

# Copier tous les fichiers du projet
COPY . .

# Installer les dépendances du frontend
RUN npm install

# Build du frontend
RUN npm run build

# Installer les dépendances du backend
RUN npm install --prefix server

# Copier le build du frontend dans le dossier dist
RUN mv dist public

# Exposer le port 3000
EXPOSE 3000

# Commande de démarrage
CMD ["node", "server/server.js"]
