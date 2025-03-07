# Parser Avancé pour Simple-JobBoard

Ce module fournit un parser avancé pour améliorer la qualité des données des candidats dans l'application Simple-JobBoard.

## Fonctionnalités

- Analyse avancée des réponses du questionnaire
- Normalisation des données (corrections d'orthographe, formats standardisés)
- Détection des incohérences dans les réponses
- Génération de tags pour faciliter le matching
- Évaluation de la qualité des données
- API REST pour intégration avec le frontend

## Prérequis

- Node.js (v14+)
- Python (v3.7+)
- pandas (bibliothèque Python)

## Installation

1. Installer les dépendances Node.js :

```bash
cd parsers
npm install
```

2. Installer les dépendances Python :

```bash
pip install pandas
```

## Démarrage du serveur

```bash
cd parsers
npm start
```

Le serveur API démarrera sur le port 3000 par défaut.

## Tests

Pour tester l'API, vous pouvez utiliser l'URL suivante :

```
http://localhost:3000/api/test
```

## Intégration

L'API est automatiquement utilisée par l'application frontend lorsque le serveur est en cours d'exécution. Si le serveur n'est pas disponible, l'application utilisera le parser standard.

## Structure des données

Le parser transforme les données brutes du questionnaire en un format structuré avec :

- Données normalisées pour chaque section
- Tags de matching générés automatiquement
- Métadonnées sur la qualité des données
- Détection des incohérences potentielles

## Architecture

```
parsers/
  ├── candidate_parser.py  # Parser Python
  ├── server.js           # Serveur API Express
  ├── package.json        # Dépendances Node.js
  └── README.md           # Documentation
```

## Développement

Pour le développement en mode "watch" (redémarrage automatique) :

```bash
npm run dev
```