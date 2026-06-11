# Manuel du Rate Limiting pour Formulaires Web

> **Protection anti-abus par limitation de fréquence**  
> Guide complet : principes, mise en place, exemples de code

---

## Table des matières

1. [Qu'est-ce que le Rate Limiting ?](#1-quest-ce-que-le-rate-limiting)
2. [Pourquoi c'est supérieur au honeypot seul ?](#2-pourquoi-cest-supérieur-au-honeypot-seul)
3. [Les stratégies de Rate Limiting](#3-les-stratégies-de-rate-limiting)
4. [Où mettre en place le Rate Limiting ?](#4-où-mettre-en-place-le-rate-limiting)
5. [Implémentation côté serveur](#5-implémentation-côté-serveur)
6. [Implémentation côté client (complément)](#6-implémentation-côté-client-complément)
7. [Rate Limiting avec une base de données](#7-rate-limiting-avec-une-base-de-données)
8. [Rate Limiting avec Redis](#8-rate-limiting-avec-redis)
9. [Intégration dans les frameworks populaires](#9-intégration-dans-les-frameworks-populaires)
10. [Codes de réponse et messages d'erreur](#10-codes-de-réponse-et-messages-derreur)
11. [Bonnes pratiques et pièges à éviter](#11-bonnes-pratiques-et-pièges-à-éviter)
12. [Cas d'usage : formulaire de contact](#12-cas-dusage--formulaire-de-contact)
13. [Résumé visuel des couches de protection](#13-résumé-visuel-des-couches-de-protection)

---

## 1. Qu'est-ce que le Rate Limiting ?

Le **rate limiting** (limitation de fréquence) est une technique qui consiste à **limiter le nombre de requêtes** qu'un utilisateur, une IP ou un client peut envoyer dans un intervalle de temps donné.

### Principe de base

```
Règle : max 5 soumissions par IP par 10 minutes
─────────────────────────────────────────────────
192.168.1.1  →  envoi #1  ✅  (compteur : 1/5)
192.168.1.1  →  envoi #2  ✅  (compteur : 2/5)
192.168.1.1  →  envoi #3  ✅  (compteur : 3/5)
192.168.1.1  →  envoi #4  ✅  (compteur : 4/5)
192.168.1.1  →  envoi #5  ✅  (compteur : 5/5)
192.168.1.1  →  envoi #6  ❌  429 Too Many Requests
192.168.1.1  →  envoi #7  ❌  429 Too Many Requests
... (bloqué jusqu'à expiration de la fenêtre)
```

### Vocabulaire clé

| Terme | Définition |
|---|---|
| **Fenêtre de temps** | Durée pendant laquelle on compte les requêtes (ex: 10 min) |
| **Seuil (threshold)** | Nombre max de requêtes autorisées dans cette fenêtre |
| **Identifiant** | Ce qui permet d'identifier le demandeur (IP, token, email…) |
| **Backoff** | Temps d'attente imposé après dépassement |
| **429** | Code HTTP standard pour "Too Many Requests" |

---

## 2. Pourquoi c'est supérieur au honeypot seul ?

| Critère | Honeypot | Rate Limiting |
|---|---|---|
| Bloque les bots simples | ✅ Oui | ✅ Oui |
| Bloque les bots "intelligents" | ❌ Non | ✅ Oui |
| Bloque les humains malveillants | ❌ Non | ✅ Oui |
| Résiste au contournement JS | ❌ Non | ✅ Oui |
| Indépendant du comportement du bot | ❌ Non | ✅ Oui |
| Transparence pour l'utilisateur | ✅ Invisible | ⚠️ Peut afficher une erreur |

> **Conclusion** : Le rate limiting bloque par la **fréquence**, peu importe **comment** le formulaire est rempli. Même un humain qui tente d'abuser du formulaire sera stoppé.

---

## 3. Les stratégies de Rate Limiting

### 3.1 Fenêtre fixe (Fixed Window)

La plus simple. On compte les requêtes dans une fenêtre de temps fixe (ex : de 14h00 à 14h10).

```
Fenêtre : 14:00 → 14:10
[------|------]
 1 2 3 4 5    ← max 5, OK
 
Fenêtre : 14:10 → 14:20
[------|------]
 reset : compteur revient à 0
```

**Avantage** : Simple à implémenter.  
**Inconvénient** : Vulnérable à une rafale en fin/début de fenêtre (10 req à 14:09 + 10 req à 14:11 = 20 req en 2 minutes).

---

### 3.2 Fenêtre glissante (Sliding Window)

La fenêtre se déplace avec le temps. On regarde les N dernières minutes depuis maintenant.

```
Maintenant : 14:12
Fenêtre glissante : 14:02 → 14:12
→ On compte TOUTES les requêtes dans cet intervalle mobile
```

**Avantage** : Plus précis, pas de pic en bordure de fenêtre.  
**Inconvénient** : Requiert de stocker les timestamps de chaque requête.

---

### 3.3 Token Bucket (Seau de jetons)

Chaque utilisateur a un "seau" avec N jetons. Chaque requête consomme un jeton. Les jetons se rechargent à un rythme fixe.

```
Seau : capacité 10 jetons
Recharge : 1 jeton / minute

État initial : [●●●●●●●●●●] 10 jetons
Après 5 req  : [●●●●●○○○○○] 5 jetons
Après 5 req  : [○○○○○○○○○○] 0 jeton → BLOQUÉ
Après 5 min  : [●●●●●○○○○○] 5 jetons rechargés
```

**Avantage** : Permet des pics courts, lisse le trafic sur la durée.  
**Usage** : Idéal pour les API.

---

### 3.4 Leaky Bucket (Seau percé)

Les requêtes entrent dans un seau et en sortent à débit constant, peu importe les pics.

**Usage** : Lissage de trafic réseau.  
**Pour les formulaires** : Moins adapté, Token Bucket ou Sliding Window sont préférables.

---

## 4. Où mettre en place le Rate Limiting ?

Le rate limiting peut (et doit idéalement) être appliqué à **plusieurs niveaux** :

```
Utilisateur
    │
    ▼
[Navigateur]          ← Niveau 1 : désactiver le bouton après envoi (UX)
    │
    ▼
[CDN / Proxy]         ← Niveau 2 : Cloudflare, Nginx, Apache (avant le serveur)
    │
    ▼
[Serveur Web]         ← Niveau 3 : middleware Express, Django, Laravel...
    │
    ▼
[Base de données]     ← Niveau 4 : vérification avec Redis ou table SQL
    │
    ▼
[Service email]       ← Niveau 5 : SendGrid, Mailgun ont leur propre rate limiting
```

> **Règle d'or** : Ne jamais faire confiance uniquement au client. Le rate limiting **côté serveur est obligatoire**. Le côté client est un complément UX.

---

## 5. Implémentation côté serveur

### 5.1 Node.js / Express avec `express-rate-limit`

```bash
npm install express-rate-limit
```

```javascript
// rateLimiter.js
const rateLimit = require('express-rate-limit');

// Limiter global pour toutes les routes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // max 100 requêtes par IP
  standardHeaders: true,     // Ajoute les headers Rate-Limit-*
  legacyHeaders: false,
  message: {
    status: 429,
    error: 'Trop de requêtes. Réessayez dans 15 minutes.'
  }
});

// Limiter strict pour le formulaire de contact
const contactFormLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,                    // max 5 soumissions par IP
  message: {
    status: 429,
    error: 'Vous avez soumis trop de formulaires. Attendez 10 minutes.'
  },
  // Optionnel : ne compter que les requêtes réussies
  skipFailedRequests: false,
  skipSuccessfulRequests: false,
});

module.exports = { globalLimiter, contactFormLimiter };
```

```javascript
// app.js
const express = require('express');
const { globalLimiter, contactFormLimiter } = require('./rateLimiter');

const app = express();
app.use(express.json());

// Appliquer le limiter global
app.use(globalLimiter);

// Route du formulaire de contact avec limiter strict
app.post('/contact', contactFormLimiter, (req, res) => {
  const { name, email, message } = req.body;
  // Traitement du formulaire...
  res.json({ success: true, message: 'Message envoyé !' });
});

app.listen(3000);
```

---

### 5.2 Python / Flask avec `Flask-Limiter`

```bash
pip install Flask-Limiter
```

```python
# app.py
from flask import Flask, request, jsonify
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

app = Flask(__name__)

# Initialisation du limiter (clé = adresse IP)
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"  # Remplacer par Redis en production
)

@app.route('/contact', methods=['POST'])
@limiter.limit("5 per 10 minutes")  # Règle spécifique à cette route
def contact():
    data = request.json
    # Traitement...
    return jsonify({"success": True, "message": "Message envoyé !"})

@app.errorhandler(429)
def ratelimit_error(e):
    return jsonify({
        "error": "Trop de requêtes.",
        "message": str(e.description),
        "retry_after": e.retry_after
    }), 429

if __name__ == '__main__':
    app.run()
```

---

### 5.3 PHP (natif, sans framework)

```php
<?php
// rate_limiter.php

class RateLimiter {
    private string $storageDir;
    private int $maxRequests;
    private int $windowSeconds;

    public function __construct(int $maxRequests = 5, int $windowSeconds = 600) {
        $this->storageDir = sys_get_temp_dir() . '/rate_limits/';
        $this->maxRequests = $maxRequests;
        $this->windowSeconds = $windowSeconds;

        if (!is_dir($this->storageDir)) {
            mkdir($this->storageDir, 0755, true);
        }
    }

    private function getKey(string $ip): string {
        // Sanitisation de l'IP pour usage comme nom de fichier
        return $this->storageDir . md5($ip) . '.json';
    }

    public function isAllowed(string $ip): bool {
        $file = $this->getKey($ip);
        $now = time();
        $data = ['requests' => []];

        if (file_exists($file)) {
            $data = json_decode(file_get_contents($file), true);
        }

        // Supprimer les entrées expirées (fenêtre glissante)
        $data['requests'] = array_filter(
            $data['requests'],
            fn($timestamp) => ($now - $timestamp) < $this->windowSeconds
        );

        if (count($data['requests']) >= $this->maxRequests) {
            return false; // Bloqué
        }

        // Enregistrer cette requête
        $data['requests'][] = $now;
        file_put_contents($file, json_encode($data));

        return true;
    }

    public function getRemainingRequests(string $ip): int {
        $file = $this->getKey($ip);
        if (!file_exists($file)) return $this->maxRequests;

        $data = json_decode(file_get_contents($file), true);
        $now = time();
        $active = array_filter(
            $data['requests'],
            fn($t) => ($now - $t) < $this->windowSeconds
        );

        return max(0, $this->maxRequests - count($active));
    }
}

// Utilisation dans contact.php
require_once 'rate_limiter.php';

$limiter = new RateLimiter(maxRequests: 5, windowSeconds: 600);
$ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';

if (!$limiter->isAllowed($ip)) {
    http_response_code(429);
    header('Content-Type: application/json');
    header('Retry-After: 600');
    echo json_encode([
        'error' => 'Trop de soumissions.',
        'message' => 'Vous pouvez soumettre ce formulaire 5 fois par 10 minutes.'
    ]);
    exit;
}

// Suite du traitement du formulaire...
```

---

### 5.4 Django avec `django-ratelimit`

```bash
pip install django-ratelimit
```

```python
# views.py
from django.http import JsonResponse
from django_ratelimit.decorators import ratelimit
from django.views.decorators.csrf import csrf_exempt
import json

@csrf_exempt
@ratelimit(key='ip', rate='5/10m', method='POST', block=True)
def contact(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        # Traitement...
        return JsonResponse({'success': True})
    return JsonResponse({'error': 'Méthode non autorisée'}, status=405)
```

```python
# settings.py — Personnaliser la réponse 429
RATELIMIT_VIEW = 'myapp.views.ratelimited_error'

# views.py
def ratelimited_error(request, exception):
    return JsonResponse({
        'error': 'Trop de requêtes.',
        'message': 'Réessayez dans quelques minutes.'
    }, status=429)
```

---

## 6. Implémentation côté client (complément)

> ⚠️ Ce n'est **pas** une vraie protection — un utilisateur malveillant peut contourner le JS. C'est uniquement pour l'**expérience utilisateur**.

```html
<!-- contact.html -->
<form id="contactForm">
  <input type="text" name="name" placeholder="Nom" required>
  <input type="email" name="email" placeholder="Email" required>
  <textarea name="message" placeholder="Message" required></textarea>
  <button type="submit" id="submitBtn">Envoyer</button>
  <p id="statusMsg" style="display:none;"></p>
</form>

<script>
const form = document.getElementById('contactForm');
const btn = document.getElementById('submitBtn');
const status = document.getElementById('statusMsg');

// Cooldown côté client : 30 secondes entre deux envois
const CLIENT_COOLDOWN_MS = 30000;

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Désactiver le bouton immédiatement
  btn.disabled = true;
  btn.textContent = 'Envoi en cours...';

  try {
    const response = await fetch('/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(new FormData(form)))
    });

    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After') || 600;
      showError(`Trop de messages envoyés. Réessayez dans ${Math.ceil(retryAfter / 60)} minutes.`);
      // Garder le bouton désactivé plus longtemps
      setTimeout(reenableButton, retryAfter * 1000);
      return;
    }

    const data = await response.json();
    if (data.success) {
      showSuccess('Message envoyé avec succès !');
      form.reset();
    }
  } catch (err) {
    showError('Erreur réseau. Réessayez.');
  }

  // Réactiver après le cooldown client
  setTimeout(reenableButton, CLIENT_COOLDOWN_MS);
});

function reenableButton() {
  btn.disabled = false;
  btn.textContent = 'Envoyer';
}

function showSuccess(msg) {
  status.style.display = 'block';
  status.style.color = 'green';
  status.textContent = msg;
}

function showError(msg) {
  status.style.display = 'block';
  status.style.color = 'red';
  status.textContent = msg;
}
</script>
```

---

## 7. Rate Limiting avec une base de données

Pour persister les compteurs entre redémarrages du serveur, on peut utiliser une table SQL.

### Schéma MySQL / PostgreSQL

```sql
CREATE TABLE rate_limit_log (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    identifier  VARCHAR(64)  NOT NULL,   -- IP ou email hashé
    action      VARCHAR(64)  NOT NULL,   -- ex: 'contact_form'
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_identifier_action (identifier, action, created_at)
);
```

### Vérification en SQL (fenêtre glissante)

```sql
-- Compter les soumissions de cette IP dans les 10 dernières minutes
SELECT COUNT(*) AS total
FROM rate_limit_log
WHERE identifier = '192.168.1.1'
  AND action = 'contact_form'
  AND created_at > NOW() - INTERVAL 10 MINUTE;

-- Si total >= 5 → bloquer
-- Sinon → insérer et continuer
INSERT INTO rate_limit_log (identifier, action) VALUES ('192.168.1.1', 'contact_form');
```

### Nettoyage automatique (cron)

```sql
-- À exécuter toutes les heures pour éviter que la table grossisse
DELETE FROM rate_limit_log WHERE created_at < NOW() - INTERVAL 1 DAY;
```

---

## 8. Rate Limiting avec Redis

Redis est la solution recommandée en production pour sa **rapidité** et son support natif des TTL.

### Pourquoi Redis ?

- Opérations atomiques (pas de race condition)
- Expiration automatique des clés (TTL natif)
- Très faible latence (~0.1ms)
- Scalable sur plusieurs serveurs

### Node.js avec `ioredis`

```bash
npm install ioredis
```

```javascript
// redisRateLimiter.js
const Redis = require('ioredis');
const redis = new Redis({ host: 'localhost', port: 6379 });

async function checkRateLimit(ip, action = 'contact', max = 5, windowSec = 600) {
  const key = `rate:${action}:${ip}`;
  
  // Utilise MULTI pour une transaction atomique
  const pipeline = redis.pipeline();
  pipeline.incr(key);           // Incrémenter le compteur
  pipeline.expire(key, windowSec); // Définir/renouveler le TTL
  
  const results = await pipeline.exec();
  const count = results[0][1]; // Résultat de INCR

  return {
    allowed: count <= max,
    count,
    remaining: Math.max(0, max - count),
    resetIn: windowSec
  };
}

module.exports = { checkRateLimit };
```

```javascript
// Dans votre route Express
const { checkRateLimit } = require('./redisRateLimiter');

app.post('/contact', async (req, res) => {
  const ip = req.ip;
  const result = await checkRateLimit(ip, 'contact', 5, 600);

  if (!result.allowed) {
    return res.status(429).json({
      error: 'Trop de requêtes',
      remaining: 0,
      resetIn: result.resetIn
    });
  }

  // Headers informatifs
  res.set('X-RateLimit-Limit', 5);
  res.set('X-RateLimit-Remaining', result.remaining);

  // Traitement du formulaire...
  res.json({ success: true });
});
```

---

## 9. Intégration dans les frameworks populaires

### Laravel (PHP)

Laravel a un système de rate limiting intégré via les **middlewares**.

```php
// routes/web.php ou routes/api.php
use Illuminate\Support\Facades\Route;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;

// Définir le limiter dans AppServiceProvider ou RouteServiceProvider
RateLimiter::for('contact-form', function ($request) {
    return Limit::perMinutes(10, 5)  // 5 requêtes par 10 minutes
        ->by($request->ip())
        ->response(function () {
            return response()->json([
                'error' => 'Trop de soumissions. Réessayez dans 10 minutes.'
            ], 429);
        });
});

// Appliquer à la route
Route::post('/contact', [ContactController::class, 'send'])
    ->middleware('throttle:contact-form');
```

---

### Next.js (App Router)

```javascript
// app/api/contact/route.js
import { NextResponse } from 'next/server';

// Stockage en mémoire simple (remplacer par Redis en production)
const requestCounts = new Map();

function checkRateLimit(ip, max = 5, windowMs = 600000) {
  const now = Date.now();
  const key = ip;
  
  if (!requestCounts.has(key)) {
    requestCounts.set(key, []);
  }
  
  // Nettoyer les entrées expirées
  const timestamps = requestCounts.get(key).filter(t => now - t < windowMs);
  
  if (timestamps.length >= max) {
    return { allowed: false };
  }
  
  timestamps.push(now);
  requestCounts.set(key, timestamps);
  return { allowed: true, remaining: max - timestamps.length };
}

export async function POST(request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const result = checkRateLimit(ip);

  if (!result.allowed) {
    return NextResponse.json(
      { error: 'Trop de requêtes. Réessayez dans 10 minutes.' },
      { status: 429 }
    );
  }

  const body = await request.json();
  // Traitement du formulaire...
  
  return NextResponse.json({ success: true });
}
```

---

### Nginx (niveau proxy/CDN)

Bloquer les abus **avant même d'atteindre votre application** :

```nginx
# nginx.conf

http {
    # Définir une zone de rate limiting (10MB de stockage, 10 req/s par IP)
    limit_req_zone $binary_remote_addr zone=contact_form:10m rate=1r/s;
    limit_req_zone $binary_remote_addr zone=api_global:10m rate=10r/s;

    server {
        listen 80;
        server_name monsite.fr;

        # Route du formulaire de contact
        location /contact {
            # Burst de 5 requêtes autorisé, puis blocage strict
            limit_req zone=contact_form burst=5 nodelay;
            limit_req_status 429;
            
            proxy_pass http://localhost:3000;
        }

        # API globale
        location /api/ {
            limit_req zone=api_global burst=20 nodelay;
            limit_req_status 429;
            
            proxy_pass http://localhost:3000;
        }
    }
}
```

---

### Cloudflare (CDN)

Si vous utilisez Cloudflare, configurez une règle de rate limiting dans le dashboard :

```
Security > WAF > Rate Limiting Rules

Nom       : Protect Contact Form
URL       : /contact
Méthode   : POST
Seuil     : 5 requêtes
Période   : 10 minutes
Action    : Block (réponse 429)
Durée     : 10 minutes
```

> Cloudflare agit **avant votre serveur** : idéal pour absorber les attaques DDoS sans surcharger votre infrastructure.

---

## 10. Codes de réponse et messages d'erreur

### Headers HTTP standards à inclure

```
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
Retry-After: 600
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1718012400
```

| Header | Rôle |
|---|---|
| `Retry-After` | Secondes avant de pouvoir réessayer |
| `X-RateLimit-Limit` | Nombre max de requêtes autorisées |
| `X-RateLimit-Remaining` | Requêtes restantes dans la fenêtre |
| `X-RateLimit-Reset` | Timestamp UNIX de la remise à zéro |

### Exemple de réponse JSON

```json
{
  "error": "rate_limit_exceeded",
  "message": "Vous avez soumis trop de formulaires.",
  "detail": "Maximum 5 soumissions par 10 minutes.",
  "retry_after_seconds": 547,
  "retry_after_human": "9 minutes"
}
```

---

## 11. Bonnes pratiques et pièges à éviter

### ✅ À faire

- **Utiliser Redis en production** — les solutions en mémoire (Map, tableau) se réinitialisent au redémarrage du serveur et ne fonctionnent pas avec plusieurs instances.
- **Logguer les dépassements** — consigner les IP qui dépassent les limites permet de détecter des attaques ciblées.
- **Distinguer les routes** — un formulaire de connexion peut avoir des limites différentes du formulaire de contact.
- **Combiner IP + email** — si le formulaire contient un champ email, limiter aussi par email pour contrer les IP dynamiques.
- **Ajouter `Retry-After`** — permet aux clients légitimes (et aux bots polis) de savoir quand réessayer.
- **Tester en local** — simuler le dépassement pour vérifier que le comportement est correct.

### ❌ À éviter

- **Ne faire confiance qu'au client** — désactiver un bouton JS ne protège rien, un bot ne passe pas par le navigateur.
- **Bloquer les IP derrière NAT** — dans une école, une entreprise, plusieurs utilisateurs partagent la même IP. Préférer une fenêtre généreuse (10 req / 10 min plutôt que 3 req / 10 min).
- **Stocker les IPs en clair dans les logs** — dans l'UE, l'IP est une donnée personnelle (RGPD) : hasher ou anonymiser.
- **Oublier les IPv6** — les plages IPv6 sont immenses ; limiter par `/64` plutôt que par IP complète.
- **Ignorer les proxys** — si votre serveur est derrière Nginx ou Cloudflare, utilisez `X-Forwarded-For` pour récupérer la vraie IP.

```javascript
// Récupérer la vraie IP derrière un proxy
const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
           || req.socket.remoteAddress;
```

---

## 12. Cas d'usage : formulaire de contact

Voici une implémentation complète et réaliste d'un formulaire de contact protégé.

### Structure du projet

```
projet/
├── server.js
├── rateLimiter.js
├── public/
│   └── contact.html
└── package.json
```

### `rateLimiter.js`

```javascript
const rateLimit = require('express-rate-limit');

module.exports = rateLimit({
  windowMs: 10 * 60 * 1000,   // 10 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Utiliser l'IP réelle même derrière un proxy
    return req.headers['x-forwarded-for']?.split(',')[0] || req.ip;
  },
  handler: (req, res) => {
    const retryAfter = Math.ceil(req.rateLimit.resetTime / 1000 - Date.now() / 1000);
    res.status(429).json({
      error: 'Trop de messages envoyés.',
      message: `Vous pouvez envoyer 5 messages par 10 minutes. Réessayez dans ${Math.ceil(retryAfter / 60)} minutes.`,
      retry_after: retryAfter
    });
  }
});
```

### `server.js`

```javascript
const express = require('express');
const nodemailer = require('nodemailer');
const contactLimiter = require('./rateLimiter');

const app = express();
app.use(express.json());
app.use(express.static('public'));

app.post('/contact', contactLimiter, async (req, res) => {
  const { name, email, message } = req.body;

  // Validation basique
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Tous les champs sont requis.' });
  }

  try {
    // Envoi de l'email (exemple avec nodemailer)
    const transporter = nodemailer.createTransport({ /* config SMTP */ });
    await transporter.sendMail({
      from: `"${name}" <${email}>`,
      to: 'vous@votresite.fr',
      subject: `Nouveau message de ${name}`,
      text: message
    });

    res.json({ success: true, message: 'Votre message a été envoyé !' });
  } catch (err) {
    console.error('Erreur email:', err);
    res.status(500).json({ error: 'Erreur lors de l\'envoi. Réessayez.' });
  }
});

app.listen(3000, () => console.log('Serveur démarré sur http://localhost:3000'));
```

---

## 13. Résumé visuel des couches de protection

```
╔══════════════════════════════════════════════════════════════╗
║            PROTECTION ANTI-SPAM : COUCHES COMBINÉES          ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  COUCHE 1 — UX CLIENT                                        ║
║  └── Désactiver le bouton après soumission (30s cooldown)    ║
║      → Empêche les double-clics accidentels                  ║
║                                                              ║
║  COUCHE 2 — HONEYPOT                                         ║
║  └── Champ caché rempli = bot simple détecté                 ║
║      → Bloque ~70% des bots automatiques basiques            ║
║                                                              ║
║  COUCHE 3 — RATE LIMITING (serveur)     ← SUJET DE CE GUIDE ║
║  └── Max 5 req / 10 min / IP                                 ║
║      → Bloque TOUS les abus, bots intelligents et humains    ║
║                                                              ║
║  COUCHE 4 — VALIDATION & FILTRAGE                            ║
║  └── Vérification des champs, longueur, format email         ║
║      → Rejette les données malformées                        ║
║                                                              ║
║  COUCHE 5 — CAPTCHA (si nécessaire)                          ║
║  └── hCaptcha, reCAPTCHA v3 (silencieux)                     ║
║      → Dernière ligne de défense pour les abus ciblés        ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

      Protection légère ◄──────────────────► Protection forte
           (UX)                                 (Serveur)
```

---

## En résumé

| Quoi | Où | Outil recommandé |
|---|---|---|
| Cooldown UX | Navigateur | JavaScript natif |
| Rate limiting app | Express / Django / Laravel | express-rate-limit, Flask-Limiter |
| Stockage des compteurs | Serveur | Redis (production), Map (dev) |
| Rate limiting réseau | Proxy/CDN | Nginx `limit_req`, Cloudflare Rules |
| Monitoring | Logs serveur | Winston, Logstash, Datadog |

---

*Manuel rédigé pour une mise en place pratique du rate limiting sur des formulaires web.*  
*Compatible : Node.js, Python, PHP, Laravel, Next.js, Nginx, Cloudflare.*
