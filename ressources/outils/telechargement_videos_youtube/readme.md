# Manuel complet de yt-dlp

> **yt-dlp** est un outil en ligne de commande (et bibliothèque Python) permettant de télécharger des vidéos et de l'audio depuis YouTube et plus de 1 000 autres sites. Il est un fork amélioré de `youtube-dl`, plus actif et plus performant.

---

## Table des matières

1. [Installation](#1-installation)
2. [Usage de base](#2-usage-de-base)
3. [Sélection des formats](#3-sélection-des-formats)
4. [Options de sortie (fichiers)](#4-options-de-sortie-fichiers)
5. [Téléchargement audio](#5-téléchargement-audio)
6. [Playlists et chaînes](#6-playlists-et-chaînes)
7. [Sous-titres](#7-sous-titres)
8. [Métadonnées et miniatures](#8-métadonnées-et-miniatures)
9. [Filtres et conditions](#9-filtres-et-conditions)
10. [Vitesse et réseau](#10-vitesse-et-réseau)
11. [Authentification](#11-authentification)
12. [Post-traitement (FFmpeg)](#12-post-traitement-ffmpeg)
13. [Utilisation en Python](#13-utilisation-en-python)
14. [Fichier de configuration](#14-fichier-de-configuration)
15. [Sites supportés](#15-sites-supportés)
16. [Dépannage](#16-dépannage)
17. [Référence rapide](#17-référence-rapide)

---

## 1. Installation

### Via pip (recommandé)

```bash
pip install yt-dlp
```

### Via pip en mode utilisateur (sans droits admin)

```bash
pip install --user yt-dlp
```

### Via le binaire pré-compilé (Linux/macOS)

```bash
sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp \
  -o /usr/local/bin/yt-dlp
sudo chmod +x /usr/local/bin/yt-dlp
```

### Via winget (Windows)

```powershell
winget install yt-dlp
```

### Via Homebrew (macOS)

```bash
brew install yt-dlp
```

### Mise à jour

```bash
yt-dlp -U
# ou
pip install --upgrade yt-dlp
```

### Dépendances optionnelles mais recommandées

| Dépendance | Utilité |
|---|---|
| `ffmpeg` | Fusion audio/vidéo, conversion, post-traitement |
| `ffprobe` | Analyse des fichiers médias |
| `aria2c` | Téléchargement multi-segments (plus rapide) |
| `AtomicParsley` | Intégration des métadonnées dans les fichiers MP4 |

---

## 2. Usage de base

### Télécharger une vidéo

```bash
yt-dlp "https://www.youtube.com/watch?v=XXXXXXXXXXX"
```

### Télécharger sans être dans une playlist

```bash
yt-dlp --no-playlist "https://www.youtube.com/watch?v=XXXXXXXXXXX&list=YYYYYYY"
```

### Simuler un téléchargement (dry-run)

```bash
yt-dlp --simulate "URL"
```

### Afficher les informations de la vidéo

```bash
yt-dlp --dump-json "URL"
yt-dlp --print title "URL"
yt-dlp --print "%(title)s – %(duration_string)s" "URL"
```

### Lister les extracteurs disponibles

```bash
yt-dlp --list-extractors
```

---

## 3. Sélection des formats

### Lister tous les formats disponibles

```bash
yt-dlp -F "URL"
```

Cela affiche un tableau avec les identifiants de format, la résolution, le codec, le débit, etc.

### Télécharger un format spécifique par son ID

```bash
yt-dlp -f 137 "URL"          # Vidéo seule (1080p)
yt-dlp -f 140 "URL"          # Audio seule (m4a)
yt-dlp -f 137+140 "URL"      # Vidéo + Audio fusionnés
```

### Sélecteurs de format prédéfinis

```bash
yt-dlp -f best "URL"                        # Meilleure qualité combinée (1 fichier)
yt-dlp -f bestvideo+bestaudio "URL"         # Meilleure vidéo + meilleur audio (fusion)
yt-dlp -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]" "URL"  # MP4 + M4A uniquement
```

### Limiter la résolution

```bash
yt-dlp -f "bestvideo[height<=1080]+bestaudio/best[height<=1080]" "URL"  # Max 1080p
yt-dlp -f "bestvideo[height<=720]+bestaudio/best[height<=720]"  "URL"  # Max 720p
yt-dlp -f "bestvideo[height<=480]+bestaudio/best[height<=480]"  "URL"  # Max 480p
```

### Préférer un codec spécifique

```bash
# Préférer AV1, sinon VP9, sinon n'importe quoi
yt-dlp -f "bestvideo[vcodec^=av01]+bestaudio/bestvideo[vcodec^=vp9]+bestaudio/bestvideo+bestaudio" "URL"

# Préférer H.264 (compatibilité maximale)
yt-dlp -f "bestvideo[vcodec^=avc1]+bestaudio[ext=m4a]/best[ext=mp4]/best" "URL"
```

### Format de sortie cible

```bash
yt-dlp --merge-output-format mp4 "URL"   # Fusionner en MP4
yt-dlp --merge-output-format mkv "URL"   # Fusionner en MKV
yt-dlp --merge-output-format webm "URL"  # Fusionner en WebM
```

---

## 4. Options de sortie (fichiers)

### Spécifier le dossier et le nom de fichier

```bash
yt-dlp -o "~/Videos/%(title)s.%(ext)s" "URL"
```

### Variables de template disponibles

| Variable | Description |
|---|---|
| `%(title)s` | Titre de la vidéo |
| `%(id)s` | Identifiant unique de la vidéo |
| `%(ext)s` | Extension du fichier |
| `%(uploader)s` | Nom de la chaîne / auteur |
| `%(upload_date)s` | Date de mise en ligne (YYYYMMDD) |
| `%(duration)s` | Durée en secondes |
| `%(duration_string)s` | Durée formatée (HH:MM:SS) |
| `%(view_count)s` | Nombre de vues |
| `%(like_count)s` | Nombre de likes |
| `%(playlist_title)s` | Titre de la playlist |
| `%(playlist_index)s` | Position dans la playlist |
| `%(resolution)s` | Résolution (ex : 1920x1080) |
| `%(fps)s` | Images par seconde |
| `%(tbr)s` | Débit total (kbps) |

### Exemples de templates

```bash
# Organisation par chaîne et date
yt-dlp -o "~/Videos/%(uploader)s/%(upload_date)s – %(title)s.%(ext)s" "URL"

# Playlist numérotée
yt-dlp -o "~/Videos/%(playlist_title)s/%(playlist_index)s – %(title)s.%(ext)s" "URL"

# Nom court avec l'ID
yt-dlp -o "%(id)s.%(ext)s" "URL"
```

### Restreindre les caractères du nom de fichier

```bash
yt-dlp --restrict-filenames "URL"   # Évite les caractères spéciaux
yt-dlp --windows-filenames "URL"    # Compatible Windows
```

### Ne pas écraser un fichier existant

```bash
yt-dlp --no-overwrites "URL"
yt-dlp -w "URL"                     # Alias
```

### Continuer un téléchargement interrompu

```bash
yt-dlp --continue "URL"
yt-dlp -c "URL"                     # Alias
```

---

## 5. Téléchargement audio

### Extraire l'audio uniquement

```bash
yt-dlp -x "URL"
```

### Spécifier le format audio

```bash
yt-dlp -x --audio-format mp3  "URL"   # MP3
yt-dlp -x --audio-format m4a  "URL"   # M4A (AAC)
yt-dlp -x --audio-format opus "URL"   # Opus
yt-dlp -x --audio-format flac "URL"   # FLAC (sans perte)
yt-dlp -x --audio-format wav  "URL"   # WAV (sans perte)
yt-dlp -x --audio-format vorbis "URL" # Ogg Vorbis
```

### Qualité audio

```bash
yt-dlp -x --audio-format mp3 --audio-quality 0 "URL"   # Meilleure qualité VBR
yt-dlp -x --audio-format mp3 --audio-quality 5 "URL"   # Qualité moyenne
yt-dlp -x --audio-format mp3 --audio-quality 320K "URL" # 320 kbps CBR
```

> La qualité VBR va de `0` (meilleure) à `9` (pire).

---

## 6. Playlists et chaînes

### Télécharger une playlist entière

```bash
yt-dlp "https://www.youtube.com/playlist?list=XXXXXXXXXX"
```

### Télécharger les N premières vidéos d'une playlist

```bash
yt-dlp --playlist-end 10 "URL_PLAYLIST"
```

### Télécharger à partir de la Nème vidéo

```bash
yt-dlp --playlist-start 5 "URL_PLAYLIST"
```

### Télécharger une plage de vidéos

```bash
yt-dlp --playlist-items 1-5,8,11-13 "URL_PLAYLIST"
```

### Télécharger une chaîne entière

```bash
yt-dlp "https://www.youtube.com/@NomDeLaChaine/videos"
```

### Inverser l'ordre de téléchargement (du plus ancien au plus récent)

```bash
yt-dlp --playlist-reverse "URL_PLAYLIST"
```

### Ignorer les erreurs (continuer même si une vidéo est indisponible)

```bash
yt-dlp --ignore-errors "URL_PLAYLIST"
yt-dlp -i "URL_PLAYLIST"    # Alias
```

### Télécharger uniquement les nouvelles vidéos (avec archive)

```bash
yt-dlp --download-archive archive.txt "URL_PLAYLIST"
```
> Les vidéos déjà téléchargées sont listées dans `archive.txt` et ignorées lors des prochaines exécutions.

---

## 7. Sous-titres

### Lister les sous-titres disponibles

```bash
yt-dlp --list-subs "URL"
```

### Télécharger les sous-titres avec la vidéo

```bash
yt-dlp --write-subs "URL"                          # Sous-titres manuels
yt-dlp --write-auto-subs "URL"                     # Sous-titres automatiques (générés)
yt-dlp --write-subs --write-auto-subs "URL"        # Les deux
```

### Choisir la langue des sous-titres

```bash
yt-dlp --write-subs --sub-langs fr "URL"           # Français
yt-dlp --write-subs --sub-langs en,fr "URL"        # Anglais et français
yt-dlp --write-subs --sub-langs "fr.*" "URL"       # Toutes les variantes du français
yt-dlp --write-subs --sub-langs all "URL"          # Toutes les langues
```

### Format des sous-titres

```bash
yt-dlp --write-subs --sub-format srt "URL"         # SRT
yt-dlp --write-subs --sub-format vtt "URL"         # WebVTT
yt-dlp --write-subs --sub-format ass "URL"         # ASS/SSA
```

### Intégrer les sous-titres dans la vidéo (burn-in)

```bash
yt-dlp --embed-subs --sub-langs fr "URL"
```

---

## 8. Métadonnées et miniatures

### Télécharger la miniature séparément

```bash
yt-dlp --write-thumbnail "URL"
```

### Intégrer la miniature dans le fichier

```bash
yt-dlp --embed-thumbnail "URL"
```

### Écrire les métadonnées dans un fichier JSON

```bash
yt-dlp --write-info-json "URL"
```

### Intégrer les métadonnées dans le fichier (titre, artiste, date…)

```bash
yt-dlp --add-metadata "URL"
yt-dlp --embed-metadata "URL"   # Alias selon la version
```

### Écrire la description dans un fichier texte

```bash
yt-dlp --write-description "URL"
```

### Écrire les annotations (commentaires épinglés, etc.)

```bash
yt-dlp --write-comments "URL"
```

---

## 9. Filtres et conditions

### Filtrer par durée

```bash
# Vidéos de moins de 10 minutes
yt-dlp --match-filter "duration < 600" "URL_PLAYLIST"

# Vidéos entre 5 et 30 minutes
yt-dlp --match-filter "duration >= 300 & duration <= 1800" "URL_PLAYLIST"
```

### Filtrer par nombre de vues

```bash
yt-dlp --match-filter "view_count > 1000000" "URL_PLAYLIST"
```

### Filtrer par date de mise en ligne

```bash
yt-dlp --dateafter 20240101 "URL_PLAYLIST"    # Après le 1er janvier 2024
yt-dlp --datebefore 20241231 "URL_PLAYLIST"   # Avant le 31 décembre 2024
yt-dlp --date today "URL"                     # Aujourd'hui uniquement
```

### Exclure les lives et les shorts

```bash
yt-dlp --match-filter "!is_live & duration > 60" "URL_PLAYLIST"
```

### Taille maximale de fichier

```bash
yt-dlp --match-filter "filesize < 500M" "URL"
```

---

## 10. Vitesse et réseau

### Limiter la vitesse de téléchargement

```bash
yt-dlp --limit-rate 1M "URL"     # Max 1 Mo/s
yt-dlp --limit-rate 500K "URL"   # Max 500 Ko/s
yt-dlp -r 2M "URL"               # Alias
```

### Utiliser un proxy

```bash
yt-dlp --proxy "http://proxy.example.com:8080" "URL"
yt-dlp --proxy "socks5://127.0.0.1:1080" "URL"
```

### Utiliser aria2c pour un téléchargement plus rapide

```bash
yt-dlp --downloader aria2c "URL"
yt-dlp --downloader aria2c --downloader-args "aria2c:-x 16 -s 16" "URL"
```

### Nombre de tentatives en cas d'erreur

```bash
yt-dlp --retries 10 "URL"
```

### Pause entre les téléchargements (utile pour les playlists)

```bash
yt-dlp --sleep-interval 3 --max-sleep-interval 8 "URL_PLAYLIST"
```

### Nombre de connexions simultanées (fragments)

```bash
yt-dlp --concurrent-fragments 4 "URL"
```

---

## 11. Authentification

### Identifiants YouTube (compte Google)

```bash
yt-dlp -u "email@gmail.com" -p "motdepasse" "URL"
```

### Cookies depuis un navigateur (méthode recommandée)

```bash
yt-dlp --cookies-from-browser chrome "URL"
yt-dlp --cookies-from-browser firefox "URL"
yt-dlp --cookies-from-browser edge "URL"
```

> Cette méthode est utile pour les vidéos membres, les contenus réservés aux adultes ou les vidéos privées de votre compte.

### Cookies depuis un fichier exporté

```bash
yt-dlp --cookies cookies.txt "URL"
```

> Utilisez une extension comme *Get cookies.txt LOCALLY* pour exporter les cookies depuis votre navigateur.

### Vidéos privées ou non listées

```bash
yt-dlp --cookies-from-browser chrome "https://www.youtube.com/watch?v=VIDEO_PRIVEE"
```

---

## 12. Post-traitement (FFmpeg)

> FFmpeg doit être installé sur votre système pour utiliser ces options.

### Convertir la vidéo après téléchargement

```bash
yt-dlp --recode-video mp4 "URL"    # Convertir en MP4
yt-dlp --recode-video mkv "URL"    # Convertir en MKV
```

### Passer des arguments à FFmpeg

```bash
yt-dlp --postprocessor-args "ffmpeg:-vf scale=1280:720" "URL"
```

### Découper une vidéo par chapitres

```bash
yt-dlp --split-chapters "URL"
```

### Télécharger uniquement un extrait (par temps)

```bash
# Télécharger de 1:30 à 3:45
yt-dlp --download-sections "*01:30-03:45" "URL"

# Télécharger uniquement le chapitre 2
yt-dlp --download-sections "chapter:2" "URL"
```

### Sponsorblock (ignorer les segments sponsorisés)

```bash
yt-dlp --sponsorblock-remove sponsor "URL"           # Supprimer les sponsors
yt-dlp --sponsorblock-remove all "URL"               # Supprimer tous les segments marqués
yt-dlp --sponsorblock-mark sponsor "URL"             # Marquer sans supprimer
```

---

## 13. Utilisation en Python

### Installation

```bash
pip install yt-dlp
```

### Téléchargement simple

```python
import yt_dlp

url = "https://www.youtube.com/watch?v=XXXXXXXXXXX"

ydl_opts = {
    'format': 'bestvideo+bestaudio/best',
    'merge_output_format': 'mp4',
    'outtmpl': '%(title)s.%(ext)s',
}

with yt_dlp.YoutubeDL(ydl_opts) as ydl:
    ydl.download([url])
```

### Extraire les informations sans télécharger

```python
import yt_dlp

url = "https://www.youtube.com/watch?v=XXXXXXXXXXX"

with yt_dlp.YoutubeDL() as ydl:
    info = ydl.extract_info(url, download=False)
    print(f"Titre    : {info['title']}")
    print(f"Durée    : {info['duration']} secondes")
    print(f"Chaîne   : {info['uploader']}")
    print(f"Vues     : {info['view_count']}")
```

### Barre de progression personnalisée

```python
import yt_dlp

class MonLogger:
    def debug(self, msg):
        pass
    def warning(self, msg):
        print(f"[ATTENTION] {msg}")
    def error(self, msg):
        print(f"[ERREUR] {msg}")

def hook_progression(d):
    if d['status'] == 'downloading':
        print(f"Téléchargement : {d['_percent_str']} à {d['_speed_str']}")
    elif d['status'] == 'finished':
        print("Téléchargement terminé, post-traitement en cours…")

ydl_opts = {
    'format': 'bestvideo+bestaudio/best',
    'merge_output_format': 'mp4',
    'logger': MonLogger(),
    'progress_hooks': [hook_progression],
}

with yt_dlp.YoutubeDL(ydl_opts) as ydl:
    ydl.download(["https://www.youtube.com/watch?v=XXXXXXXXXXX"])
```

### Téléchargement audio en MP3

```python
import yt_dlp

ydl_opts = {
    'format': 'bestaudio/best',
    'postprocessors': [{
        'key': 'FFmpegExtractAudio',
        'preferredcodec': 'mp3',
        'preferredquality': '192',
    }],
    'outtmpl': '%(title)s.%(ext)s',
}

with yt_dlp.YoutubeDL(ydl_opts) as ydl:
    ydl.download(["https://www.youtube.com/watch?v=XXXXXXXXXXX"])
```

### Télécharger une playlist et récupérer ses infos

```python
import yt_dlp

url = "https://www.youtube.com/playlist?list=XXXXXXXXXX"

with yt_dlp.YoutubeDL({'quiet': True}) as ydl:
    info = ydl.extract_info(url, download=False)
    for video in info['entries']:
        print(f"{video['playlist_index']:03d}. {video['title']} ({video['duration_string']})")
```

---

## 14. Fichier de configuration

yt-dlp peut lire ses options depuis un fichier de configuration pour éviter de les retaper à chaque fois.

### Emplacement du fichier

| Système | Chemin |
|---|---|
| Linux / macOS | `~/.config/yt-dlp/config` |
| Windows | `%APPDATA%\yt-dlp\config.txt` |
| Dossier courant | `./yt-dlp.conf` |

### Exemple de fichier de configuration

```ini
# Dossier de téléchargement par défaut
-o ~/Videos/%(uploader)s/%(title)s.%(ext)s

# Meilleure qualité, en MP4
-f bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best
--merge-output-format mp4

# Ne pas écraser les fichiers existants
--no-overwrites

# Sous-titres français automatiques
--write-auto-subs
--sub-langs fr

# Pause entre les téléchargements
--sleep-interval 2

# Ignorer les erreurs dans les playlists
--ignore-errors
```

### Utiliser un fichier de configuration personnalisé

```bash
yt-dlp --config-location "/chemin/vers/ma-config.conf" "URL"
```

---

## 15. Sites supportés

yt-dlp supporte plus de 1 000 sites. Voici une sélection :

| Catégorie | Sites |
|---|---|
| **Vidéo générale** | YouTube, Dailymotion, Vimeo, Twitch, Rumble |
| **Réseaux sociaux** | TikTok, Instagram, Twitter/X, Facebook, Reddit |
| **Streaming** | Crunchyroll, Arte, France.tv, INA |
| **Musique** | SoundCloud, Bandcamp, Mixcloud |
| **Adulte** | (nombreux sites, voir la liste officielle) |
| **Autres** | Ted.com, Pornhub, Bilibili, NicoNico, etc. |

```bash
# Lister tous les sites supportés
yt-dlp --list-extractors | less

# Compter le nombre de sites
yt-dlp --list-extractors | wc -l
```

---

## 16. Dépannage

### Mettre à jour yt-dlp

```bash
yt-dlp -U
```
> La plupart des problèmes de téléchargement sont résolus par une mise à jour.

### Vidéo indisponible dans mon pays

```bash
yt-dlp --geo-bypass "URL"
yt-dlp --proxy "socks5://127.0.0.1:1080" "URL"   # Via un VPN/proxy
```

### Erreur "Sign in to confirm you're not a bot"

```bash
yt-dlp --cookies-from-browser chrome "URL"
```

### Erreur de certificat SSL

```bash
yt-dlp --no-check-certificate "URL"
```

### Voir les détails de l'erreur

```bash
yt-dlp -v "URL"    # Mode verbeux
```

### Format demandé non disponible

```bash
yt-dlp -F "URL"    # Lister les formats réellement disponibles
```

### FFmpeg introuvable

```bash
# Vérifier si FFmpeg est installé
ffmpeg -version

# Préciser le chemin vers FFmpeg
yt-dlp --ffmpeg-location "/usr/bin/ffmpeg" "URL"
```

---

## 17. Référence rapide

```bash
# ─────────────────────────────────────────────────────────────
#  COMMANDES ESSENTIELLES
# ─────────────────────────────────────────────────────────────

# Télécharger en meilleure qualité
yt-dlp "URL"

# Lister les formats disponibles
yt-dlp -F "URL"

# Télécharger en MP4 1080p
yt-dlp -f "bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]" --merge-output-format mp4 "URL"

# Télécharger uniquement l'audio en MP3
yt-dlp -x --audio-format mp3 --audio-quality 0 "URL"

# Télécharger avec sous-titres français
yt-dlp --write-auto-subs --sub-langs fr "URL"

# Télécharger une playlist dans un dossier
yt-dlp -o "%(playlist_title)s/%(playlist_index)s – %(title)s.%(ext)s" "URL_PLAYLIST"

# Télécharger uniquement les nouvelles vidéos d'une chaîne
yt-dlp --download-archive archive.txt "URL_CHAINE"

# Mettre à jour yt-dlp
yt-dlp -U
```

---

## Ressources

- **Documentation officielle** : [https://github.com/yt-dlp/yt-dlp](https://github.com/yt-dlp/yt-dlp)
- **Wiki & options** : [https://github.com/yt-dlp/yt-dlp#usage-and-options](https://github.com/yt-dlp/yt-dlp#usage-and-options)
- **Liste des sites supportés** : [https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md](https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md)
- **Releases** : [https://github.com/yt-dlp/yt-dlp/releases](https://github.com/yt-dlp/yt-dlp/releases)

---

*Manuel rédigé pour yt-dlp — Compatible avec les versions récentes (2024+)*
