# ICO

Ce projet est une application Next.js transformée en Progressive Web App (PWA). Elle utilise Tailwind CSS pour le design, Neon DB comme base de données, Prisma comme ORM, Redux pour la gestion de l'état, NextAuth pour l'authentification et Pusher pour la gestion des événements en temps réel.

---

## Contributeurs du projet

- **Ilan916/lallemand_ilan**
- **Mouhamadou-Soumare/Mouhamadou-Soumare**
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
- **Gestion des sessions** - Mouhamadou Soumare  

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
- **Permettre à l'utilisateur de reprendre la partie en cours, si elle est quittée** - Matthias FAUCON
- **Permettre à l'utilisateur de rejouer** - Matthias FAUCON
- **Permettre à l'utilisateur de rejouer avec les mêmes paramètres et les mêmes personnes** - Matthias FAUCON
- **En cas de victoire pirate, afficher un écran de vote pour identifier la sirène** - Matthias FAUCON  

### Gameplay Multidevice avec Fonctionnalités Temps Réel : 
- **Choix d’équipage multidevice** : Le capitaine sélectionne son équipage avec une synchronisation instantanée sur tous les appareils, garantissant des décisions collectives fluides.
- **Ajout et gestion des joueurs** : Interface intuitive permettant d'ajouter et gérer les joueurs en temps réel, avec mise à jour dynamique des informations pour tous les participants.
- **Votes en direct sur l’équipage** : Chaque joueur vote "Pour" ou "Contre" l’équipage via une interface dédiée, les résultats s'affichant instantanément pour tout le monde.
- **Attribution des rôles en temps réel** : Les rôles (pirates, marins, sirène) sont attribués aléatoirement et notifiés de manière sécurisée à chaque joueur.
- **Gestion automatique des scores** : Mise à jour transparente des scores à la fin de chaque manche, avec notifications en temps réel sur tous les appareils connectés.
- **Jouabilité interactive et synchronisée** : Pirates et marins jouent leurs cartes respectives ("ÎLE" ou "POISON"), avec un retour visuel immédiat sur le plateau partagé.
- **Gestion dynamique du capitaine** : En cas de double refus de l’équipage, le rôle de capitaine passe automatiquement au joueur suivant, avec notification immédiate.
- **Notifications de victoire en direct** : Une notification synchronisée informe instantanément tous les joueurs lorsqu'une équipe atteint le score de victoire.
- **Paramétrage en temps réel** : L’hôte configure les paramètres de la partie (durée des manches, nombre de joueurs, manches gagnantes, bonus) avec application immédiate pour tous les joueurs.
- **Écran de vote en cas de victoire pirate** : Si les pirates remportent la partie, un écran dédié permet un vote collectif pour identifier la sirène.
- **Révélation des cartes jouées** : Les cartes restent masquées jusqu’à la décision du capitaine de les révéler, offrant une expérience stratégique immersive.
- **Temps de réflexion synchronisé** : Mise en place d’un timer visible par tous pour gérer le rythme des actions et assurer une coordination fluide.

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
- **Implémenter la méthodologie Scrum Agile avec Notion pour gérer les sprints, les backlog et le suivi des tâches.** - Mouhamadou Soumare, Matthias FAUCON
- **Cahier des charges** - Lallemand Ilan, Matthias FAUCON, Mouhamadou Soumare
- **Matrice de droits** - Matthias FAUCON
- **README** - Matthias FAUCON, Mouhamadou Soumare
- **Mise en ligne** - Matthias FAUCON

### Améliorations prévues pour la V2

#### Paiement et Monétisation

- **Intégration de paiement en ligne** : Ajout de fonctionnalités de paiement pour acheter le jeu directement sur l'application.
- **Acheter le jeu en ligne ou en physique** : Offrir la possibilité d'acheter le jeu en ligne ou en version physique pour avoir accès à l'application et donc offir une expérience de jeu flexible.

#### Authentification et Sessions

- **Authentification via des providers tiers** : Intégration de la connexion via Google, Facebook, Twitter, Apple, etc. pour une expérience utilisateur plus fluide.

#### Fonctionnalités de Gameplay (Multidevice et Monodevice)

- **Possibilité de jouer avec les bonus** : Intégration de bonus spéciaux pour pimenter les parties et offrir des défis supplémentaires.
- **Récapitulatif de fin de tour** : Permettre aux joueurs de personnaliser les rôles et les attributions pour une expérience de jeu unique.
- **Récapitulatif de fin de partie** : Permettre aux joueurs de personnaliser les rôles et les attributions pour une expérience de jeu unique.
- **Gamification du jeu** : Intégration de récompenses, de niveaux et de défis pour encourager l'engagement et la fidélité des joueurs.
- **Intégration d'avatar** : Personnalisation des profils des joueurs avec des avatars uniques pour une expérience de jeu plus immersive.
- **Système de chat** : Ajout d'un chat en temps réel pour faciliter la communication entre les joueurs et renforcer l'interaction sociale.

#### Fonctionnalités spécifiques au multidevice

- **Mode spectateur** : Les joueurs non actifs pourront suivre le déroulement de la partie en temps réel.
- **Rejoindre la partie via QR code** : Les joueurs pourront rejoindre rapidement la partie en scannant un QR code unique.
- **Rejoindre via un lien de partage** : Un lien généré automatiquement contiendra le code de la partie pour un accès simplifié.
- **Contrôle avancé des règles** : Ajustements stratégiques et gestion optimisée des événements pour une flexibilité accrue.
- **Synchronisation renforcée** : Garantir une fluidité et une absence de latence pour une expérience sans interruption.

#### Interface Utilisateur

- **Gestion des erreurs** : Afficher des messages d'erreur clairs et informatifs pour guider les utilisateurs en cas de problème.
- **Optimisation des performances** : Améliorer la vitesse de chargement et la réactivité de l'application pour une expérience utilisateur optimale.

---

## Prérequis

Avant de commencer, assurez-vous d'avoir installé les éléments suivants :

- [Node.js](https://nodejs.org/) (Projet réalisé avec la version 20.11.1)
- [npm](https://www.npmjs.com/)
- Un compte [Neon](https://neon.tech/) pour la gestion de la base de données
- Un compte [Pusher](https://pusher.com/) pour les fonctionnalités temps réel


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
1. Créez un projet sur **Pusher.com**
2. 2Récupérez vos clés d'application : `PUSHER_APP_ID`, `PUSHER_APP_KEY`, `PUSHER_APP_SECRET` et `PUSHER_APP_CLUSTER`.
3. Ajoutez ces informations dans le fichier `.env` 

1. Générez le schéma Prisma basé sur la base de données :

```bash
npx prisma db pull
```

2. Appliquez les modifications et générez les fichiers Prisma :

```bash
npx prisma generate
```
### Exemple de fichier `.env`

Voici un exemple de configuration du fichier `.env` à utiliser pour votre projet :

```env
DATABASE_URL='postgresql://<username>:<password>@ep--busha2n7pl5f.eu-central-1.aws.neon.tech/ico_db?sslmode=require'
SHADOW_DATABASE_URL='postgresql://<username>:<password>@ep-old--.eu-central-1.aws.neon.tech/ico_db?sslmode=require'
JWT_SECRET="<votre_clé_secrète>"
NEXT_PUBLIC_PUSHER_APP_ID="<votre_app_id>"
NEXT_PUBLIC_PUSHER_APP_KEY="<votre_app_key>"
NEXT_PUBLIC_PUSHER_APP_SECRET="<votre_app_secret>"
NEXT_PUBLIC_PUSHER_APP_CLUSTER="eu"
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
npx prisma migrate dev --name <nom_migration>
```

---

## Structure du projet

Voici une brève description des dossiers principaux :

```
ICO-WORKSHOP/
├── prisma/            # Schéma Prisma et fichiers de configuration
├── public/            # Fichiers publics comme manifest.json, icônes, etc.
├── src/
   ├── styles/         # Fichiers de styles globaux et Tailwind CSS
   ├── context/        # Contextes de données partagées pour l'application entre les composants
   ├── components/     # Composants réutilisables
   ├── lib/            # Utilitaires (Prisma client, config, etc.)
   ├── api/            # Routes API
   ├── admin/          # Pages du back-office
├── app/               # Pages principales et structure de l'application
   ├── admin/          # Pages liées à l'administration
   ├── api/            # Endpoints API Next.js
   ├── auth-options/   # Pages d'authentification
   ├── feedback/       # Gestion des retours utilisateurs
   ├── multidevice/    # Pages dédiées au mode multidevice
   ├── not-mobile/     # Gestion des écrans non adaptés aux mobiles
   ├── onedevice/      # Pages pour les parties sur un seul appareil
   ├── profil/         # Pages de profil utilisateur
   ├── signin/         # Page de connexion
   ├── signup/         # Page d'inscription
   ├── globals.css     # Feuille de style globale
   ├── layout.tsx      # Layout principal de l'application
   ├── page.tsx        # Page principale
   ├── StoreProvider.tsx # Fournisseur de contexte pour l'état global
├── .env               # Variables d'environnement
```

### Livrables

**Backlog produit** : Liste priorisée des fonctionnalités à développer, accessible via Notion et **Tableau Scrum** : Organisation des sprints, incluant les tâches en cours, terminées, et à faire. : https://gravel-sandalwood-3e8.notion.site/17bfd919ac27807ab099e6284a12a002?v=17bfd919ac27814199dd000cf652a186&pvs=73
