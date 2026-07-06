# Tutoriel : Mettre en service un assistant avec Ollama

Ce tutoriel explique comment installer Ollama, télécharger un modèle de langage, et créer un assistant personnalisé (avec sa propre personnalité, ses instructions et ses paramètres) que vous pourrez utiliser localement.

---

## 1. Prérequis

- Un ordinateur sous **Windows**, **macOS** ou **Linux**
- Au moins **8 Go de RAM** (16 Go ou plus recommandé pour les modèles plus gros)
- Une connexion internet pour le téléchargement initial
- (Optionnel) Une carte graphique compatible (NVIDIA/AMD) pour accélérer l'inférence

---

## 2. Installation d'Ollama

### macOS
1. Rendez-vous sur [https://ollama.com/download](https://ollama.com/download)
2. Téléchargez l'application `.dmg`
3. Ouvrez le fichier et glissez Ollama dans le dossier Applications
4. Lancez Ollama depuis le Launchpad

### Windows
1. Rendez-vous sur [https://ollama.com/download](https://ollama.com/download)
2. Téléchargez l'installeur `.exe`
3. Lancez l'installeur et suivez les instructions

### Linux
Ouvrez un terminal et exécutez :

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### Vérifier l'installation

```bash
ollama --version
```

Vous devriez voir s'afficher le numéro de version d'Ollama.

---

## 3. Télécharger un modèle

Ollama propose de nombreux modèles open-source (Llama, Mistral, Gemma, Qwen, etc.).

Pour télécharger un modèle, par exemple `llama3.2` :

```bash
ollama pull llama3.2
```

D'autres exemples de modèles populaires :

```bash
ollama pull mistral
ollama pull gemma2
ollama pull qwen2.5
```

> 💡 Choisissez un modèle adapté à votre matériel. Les modèles de 7-8 milliards de paramètres fonctionnent bien sur la plupart des ordinateurs récents. Les modèles plus petits (1-3 milliards) conviennent aux machines moins puissantes.

---

## 4. Tester le modèle

Lancez une conversation directement dans le terminal :

```bash
ollama run llama3.2
```

Vous pouvez alors discuter avec le modèle. Pour quitter, tapez `/bye`.

---

## 5. Créer un assistant personnalisé (Modelfile)

Ollama permet de personnaliser un modèle grâce à un fichier appelé **Modelfile**. C'est ici que vous définissez le comportement, la personnalité et les instructions de votre assistant.

### 5.1 Créer le fichier

Créez un fichier nommé `Modelfile` (sans extension) :

```bash
touch Modelfile
```

### 5.2 Exemple de contenu

```dockerfile
# On part d'un modèle de base déjà téléchargé
FROM llama3.2

# Paramètres de génération
PARAMETER temperature 0.7
PARAMETER top_p 0.9

# Instructions système : définissent la personnalité et le rôle de l'assistant
SYSTEM """
Tu es un assistant francophone, professionnel et bienveillant.
Tu réponds de manière claire, concise et structurée.
Si tu ne connais pas la réponse, tu le dis honnêtement.
"""
```

### 5.3 Créer l'assistant à partir du Modelfile

```bash
ollama create mon-assistant -f ./Modelfile
```

Remplacez `mon-assistant` par le nom de votre choix.

### 5.4 Lancer votre assistant personnalisé

```bash
ollama run mon-assistant
```

---

## 6. Utiliser l'assistant via l'API locale

Ollama expose automatiquement une API REST locale sur le port `11434`. Cela permet d'intégrer votre assistant dans une application.

### Exemple avec `curl`

```bash
curl http://localhost:11434/api/generate -d '{
  "model": "mon-assistant",
  "prompt": "Explique-moi le fonctionnement d'\''une pile en informatique.",
  "stream": false
}'
```

### Exemple avec Python

```python
import requests

response = requests.post(
    "http://localhost:11434/api/generate",
    json={
        "model": "mon-assistant",
        "prompt": "Donne-moi trois idées de recettes rapides.",
        "stream": False
    }
)

print(response.json()["response"])
```

### Exemple avec le format "chat" (conversation multi-tours)

```python
import requests

response = requests.post(
    "http://localhost:11434/api/chat",
    json={
        "model": "mon-assistant",
        "messages": [
            {"role": "user", "content": "Bonjour, qui es-tu ?"}
        ],
        "stream": False
    }
)

print(response.json()["message"]["content"])
```

---

## 7. Gérer vos modèles et assistants

| Commande | Description |
|---|---|
| `ollama list` | Liste tous les modèles/assistants installés |
| `ollama show mon-assistant` | Affiche les détails d'un assistant |
| `ollama rm mon-assistant` | Supprime un assistant |
| `ollama cp mon-assistant mon-assistant-v2` | Duplique un assistant |
| `ollama ps` | Liste les modèles actuellement chargés en mémoire |

---

## 8. Aller plus loin

- **Ajouter une interface graphique** : des projets comme [Open WebUI](https://github.com/open-webui/open-webui) permettent d'obtenir une interface web type ChatGPT connectée à Ollama.
- **Donner un contexte via des documents (RAG)** : combinez Ollama avec des outils comme LangChain ou LlamaIndex pour que votre assistant réponde en s'appuyant sur vos propres documents.
- **Ajuster les performances** : utilisez `PARAMETER num_ctx` dans le Modelfile pour augmenter la taille du contexte, ou `PARAMETER num_gpu` pour contrôler l'utilisation du GPU.

---

## 9. Résumé des commandes clés

```bash
# Installer un modèle
ollama pull llama3.2

# Créer un assistant personnalisé
ollama create mon-assistant -f ./Modelfile

# Lancer l'assistant
ollama run mon-assistant

# Lister les assistants disponibles
ollama list
```

---

Vous disposez maintenant d'un assistant IA fonctionnel, personnalisable et exécuté **localement**, sans dépendre d'un service cloud. 🎉
