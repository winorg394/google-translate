# Transflow API - Guide d'utilisation

## Vue d'ensemble

L'API Transflow est une API de traduction qui peut gérer automatiquement les textes avec des caractères problématiques comme :
- Formatage Markdown (`**bold**`, `*italic*`, `` `code` ``, `~~strikethrough~~`)
- Guillemets spéciaux (`"`, `"`, `'`, `'`)
- Sauts de ligne multiples et espaces excessifs
- Autres caractères spéciaux qui peuvent casser le JSON

## Endpoints

### POST /translate

Traduit un texte d'une langue à une autre.

#### Requête

```json
{
  "text": "Texte à traduire",
  "to": "fr"
}
```

#### Paramètres

- `text` (string, requis) : Le texte à traduire
- `to` (string, requis) : Le code de langue cible (ex: "fr", "en", "es", "de")

#### Réponse

```json
{
  "translatedText": "Texte traduit",
  "status": true,
  "message": ""
}
```

## Gestion automatique des textes problématiques

L'API nettoie automatiquement les textes avant de les envoyer à Google Translate :

### 1. Suppression du formatage Markdown
- `**texte**` → `texte`
- `*texte*` → `texte`
- `` `texte` `` → `texte`
- `~~texte~~` → `texte`

### 2. Normalisation des guillemets
- `"guillemets"` → `"guillemets"`
- `'apostrophe'` → `'apostrophe'`

### 3. Normalisation des espaces
- Sauts de ligne multiples → espaces simples
- Espaces et tabulations multiples → espaces simples
- Suppression des espaces en début et fin

## Exemples d'utilisation

### Exemple 1 : Texte avec formatage Markdown

**Requête :**
```json
{
  "text": "Ceci est un **texte important** avec du *formatage* et du `code`",
  "to": "en"
}
```

**Texte nettoyé envoyé à Google Translate :**
```
Ceci est un texte important avec du formatage et du code
```

### Exemple 2 : Texte avec guillemets spéciaux

**Requête :**
```json
{
  "text": "L'utilisateur a dit "Bonjour" et 'Au revoir'",
  "to": "es"
}
```

**Texte nettoyé envoyé à Google Translate :**
```
L'utilisateur a dit "Bonjour" et 'Au revoir'
```

### Exemple 3 : Texte avec sauts de ligne

**Requête :**
```json
{
  "text": "Première ligne\n\nDeuxième ligne\n\nTroisième ligne",
  "to": "de"
}
```

**Texte nettoyé envoyé à Google Translate :**
```
Première ligne Deuxième ligne Troisième ligne
```

## Gestion des erreurs

### Erreur 400 - Bad Request
- `"text field is required"` : Le champ texte est manquant
- `"to field is required"` : Le champ langue cible est manquant
- `"Invalid request: malformed JSON"` : Le JSON est malformé

### Erreur 500 - Internal Server Error
- `"Translation failed"` : Échec de la traduction avec Google Translate

## Tests

### Test avec Python

```bash
# Installer requests si nécessaire
pip install requests

# Lancer les tests
python test_api.py
```

### Test avec Go

```bash
# Tester la fonction de nettoyage
go run test_cleaning.go

# Compiler l'API
go build main.go

# Lancer l'API
./main
```

## Bonnes pratiques

### Côté client

1. **Utilisez toujours des structs Go** pour construire vos requêtes :
```go
request := TranslateRequest{
    Text: "Votre texte",
    To:   "fr",
}
jsonData, _ := json.Marshal(request)
```

2. **Évitez de construire du JSON manuellement** avec des chaînes de caractères

3. **Validez vos données** avant de les envoyer

### Côté serveur

1. **L'API nettoie automatiquement** tous les textes reçus
2. **Les logs détaillés** sont générés pour le débogage
3. **La validation robuste** garantit la fiabilité

## Dépannage

### "Invalid request payload"

Cette erreur indique généralement :
- JSON malformé
- Caractères spéciaux non échappés
- Sauts de ligne dans les chaînes JSON

**Solution :** Utilisez `encoding/json` de Go pour construire vos requêtes.

### "Translation failed"

Cette erreur indique :
- Problème avec l'API Google Translate
- Limite de taux dépassée
- Problème de réseau

**Solution :** Vérifiez votre connexion et réessayez.

## Support

Pour toute question ou problème, consultez les logs de l'API qui contiennent des informations détaillées sur les erreurs.
