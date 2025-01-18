# Next.js PWA avec Tailwind CSS, Neon DB et Prisma

Ce projet est une application Next.js transformée en Progressive Web App (PWA). Elle utilise Tailwind CSS pour le design, Neon DB comme base de données, Prisma comme ORM, Redux pour la gestion de l'état, NextAuth pour l'authentification et Pusher pour la gestion des événements en temps réel.

---

## Contributeurs du projet

- **Ilan916/lallemand_ilan**
- **Mouhamadou-Soumare/soumare_mouhamadou**
- **matthiasfaucon/faucon_matthias**

---

## Fonctionnalités principales

### Base de données
- **Lier la base de données (NeonDB) avec le projet** - Mouhamadou SOUMARE  
- **Créer les tables nécessaires** - Mouhamadou SOUMARE, Matthias FAUCON, Lallemand Ilan  
- **Configurer Prisma comme ORM** - Mouhamadou SOUMARE  
- **MLD** - Matthias FAUCON  

### Initialisation et Architecture
- **Initialisation du projet** - Matthias FAUCON  
- **Réflexion sur l’architecture de l'application** - Mouhamadou SOUMARE, Matthias FAUCON, Lallemand Ilan  
- **Génération de fixtures** - Mouhamadou SOUMARE  

### Authentification et Sessions
- **Authentification des utilisateurs (base de données)** - Lallemand Ilan  
- **Gestion des sessions** - Lallemand Ilan  

### Interface Utilisateur
- **Page d’accueil pour expliquer les règles principales** - Mouhamadou SOUMARE  
- **Interface de création de partie** - Mouhamadou SOUMARE

### Gameplay
- **Créer un écran où le capitaine choisit son équipage** - Matthias FAUCON  
- **Interface de l’ajout des joueurs** - Matthias FAUCON  
- **Afficher une pop-up pour chaque joueur afin de voter "Pour" ou "Contre" l’équipage proposé** - Matthias FAUCON  
- **Générer aléatoirement les cartes rôles (pirates, marins, sirène) pour chaque joueur** - Matthias FAUCON  
- **Calcul du score et mise à jour du score à la fin d’une manche** - Matthias FAUCON  
- **Vérifier que les pirates peuvent jouer des cartes "POISON" ou "ÎLE"** - Matthias FAUCON  
- **Permettre aux marins de jouer uniquement des cartes "ÎLE"** - Matthias FAUCON   
- **Si les pirates se trompent dans leur vote, la sirène gagne seule** - Matthias FAUCON  
- **Passer le rôle de capitaine au joueur suivant si l’équipage est refusé deux fois** - Matthias FAUCON  
- **Afficher une notification de victoire lorsqu'une équipe atteint le nombre de points défini au paramétrage de la partie** - Matthias FAUCON
- **Paramétrage de la partie (Durée timer des pirates, nombres de joueurs, nombres de manches gagnantes, choisir si on joue avec des bonus)** - Matthias FAUCON
- **En cas de victoire pirate, afficher un écran de vote pour identifier la sirène** - Matthias FAUCON  

### Design et Responsive
- **Design responsive pour s’adapter aux mobiles et tablettes** - Ilan Lallemand  
- **Affichage dynamique des joueurs (savoir qui doit jouer)** - Matthias FAUCON
- **Afficher le joueur sélectionné en tant que capitaine** - Non assignée  
- **Design du back-office** - Principalement Lallemand Ilan et rajout par la suite de Matthias FAUCON et Mouhamadou SOUMARE  
- **Design de la page profil** - Lallemand Ilan  

### Administration
- **Créer la page admin** - Matthias FAUCON  
- **Gestion des cartes** - Matthias FAUCON  
- **Gestion des utilisateurs** - Matthias FAUCON  
- **Gestion des bugs et des suggestions** - Matthias FAUCON  
- **Seeder pour les règles** - Matthias FAUCON  

### Autres
- **Cahier des charges** - Lallemand Ilan
- **Matrice de droits** - Matthias FAUCON
- **README** - Matthias FAUCON
- **Mise en ligne** - Matthias FAUCON

---

## Prérequis

Avant de commencer, assurez-vous d'avoir installé les éléments suivants :

- [Node.js](https://nodejs.org/) (Projet réalisé avec la version 20.11.1)
- [npm](https://www.npmjs.com/)
- Un compte [Neon](https://neon.tech/) pour la gestion de la base de données

---

## Installation

Clonez le dépôt et installez les dépendances :

```bash
# Cloner le projet
git clone https://github.com/matthiasfaucon/ICO-worshop.git
cd ICO-worshop

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev # ou npm run dev
```

---

## Configuration

### 1. Variables d'environnement

#### Neon DB

1. Créez un projet sur [Neon.tech](https://neon.tech/).
2. Récupérez l'URL de connexion de votre base de données.
3. Renommez le `.env.example` en `.env`, et copiez l'URL que vous avez récupérée dans la variable `DATABASE_URL`.
4. Si vous utilisez une base de données de shadow pour Prisma, ajoutez également l'URL de cette base de données dans la variable `SHADOW_DATABASE_URL`.

### JWT

1. Générez une clé secrète pour le JWT et ajoutez-la dans la variable `JWT_SECRET`.

#### Pusher


### 2. Prisma

1. Générez le schéma Prisma basé sur la base de données :

```bash
npx prisma db pull
```

2. Appliquez les modifications et générez les fichiers Prisma :

```bash
npx prisma generate
```

### 3. Configuration PWA

Ajoutez les fichiers nécessaires pour convertir l'application en PWA (éventuellement déjà inclus dans ce modèle) :

- `next.config.js` : Inclut la configuration PWA via `next-pwa`.
- `public/manifest.json` : Description de l'application pour les navigateurs.
- Icônes et autres fichiers statiques dans le dossier `public/`.

---

## Scripts utiles

### Construire pour la production

```bash
npm run build
```

### Lancer Prisma Studio

```bash
npx prisma studio
```

### Créez de nouvelles migrations

```bash
npx prisma migrate dev --name init
```

---

## Structure du projet

Voici une brève description des dossiers principaux :

```
.ICO-WORSHOP/
├── prisma/            # Schéma Prisma et fichiers de configuration
├── public/            # Fichiers publics comme manifest.json, icônes, etc.
├── src/
   ├── styles/        # Fichiers de styles globaux et Tailwind CSS
   ├── context/       # Contextes de données partagées pour l'application entre les composants
   ├── components/    # Composants réutilisables
   ├── lib/           # Utilitaires (Prisma client, config, etc.)
   ├── api/           # Routes API
   ├── admin/         # Pages du back-office
├── .env              # Variables d'environnement
```