# Configuration du domaine choptaloc.fr

## Étape 1 : Configuration DNS

1. Connectez-vous à votre fournisseur de domaine (ex: OVH, GoDaddy, etc.)
2. Ajoutez un enregistrement A :
   - Type : A
   - Nom/Hôte : @ (ou choptaloc.fr)
   - Valeur : 134.209.198.36
   - TTL : 3600 (1 heure)

3. Ajoutez un enregistrement CNAME pour www :
   - Type : CNAME
   - Nom/Hôte : www
   - Valeur : choptaloc.fr
   - TTL : 3600

4. Attendez la propagation DNS (peut prendre de quelques minutes à 24 heures)

## Étape 2 : Déploiement sur le VPS

1. Connectez-vous au VPS :
```bash
ssh root@134.209.198.36
```

2. Naviguez vers le répertoire du projet :
```bash
cd ~/choptaloc
```

3. Récupérez les dernières modifications :
```bash
git pull
```

4. Créez les répertoires pour certbot :
```bash
mkdir -p certbot/conf certbot/www
```

5. Arrêtez les conteneurs existants :
```bash
docker compose down
```

6. Démarrez les nouveaux conteneurs (sans nginx au début) :
```bash
docker compose up -d mysql backend frontend
```

## Étape 3 : Obtention du certificat SSL

1. Vérifiez que le DNS est propagé :
```bash
nslookup choptaloc.fr
```
Devrait retourner 134.209.198.36

2. Obtenez le certificat SSL avec certbot :
```bash
docker compose run --rm certbot certonly --webroot --webroot-path /var/www/certbot -d choptaloc.fr -d www.choptaloc.fr
```

3. Si le certificat est obtenu avec succès, modifiez nginx.conf pour activer HTTPS :
   - Décommentez la section HTTPS dans nginx.conf
   - Commentez la section HTTP ou ajoutez la redirection

4. Démarrez nginx :
```bash
docker compose up -d nginx certbot
```

## Étape 4 : Vérification

1. Vérifiez que l'application fonctionne :
```bash
curl http://choptaloc.fr
```

2. Vérifiez que l'API fonctionne :
```bash
curl http://choptaloc.fr/api/health
```

3. Après activation de SSL, vérifiez HTTPS :
```bash
curl https://choptaloc.fr
```

## Étape 5 : Redirection HTTP vers HTTPS

Une fois le certificat SSL obtenu et activé, modifiez nginx.conf pour rediriger tout le trafic HTTP vers HTTPS :

1. Décommentez la ligne dans la section HTTP :
```nginx
return 301 https://$host$request_uri;
```

2. Redémarrez nginx :
```bash
docker compose restart nginx
```

## Résolution de problèmes

### Le certificat n'est pas obtenu
- Vérifiez que le DNS est correctement configuré
- Attendez la propagation DNS complète
- Vérifiez que le port 80 est ouvert sur le VPS

### L'application ne fonctionne pas
- Vérifiez les logs des conteneurs :
```bash
docker compose logs
```
- Vérifiez que tous les conteneurs sont en cours d'exécution :
```bash
docker compose ps
```

### Erreur de connexion API
- Vérifiez que l'URL API dans le frontend est correcte (https://choptaloc.fr/api)
- Vérifiez que le backend est accessible depuis nginx
