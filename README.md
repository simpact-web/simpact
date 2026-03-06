# 🖨️ SIMPACT ERP v3.0 — Portail Client Premium

**Plateforme professionnelle de gestion d'imprimerie numérique**  
Espace Client · Devis · Production · Comptabilité · Fidélisation

---

## 📁 Structure du projet

```
simpact-erp/
├── index.html          → Page de connexion (redesignée, animations)
├── hub.html            → Centre de contrôle Super Admin
├── client.html         → ★ PORTAIL CLIENT VIP (nouveau, complet)
├── commercial.html     → Devis, commandes, approbation clients
├── production.html     → Kanban atelier, fiches fabrication PDF
├── compta.html         → CA, TVA, suivi paiements
├── stock.html          → Gestion stock papier
├── clients.html        → Fiches clients, historique, fidélité
├── admin.html          → Utilisateurs, prix, paramètres
├── users.js            → Moteur central v3 (auth, données, notifs, docs)
└── prix_config.json    → Configuration des tarifs
```

---

## 🚀 Déploiement GitHub Pages (5 minutes)

1. Créer un nouveau repository sur github.com
2. Uploader TOUS les fichiers (`Add file → Upload files`)
3. `Settings → Pages → Source: main branch → Save`
4. Accès : `https://VOTRE-USERNAME.github.io/NOM-REPO/`

⚠️ **Important** : uploadez TOUS les fichiers en même temps (y compris `prix_config.json`)

---

## 🔑 Identifiants

| Rôle          | Identifiant   | Mot de passe    |
|---------------|---------------|-----------------|
| Super Admin   | `youssef`     | `youssef123`    |
| Admin         | `admin01`     | `simpact2026`   |
| Production    | `prod01`      | `atelier`       |
| Comptabilité  | `compta01`    | `facture`       |
| Commercial    | `comm01`      | `vente`         |
| Client démo   | `client01`    | `client123`     |
| UIB Bank      | `uib`         | `uib2026`       |
| UBCI          | `ubci`        | `ubci2026`      |
| Attijari      | `attijari`    | `attijari2026`  |
| BIAT          | `biat`        | `biat2026`      |
| STAR          | `star`        | `star2026`      |

(Voir `users.js` pour tous les identifiants)

⚠️ Changez les mots de passe après déploiement via **Admin → Utilisateurs**

---

## 🌟 Nouveautés v3.0 — Portail Client

### ✨ Espace Client complètement redesigné
- **Dashboard** : KPIs personnels, programme fidélité visuel, commandes récentes
- **Configurateur** en 5 étapes : produit → options → quantité → délai → validation
- **Prix en temps réel** avec TVA, coût unitaire, comparaison délais
- **Suivi de commande** avec timeline visuelle d'avancement
- **Bibliothèque de fichiers** : upload drag & drop, gestion des assets
- **Messagerie** : chat direct avec l'équipe SIMPACT
- **Statistiques** : tableaux de bord de consommation, graphiques CA mensuel
- **Profil** : modification des coordonnées, changement de mot de passe

### 🏆 Programme Fidélité 5 niveaux
| Niveau    | Commandes | Avantages |
|-----------|-----------|-----------|
| 🥉 Bronze  | 0-4       | Accès portail |
| 🥈 Silver  | 5-9       | Prix préférentiels |
| ⭐ Gold    | 10-19     | Livraison express offerte |
| 🏆 Platinum| 20-29     | Commercial dédié |
| 💎 Diamant | 30+       | Remises spéciales |

### 🔔 Notifications intelligentes
- Confirmation de devis/commande en temps réel
- Alertes de statut production
- Messages de l'équipe

### 📱 Responsive Design
- Interface optimisée desktop, tablette, mobile
- Navigation intuitive à onglets
- Thème sombre premium (marine + or)

---

## 💡 Utilisation recommandée

1. **Créez un compte client** pour chaque client fidèle via Admin → Utilisateurs
2. **Donnez-leur l'URL** de votre GitHub Pages + leurs identifiants
3. Ils commandent seuls depuis `client.html`
4. Vous approuvez dans `commercial.html`
5. La production est suivie dans `production.html`
6. Les paiements sont suivis dans `compta.html`

---

## 🔧 Ajouter un nouveau client

Dans `users.js`, ajoutez dans `DEFAULT_USERS` :
```javascript
{ id: 'monClient', pass: 'h_XXXXX', role: 'client', name: 'Nom Entreprise', redirect: 'client.html', sector: 'Secteur' }
```

Ou plus simplement via l'interface **Admin → Utilisateurs → Ajouter**.

Pour générer un hash de mot de passe : ouvrez la console du navigateur et tapez :
```javascript
hashPass('votreMotDePasse')
```

---

**SIMPACT ERP v3.0 © 2026 — Tous droits réservés**
