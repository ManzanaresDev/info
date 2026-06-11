# 🛡️ Guide Complet de Sécurité Node.js

> **Objectif :** Mettre en service une application Node.js sécurisée de A à Z.  
> Ce guide couvre chaque couche : transport, authentification, données, dépendances, infrastructure.

---

## Table des matières

1. [Dépendances & Configuration initiale](#1-dépendances--configuration-initiale)
2. [HTTPS & Transport Layer Security](#2-https--transport-layer-security)
3. [HTTP Security Headers (Helmet)](#3-http-security-headers-helmet)
4. [Authentification & Sessions](#4-authentification--sessions)
5. [Hachage des mots de passe](#5-hachage-des-mots-de-passe)
6. [JSON Web Tokens (JWT)](#6-json-web-tokens-jwt)
7. [Validation & Assainissement des entrées](#7-validation--assainissement-des-entrées)
8. [Prévention des injections SQL](#8-prévention-des-injections-sql)
9. [Prévention XSS](#9-prévention-xss)
10. [Protection CSRF](#10-protection-csrf)
11. [Rate Limiting & Brute Force](#11-rate-limiting--brute-force)
12. [Gestion des secrets & Variables d'environnement](#12-gestion-des-secrets--variables-denvironnement)
13. [Sécurité des dépendances](#13-sécurité-des-dépendances)
14. [Logging & Monitoring de sécurité](#14-logging--monitoring-de-sécurité)
15. [CORS](#15-cors)
16. [Upload de fichiers sécurisé](#16-upload-de-fichiers-sécurisé)
17. [Checklist de déploiement](#17-checklist-de-déploiement)

---

## 1. Dépendances & Configuration initiale

### Installation des packages essentiels

```bash
# Sécurité HTTP
npm install helmet cors express-rate-limit

# Authentification
npm install bcrypt jsonwebtoken express-session connect-pg-simple

# Validation
npm install joi zod

# Protection CSRF
npm install csurf cookie-parser

# Variables d'environnement
npm install dotenv

# Logging sécurisé
npm install winston morgan

# Upload sécurisé
npm install multer

# Audit des vulnérabilités
npm audit
```

### Structure de projet recommandée

```
project/
├── src/
│   ├── middleware/
│   │   ├── auth.js          # Vérification JWT/session
│   │   ├── validate.js      # Validation des entrées
│   │   ├── rateLimiter.js   # Rate limiting
│   │   └── errorHandler.js  # Gestion des erreurs
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   └── utils/
│       └── logger.js
├── .env                     # NE PAS committer
├── .env.example             # Committer (valeurs vides)
├── .gitignore               # Inclure .env
└── server.js
```

### Configuration de base du serveur

```javascript
// server.js
'use strict'; // Active le mode strict

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

// Désactiver la signature du serveur
app.disable('x-powered-by'); // Helmet le fait aussi, double sécurité

// Parsers
app.use(express.json({ limit: '10kb' }));       // Limite la taille du body
app.use(express.urlencoded({ extended: false, limit: '10kb' }));
app.use(cookieParser());

module.exports = app;
```

---

## 2. HTTPS & Transport Layer Security

### Forcer le HTTPS en production

```javascript
// middleware/httpsRedirect.js
function httpsRedirect(req, res, next) {
  if (process.env.NODE_ENV === 'production' && !req.secure) {
    // Vérifier aussi le header X-Forwarded-Proto (proxy/load balancer)
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(301, `https://${req.hostname}${req.url}`);
    }
  }
  next();
}

module.exports = httpsRedirect;

// server.js
app.set('trust proxy', 1); // Faire confiance au premier proxy (Nginx, etc.)
app.use(httpsRedirect);
```

### Créer un certificat auto-signé (développement)

```bash
# Générer un certificat auto-signé pour le dev local
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem \
  -days 365 -nodes -subj '/CN=localhost'
```

```javascript
// server-https.js (développement)
const https = require('https');
const fs = require('fs');
const app = require('./server');

const options = {
  key: fs.readFileSync('./key.pem'),
  cert: fs.readFileSync('./cert.pem'),
  // TLS options de sécurité
  minVersion: 'TLSv1.2',          // Interdire TLS 1.0 et 1.1
  ciphers: [
    'TLS_AES_128_GCM_SHA256',
    'TLS_AES_256_GCM_SHA384',
    'ECDHE-RSA-AES128-GCM-SHA256',
    'ECDHE-RSA-AES256-GCM-SHA384',
  ].join(':'),
};

https.createServer(options, app).listen(443, () => {
  console.log('Serveur HTTPS démarré sur le port 443');
});

// Rediriger HTTP → HTTPS
const http = require('http');
http.createServer((req, res) => {
  res.writeHead(301, { Location: `https://${req.headers.host}${req.url}` });
  res.end();
}).listen(80);
```

> **En production :** Utilisez Let's Encrypt avec Certbot ou un service comme Cloudflare pour gérer les certificats TLS automatiquement.

---

## 3. HTTP Security Headers (Helmet)

### Configuration complète de Helmet

```javascript
// middleware/security-headers.js
const helmet = require('helmet');

const securityHeaders = helmet({
  // Content Security Policy — règle ce que le navigateur peut charger
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],            // Pas d'inline scripts
      styleSrc: ["'self'", "'unsafe-inline'"], // Adapter selon vos besoins
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],            // Interdire plugins Flash, etc.
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],             // Interdire iframes
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: [],
    },
  },

  // HTTP Strict Transport Security — forcer HTTPS pendant 1 an
  hsts: {
    maxAge: 31536000,           // 1 an en secondes
    includeSubDomains: true,    // Inclure les sous-domaines
    preload: true,              // Soumettre à la liste HSTS preload
  },

  // Bloquer le sniffing de type MIME
  noSniff: true,

  // Bloquer le clickjacking
  frameguard: { action: 'deny' },

  // Désactiver le DNS prefetching
  dnsPrefetchControl: { allow: false },

  // Désactiver le cache pour les pages sensibles
  noCache: false, // Gérer manuellement par route

  // Masquer la signature du serveur
  hidePoweredBy: true,

  // Referrer Policy
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },

  // Permissions Policy (anciennement Feature Policy)
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
});

module.exports = securityHeaders;

// server.js
const securityHeaders = require('./middleware/security-headers');
app.use(securityHeaders);
```

### Vérifier vos headers

```bash
# Tester vos headers avec curl
curl -I https://votre-app.com

# Ou utiliser le site securityheaders.com
# Score cible : A ou A+
```

---

## 4. Authentification & Sessions

### Configuration sécurisée des sessions Express

```javascript
// middleware/session.js
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const sessionConfig = {
  store: new pgSession({
    pool,
    tableName: 'user_sessions',
    // Nettoyer automatiquement les sessions expirées
    pruneSessionInterval: 60 * 15, // toutes les 15 min
  }),
  secret: process.env.SESSION_SECRET, // Au moins 32 caractères aléatoires
  resave: false,           // Ne pas resauvegarder si non modifiée
  saveUninitialized: false, // Ne pas créer de session vide
  name: 'sessionId',       // Ne pas utiliser le nom par défaut "connect.sid"
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS uniquement en prod
    httpOnly: true,         // Inaccessible au JavaScript côté client
    maxAge: 1000 * 60 * 60 * 2, // 2 heures
    sameSite: 'strict',     // Protection CSRF
    domain: process.env.COOKIE_DOMAIN, // '.votre-domaine.com'
    path: '/',
  },
};

module.exports = session(sessionConfig);

// server.js
const sessionMiddleware = require('./middleware/session');
app.use(sessionMiddleware);
```

### Middleware de vérification d'authentification

```javascript
// middleware/auth.js

// Vérification par session
function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Non authentifié' });
  }
  next();
}

// Vérification par rôle
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }
    if (!roles.includes(req.session.userRole)) {
      return res.status(403).json({ error: 'Accès interdit' });
    }
    next();
  };
}

// Régénération de session après connexion (prévient la fixation de session)
async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findByEmail(email);

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    // Message d'erreur générique — ne pas révéler si l'email existe
    return res.status(401).json({ error: 'Identifiants invalides' });
  }

  // ⚠️ CRITIQUE : régénérer l'ID de session après connexion
  req.session.regenerate((err) => {
    if (err) return next(err);
    req.session.userId = user.id;
    req.session.userRole = user.role;
    res.json({ message: 'Connecté', user: { id: user.id, email: user.email } });
  });
}

// Déconnexion propre
function logout(req, res) {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: 'Erreur lors de la déconnexion' });
    res.clearCookie('sessionId');
    res.json({ message: 'Déconnecté' });
  });
}

module.exports = { requireAuth, requireRole, login, logout };
```

---

## 5. Hachage des mots de passe

### Utiliser bcrypt correctement

```javascript
// utils/password.js
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 12; // Minimum 10, recommandé 12-14

/**
 * Hacher un mot de passe
 * Ne JAMAIS stocker le mot de passe en clair
 */
async function hashPassword(plaintext) {
  // bcrypt limite à 72 caractères — avertir si plus long
  if (plaintext.length > 72) {
    throw new Error('Mot de passe trop long (max 72 caractères)');
  }
  return bcrypt.hash(plaintext, SALT_ROUNDS);
}

/**
 * Vérifier un mot de passe
 * Utiliser bcrypt.compare — résiste aux timing attacks
 */
async function verifyPassword(plaintext, hash) {
  return bcrypt.compare(plaintext, hash);
}

/**
 * Valider la force du mot de passe
 */
function validatePasswordStrength(password) {
  const rules = [
    { test: /.{12,}/, message: 'Au moins 12 caractères' },
    { test: /[A-Z]/, message: 'Au moins une majuscule' },
    { test: /[a-z]/, message: 'Au moins une minuscule' },
    { test: /[0-9]/, message: 'Au moins un chiffre' },
    { test: /[^A-Za-z0-9]/, message: 'Au moins un caractère spécial' },
  ];

  const failures = rules
    .filter(rule => !rule.test.test(password))
    .map(rule => rule.message);

  return { valid: failures.length === 0, errors: failures };
}

module.exports = { hashPassword, verifyPassword, validatePasswordStrength };

// Exemple d'utilisation dans un contrôleur
const { hashPassword, verifyPassword, validatePasswordStrength } = require('./utils/password');

async function register(req, res) {
  const { email, password } = req.body;

  // Valider la force
  const { valid, errors } = validatePasswordStrength(password);
  if (!valid) {
    return res.status(400).json({ error: 'Mot de passe trop faible', details: errors });
  }

  const hash = await hashPassword(password);
  await User.create({ email, passwordHash: hash });

  res.status(201).json({ message: 'Compte créé' });
}
```

---

## 6. JSON Web Tokens (JWT)

### Implémentation sécurisée des JWT

```javascript
// utils/jwt.js
const jwt = require('jsonwebtoken');

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET;

if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
  throw new Error('Les secrets JWT ne sont pas définis dans les variables d\'environnement');
}

/**
 * Générer un access token (courte durée)
 */
function generateAccessToken(payload) {
  return jwt.sign(
    { sub: payload.userId, role: payload.role, type: 'access' },
    ACCESS_TOKEN_SECRET,
    {
      expiresIn: '15m',    // Courte durée — 15 minutes
      issuer: process.env.APP_URL,
      audience: process.env.APP_URL,
      algorithm: 'HS256',
    }
  );
}

/**
 * Générer un refresh token (longue durée)
 */
function generateRefreshToken(payload) {
  return jwt.sign(
    { sub: payload.userId, type: 'refresh' },
    REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Vérifier un token — toujours vérifier toutes les options
 */
function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_TOKEN_SECRET, {
    issuer: process.env.APP_URL,
    audience: process.env.APP_URL,
    algorithms: ['HS256'], // Explicitement whitelist l'algorithme
  });
}

module.exports = { generateAccessToken, generateRefreshToken, verifyAccessToken };

// middleware/jwtAuth.js
const { verifyAccessToken } = require('../utils/jwt');

function jwtAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  // Format attendu : "Bearer <token>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  const token = authHeader.slice(7); // Retirer "Bearer "

  try {
    const payload = verifyAccessToken(token);

    // Vérifier que c'est bien un access token
    if (payload.type !== 'access') {
      return res.status(401).json({ error: 'Type de token invalide' });
    }

    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expiré', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Token invalide' });
  }
}

module.exports = jwtAuth;
```

---

## 7. Validation & Assainissement des entrées

### Validation avec Joi

```javascript
// middleware/validate.js
const Joi = require('joi');

/**
 * Factory de middleware de validation
 */
function validate(schema, property = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,     // Retourner toutes les erreurs, pas juste la première
      allowUnknown: false,   // Rejeter les champs non déclarés
      stripUnknown: true,    // Retirer les champs non déclarés
    });

    if (error) {
      const details = error.details.map(d => ({
        field: d.path.join('.'),
        message: d.message,
      }));
      return res.status(400).json({ error: 'Données invalides', details });
    }

    req[property] = value; // Remplacer par les données validées et assainies
    next();
  };
}

// Schémas de validation
const schemas = {
  register: Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } }) // Valider le format email
      .max(255)
      .lowercase()   // Normaliser en minuscules
      .trim()
      .required(),
    password: Joi.string()
      .min(12)
      .max(72)       // Limite bcrypt
      .required(),
    name: Joi.string()
      .min(1)
      .max(100)
      .pattern(/^[\p{L}\p{M}'\s-]+$/u) // Lettres unicode, apostrophe, espace, tiret
      .trim()
      .required(),
  }),

  login: Joi.object({
    email: Joi.string().email().max(255).lowercase().trim().required(),
    password: Joi.string().max(200).required(),
  }),

  updateProfile: Joi.object({
    name: Joi.string().min(1).max(100).pattern(/^[\p{L}\p{M}'\s-]+$/u).trim(),
    bio: Joi.string().max(500).trim().allow(''),
    age: Joi.number().integer().min(13).max(120),
  }).min(1), // Au moins un champ requis

  id: Joi.object({
    id: Joi.string().uuid().required(), // Forcer le format UUID
  }),
};

module.exports = { validate, schemas };

// routes/auth.js
const express = require('express');
const { validate, schemas } = require('../middleware/validate');
const { login, logout } = require('../middleware/auth');

const router = express.Router();

router.post('/register', validate(schemas.register), registerController);
router.post('/login', validate(schemas.login), login);
router.post('/logout', logout);

module.exports = router;
```

---

## 8. Prévention des injections SQL

### Requêtes paramétrées obligatoires

```javascript
// ❌ JAMAIS FAIRE — injection SQL possible
async function getUserDangerous(email) {
  const query = `SELECT * FROM users WHERE email = '${email}'`;
  return db.query(query);
}

// Si email = "' OR '1'='1", la requête retourne TOUS les utilisateurs !

// ✅ Toujours utiliser des paramètres — avec pg (node-postgres)
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function getUserByEmail(email) {
  const { rows } = await pool.query(
    'SELECT id, email, name, role FROM users WHERE email = $1',
    [email] // Paramètre séparé — jamais interpolé dans la chaîne
  );
  return rows[0] || null;
}

async function getUserById(id) {
  const { rows } = await pool.query(
    'SELECT id, email, name, role FROM users WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}

// ✅ Avec plusieurs paramètres
async function createUser(email, passwordHash, name) {
  const { rows } = await pool.query(
    `INSERT INTO users (email, password_hash, name, created_at)
     VALUES ($1, $2, $3, NOW())
     RETURNING id, email, name`,
    [email, passwordHash, name]
  );
  return rows[0];
}

// ✅ Avec Prisma (ORM — paramètres automatiques)
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getUserByEmailPrisma(email) {
  // Prisma paramètre automatiquement toutes les requêtes
  return prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, role: true }, // Sélectionner uniquement ce qui est nécessaire
  });
}

// ⚠️ Si vous devez construire une requête dynamique (ORDER BY, etc.)
// Utilisez une whitelist, JAMAIS l'entrée utilisateur directement
const ALLOWED_SORT_FIELDS = ['name', 'email', 'created_at'];
const ALLOWED_SORT_DIRS = ['ASC', 'DESC'];

async function getUsers(sortBy = 'created_at', sortDir = 'DESC') {
  // Valider contre la whitelist
  if (!ALLOWED_SORT_FIELDS.includes(sortBy)) {
    throw new Error('Champ de tri invalide');
  }
  if (!ALLOWED_SORT_DIRS.includes(sortDir.toUpperCase())) {
    throw new Error('Direction de tri invalide');
  }

  // Sécurisé car on utilise notre whitelist, pas l'entrée brute
  const { rows } = await pool.query(
    `SELECT id, email, name FROM users ORDER BY ${sortBy} ${sortDir}`
  );
  return rows;
}
```

---

## 9. Prévention XSS

### Assainir la sortie HTML

```javascript
// npm install dompurify jsdom
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

/**
 * Assainir le HTML — retirer les scripts et attributs dangereux
 */
function sanitizeHtml(dirty) {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'a'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    FORCE_BODY: false,
    // Forcer les liens à s'ouvrir en nouvel onglet avec rel=noopener
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Échapper pour l'insertion dans du HTML (pas de Markdown/rich text)
 */
function escapeHtml(str) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return String(str).replace(/[&<>"'/]/g, char => map[char]);
}

// Middleware global — assainir toutes les réponses JSON contenant du HTML
function sanitizeResponse(req, res, next) {
  const originalJson = res.json.bind(res);
  res.json = (data) => {
    // Assainir récursivement les strings dans la réponse
    const sanitized = sanitizeObject(data);
    return originalJson(sanitized);
  };
  next();
}

function sanitizeObject(obj) {
  if (typeof obj === 'string') return escapeHtml(obj);
  if (Array.isArray(obj)) return obj.map(sanitizeObject);
  if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, sanitizeObject(v)])
    );
  }
  return obj;
}

module.exports = { sanitizeHtml, escapeHtml, sanitizeResponse };
```

---

## 10. Protection CSRF

### Protection avec double-submit cookie

```javascript
// npm install csurf
const csrf = require('csurf');
const cookieParser = require('cookie-parser');

// Configuration CSRF
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  },
});

// Route pour récupérer le token CSRF (API RESTful)
// GET /api/csrf-token
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Appliquer la protection aux routes mutantes
app.use('/api', csrfProtection);

// Gestion des erreurs CSRF
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({ error: 'Token CSRF invalide ou expiré' });
  }
  next(err);
});

// Côté client (fetch) :
/*
  // 1. Récupérer le token
  const { csrfToken } = await fetch('/api/csrf-token').then(r => r.json());

  // 2. L'inclure dans chaque requête mutante
  await fetch('/api/data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
    },
    body: JSON.stringify(data),
  });
*/

// Alternative sans bibliothèque — vérification de l'origine
function validateOrigin(req, res, next) {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const origin = req.get('origin') || req.get('referer');

    if (!origin) {
      // Pas d'origin — refuser (ou accepter si API purement serveur-à-serveur)
      return res.status(403).json({ error: 'Origin manquant' });
    }

    const allowedOrigins = [process.env.FRONTEND_URL];
    const isAllowed = allowedOrigins.some(allowed => origin.startsWith(allowed));

    if (!isAllowed) {
      return res.status(403).json({ error: 'Origin non autorisé' });
    }
  }
  next();
}
```

---

## 11. Rate Limiting & Brute Force

### Limiter les tentatives par route

```javascript
// middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis'); // npm install rate-limit-redis
const redis = require('redis');

const redisClient = redis.createClient({ url: process.env.REDIS_URL });

// Rate limiter global — toutes les routes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Fenêtre de 15 minutes
  max: 200,                  // Max 200 requêtes par IP
  standardHeaders: true,     // Envoyer les headers RateLimit-*
  legacyHeaders: false,
  message: { error: 'Trop de requêtes, réessayez dans 15 minutes' },
});

// Rate limiter strict pour l'authentification
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,                   // Max 10 tentatives de connexion / 15 min
  skipSuccessfulRequests: true, // Ne pas compter les succès
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de tentatives de connexion, réessayez dans 15 minutes' },
  // Optionnel : stocker dans Redis pour partager entre instances
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
  }),
});

// Rate limiter pour les API publiques
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 60,              // 60 requêtes/minute
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Utiliser l'utilisateur authentifié si dispo, sinon l'IP
    return req.user?.id || req.ip;
  },
});

// Rate limiter pour la réinitialisation de mot de passe
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 3,                    // 3 demandes/heure max
  standardHeaders: true,
  message: { error: 'Trop de demandes de réinitialisation' },
});

module.exports = { globalLimiter, authLimiter, apiLimiter, passwordResetLimiter };

// server.js
const { globalLimiter, authLimiter, apiLimiter } = require('./middleware/rateLimiter');

app.use(globalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api', apiLimiter);
```

---

## 12. Gestion des secrets & Variables d'environnement

### Configuration des variables d'environnement

```bash
# .env.example — committer ce fichier (sans valeurs réelles)
NODE_ENV=development
PORT=3000

# Base de données
DATABASE_URL=postgresql://user:password@localhost:5432/mydb

# Secrets — générer avec : node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
SESSION_SECRET=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=

# URLs
APP_URL=https://monapp.com
FRONTEND_URL=https://monapp.com
COOKIE_DOMAIN=.monapp.com

# Redis
REDIS_URL=redis://localhost:6379

# Email
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=

# Services tiers
STRIPE_SECRET_KEY=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```

```javascript
// config/env.js — Valider toutes les variables au démarrage
const requiredEnvVars = [
  'NODE_ENV',
  'DATABASE_URL',
  'SESSION_SECRET',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'APP_URL',
];

function validateEnv() {
  const missing = requiredEnvVars.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error(`❌ Variables d'environnement manquantes : ${missing.join(', ')}`);
    process.exit(1); // Arrêter l'app immédiatement
  }

  // Vérifier la longueur des secrets
  const shortSecrets = ['SESSION_SECRET', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET']
    .filter(key => process.env[key]?.length < 32);

  if (shortSecrets.length > 0) {
    console.error(`❌ Secrets trop courts (min 32 chars) : ${shortSecrets.join(', ')}`);
    process.exit(1);
  }

  console.log('✅ Variables d\'environnement validées');
}

module.exports = { validateEnv };

// server.js — Appeler AVANT tout le reste
require('dotenv').config();
const { validateEnv } = require('./config/env');
validateEnv();
```

```gitignore
# .gitignore — NE JAMAIS committer les secrets
.env
.env.local
.env.*.local
*.pem
*.key
*.p12
node_modules/
```

---

## 13. Sécurité des dépendances

### Audit et maintenance

```bash
# Auditer les vulnérabilités (à exécuter régulièrement)
npm audit

# Corriger les vulnérabilités automatiquement (mineures/patch)
npm audit fix

# Forcer la correction (attention aux breaking changes)
npm audit fix --force

# Voir les paquets obsolètes
npm outdated

# Mettre à jour les paquets en respectant le semver
npm update

# Outil interactif de mise à jour
npx npm-check-updates -i

# Vérifier les licences des dépendances
npx license-checker --onlyAllow "MIT;Apache-2.0;ISC;BSD-2-Clause;BSD-3-Clause;0BSD;Unlicense"

# Vérifier avec Snyk (plus complet que npm audit)
npx snyk test
```

### Verrouiller les versions en production

```json
// package.json — éviter les ^ pour les dépendances de production critiques
{
  "dependencies": {
    "express": "4.18.2",     // Version exacte — pas de ^4.18.2
    "bcrypt": "5.1.1",
    "jsonwebtoken": "9.0.2"
  },
  "scripts": {
    "preinstall": "node -e \"if(process.env.NODE_ENV==='production' && !process.env.CI) { console.error('Utilisez npm ci en production'); process.exit(1); }\"",
    "security:audit": "npm audit --audit-level=moderate",
    "security:check": "npm audit && npx snyk test"
  }
}
```

```bash
# En production : utiliser npm ci (respecte package-lock.json)
npm ci --only=production

# Jamais npm install en production (peut modifier le lock file)
```

### Intégration CI/CD

```yaml
# .github/workflows/security.yml
name: Security Audit

on: [push, pull_request]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm audit --audit-level=moderate
      - name: Run Snyk
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

---

## 14. Logging & Monitoring de sécurité

### Logger structuré avec Winston

```javascript
// utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json() // JSON structuré — facile à parser par des outils
  ),
  defaultMeta: {
    service: process.env.SERVICE_NAME || 'api',
    environment: process.env.NODE_ENV,
  },
  transports: [
    // Logs d'erreur dans un fichier séparé
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 10 * 1024 * 1024,  // 10 MB
      maxFiles: 5,
      tailable: true,
    }),
    // Tous les logs
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5,
    }),
  ],
});

// En développement — afficher dans la console aussi
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }));
}

module.exports = logger;

// middleware/securityLogger.js
const logger = require('../utils/logger');

/**
 * Logger les événements de sécurité importants
 */
const securityLogger = {
  loginSuccess: (req, userId) => {
    logger.info('auth.login.success', {
      userId,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      timestamp: new Date().toISOString(),
    });
  },

  loginFailure: (req, email) => {
    logger.warn('auth.login.failure', {
      email, // Attention : anonymiser si nécessaire (RGPD)
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
  },

  suspiciousActivity: (req, reason) => {
    logger.error('security.suspicious', {
      reason,
      ip: req.ip,
      path: req.path,
      method: req.method,
      userAgent: req.get('user-agent'),
      userId: req.user?.id,
    });
  },

  accessDenied: (req, resource) => {
    logger.warn('auth.access.denied', {
      resource,
      userId: req.user?.id,
      ip: req.ip,
      path: req.path,
    });
  },
};

module.exports = securityLogger;

// Middleware de logging des requêtes HTTP (Morgan + Winston)
const morgan = require('morgan');

const httpLogger = morgan('combined', {
  stream: { write: (message) => logger.http(message.trim()) },
  skip: (req) => req.path === '/health', // Ne pas logger les health checks
});

module.exports = { httpLogger };
```

---

## 15. CORS

### Configuration CORS stricte

```javascript
// middleware/cors.js
const cors = require('cors');

const allowedOrigins = [
  process.env.FRONTEND_URL,            // https://monapp.com
  'https://app.monapp.com',            // Sous-domaine autorisé
  ...(process.env.NODE_ENV === 'development'
    ? ['http://localhost:3000', 'http://localhost:5173'] // Dev uniquement
    : []),
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Autoriser les requêtes sans origin (Postman, curl, serveur-à-serveur)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: Origin non autorisé — ${origin}`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  exposedHeaders: ['RateLimit-Limit', 'RateLimit-Remaining'],
  credentials: true,   // Autoriser les cookies cross-origin
  maxAge: 86400,       // Cache preflight pendant 24h
  optionsSuccessStatus: 204,
};

module.exports = cors(corsOptions);

// server.js
const corsMiddleware = require('./middleware/cors');
app.use(corsMiddleware);
// Gérer les preflight OPTIONS explicitement
app.options('*', corsMiddleware);
```

---

## 16. Upload de fichiers sécurisé

### Validation stricte des fichiers

```javascript
// middleware/upload.js
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// Types MIME autorisés
const ALLOWED_MIME_TYPES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'application/pdf': '.pdf',
};

// Stocker avec un nom aléatoire — jamais le nom original
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Créer le dossier si inexistant
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = ALLOWED_MIME_TYPES[file.mimetype];
    if (!ext) return cb(new Error('Type de fichier non autorisé'));

    // Nom aléatoire cryptographiquement sûr
    const randomName = crypto.randomBytes(32).toString('hex');
    cb(null, `${randomName}${ext}`);
  },
});

// Filtre de type MIME
const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Type de fichier non autorisé'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 5,        // Max 5 fichiers simultanés
    fields: 10,      // Max 10 champs non-fichier
  },
});

/**
 * Vérification supplémentaire du magic number (signature binaire)
 * Le type MIME déclaré peut être truqué — vérifier le vrai format
 */
async function verifyFileMagicNumber(filePath, declaredMimeType) {
  const magicNumbers = {
    'image/jpeg': [0xFF, 0xD8, 0xFF],
    'image/png': [0x89, 0x50, 0x4E, 0x47],
    'image/gif': [0x47, 0x49, 0x46],
    'image/webp': [0x52, 0x49, 0x46, 0x46],
    'application/pdf': [0x25, 0x50, 0x44, 0x46],
  };

  const expected = magicNumbers[declaredMimeType];
  if (!expected) return false;

  const buffer = Buffer.alloc(expected.length);
  const fd = fs.openSync(filePath, 'r');
  fs.readSync(fd, buffer, 0, expected.length, 0);
  fs.closeSync(fd);

  return expected.every((byte, i) => buffer[i] === byte);
}

// Middleware d'upload avec vérification complète
function secureUpload(fieldName) {
  return async (req, res, next) => {
    upload.single(fieldName)(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: `Fichier trop volumineux (max ${MAX_FILE_SIZE / 1024 / 1024} MB)` });
        }
        return res.status(400).json({ error: err.message });
      }
      if (err) return res.status(400).json({ error: err.message });
      if (!req.file) return next();

      // Vérifier le magic number
      const isValid = await verifyFileMagicNumber(req.file.path, req.file.mimetype);
      if (!isValid) {
        fs.unlinkSync(req.file.path); // Supprimer le fichier suspect
        return res.status(400).json({ error: 'Fichier corrompu ou type incorrect' });
      }

      // Stocker le nom original de façon sécurisée (sanitisé) pour les métadonnées
      req.file.originalName = path.basename(req.file.originalname).replace(/[^a-zA-Z0-9._-]/g, '');

      next();
    });
  };
}

module.exports = { secureUpload };
```

---

## 17. Checklist de déploiement

### À vérifier avant chaque mise en production

```bash
#!/bin/bash
# scripts/security-check.sh

echo "🔒 Vérification de sécurité avant déploiement..."
ERRORS=0

# 1. Audit des dépendances
echo "\n[1/8] Audit des dépendances..."
npm audit --audit-level=moderate || { echo "❌ Vulnérabilités détectées"; ERRORS=$((ERRORS+1)); }

# 2. Variables d'environnement requises
echo "\n[2/8] Vérification des variables d'environnement..."
for var in NODE_ENV DATABASE_URL SESSION_SECRET JWT_ACCESS_SECRET JWT_REFRESH_SECRET; do
  if [ -z "${!var}" ]; then
    echo "❌ $var manquante"
    ERRORS=$((ERRORS+1))
  fi
done

# 3. NODE_ENV = production
if [ "$NODE_ENV" != "production" ]; then
  echo "❌ NODE_ENV doit être 'production'"
  ERRORS=$((ERRORS+1))
fi

# 4. Vérifier que .env n'est pas commité
if git ls-files --error-unmatch .env 2>/dev/null; then
  echo "❌ .env est suivi par git — retirer immédiatement !"
  ERRORS=$((ERRORS+1))
fi

# 5. Longueur des secrets
if [ ${#SESSION_SECRET} -lt 32 ]; then
  echo "❌ SESSION_SECRET trop court"
  ERRORS=$((ERRORS+1))
fi

# 6. Vérifier que les tests passent
echo "\n[6/8] Exécution des tests..."
npm test || { echo "❌ Tests échoués"; ERRORS=$((ERRORS+1)); }

# 7. Vérifier qu'on est sur la bonne branche
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" != "main" ] && [ "$BRANCH" != "master" ]; then
  echo "⚠️  Déploiement depuis la branche $BRANCH (attendu: main/master)"
fi

# Résultat final
echo "\n================================"
if [ $ERRORS -eq 0 ]; then
  echo "✅ Toutes les vérifications sont passées — prêt pour le déploiement"
  exit 0
else
  echo "❌ $ERRORS erreur(s) détectée(s) — déploiement bloqué"
  exit 1
fi
```

### Récapitulatif des mesures de sécurité

| Mesure | Bibliothèque | Priorité |
|---|---|---|
| Security Headers | `helmet` | 🔴 Critique |
| HTTPS forcé | Nginx / `https` | 🔴 Critique |
| Hachage bcrypt | `bcrypt` | 🔴 Critique |
| Requêtes paramétrées SQL | `pg` / Prisma | 🔴 Critique |
| Validation des entrées | `joi` / `zod` | 🔴 Critique |
| Gestion des secrets | `.env` + validation | 🔴 Critique |
| JWT sécurisé | `jsonwebtoken` | 🟠 Important |
| Sessions sécurisées | `express-session` | 🟠 Important |
| Protection CSRF | `csurf` | 🟠 Important |
| Rate Limiting | `express-rate-limit` | 🟠 Important |
| CORS strict | `cors` | 🟠 Important |
| Logging sécurité | `winston` | 🟡 Recommandé |
| Upload sécurisé | `multer` + magic bytes | 🟡 Recommandé |
| Audit des dépendances | `npm audit` / Snyk | 🟡 Recommandé |
| Anti-XSS | `dompurify` | 🟡 Recommandé |

---

## Ressources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/) — Les 10 vulnérabilités web les plus critiques
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security) — Documentation officielle
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Security Headers](https://securityheaders.com) — Tester vos headers en ligne
- [Snyk](https://snyk.io) — Scanner de vulnérabilités
- [Have I Been Pwned API](https://haveibeenpwned.com/API/v3) — Vérifier les mots de passe compromis

---

*Guide généré le 31 mai 2026 — À réviser régulièrement avec les mises à jour de l'écosystème Node.js.*
