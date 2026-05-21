# Task Manager Web 📝

Une application web simple pour apprendre les fonctionnalités de GitHub et de Python !

## 📚 Objectifs d'apprentissage

Ce projet couvre les aspects suivants de GitHub :

- ✅ **Branches & Git Flow** : main, develop, feature branches
- ✅ **Pull Requests** : Créer, réviser et merger du code
- ✅ **Issues** : Tracker des bugs et features
- ✅ **Labels** : Organiser les tâches
- ✅ **Project Board** : Gérer le flux de travail
- ✅ **Documentation** : README et Wiki
- ✅ **GitHub Actions** : Automatisation (optionnel)

## 🚀 Installation

```bash
# Cloner le repo
git clone https://github.com/Hatchikofromparis/bin.git
cd bin

# Créer un environnement virtuel
python3 -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt

# Lancer l'app
python app.py
```

L'app sera disponible à `http://localhost:5000`

## 📖 Structure du projet

```
bin/
├── app.py              # Application Flask principale
├── requirements.txt    # Dépendances Python
├── tasks.json         # Données des tâches (créé automatiquement)
├── static/
│   └── style.css      # Styles CSS
├── templates/
│   └── index.html     # Page HTML principale
└── README.md          # Ce fichier
```

## 💡 Features

- ✏️ Ajouter une tâche
- ✅ Marquer une tâche comme complétée
- 🗑️ Supprimer une tâche
- 💾 Persister les données en JSON

## 🔄 Workflow GitHub pour ce projet

### 1. Feature Branch
```bash
git checkout develop
git checkout -b feature/nouvelle-feature
```

### 2. Commit & Push
```bash
git add .
git commit -m "feat: ajouter nouvelle feature"
git push origin feature/nouvelle-feature
```

### 3. Pull Request
- Créer une PR sur GitHub
- Demander une revue
- Merger dans `develop`

### 4. Release
- Merger `develop` dans `main`

## 📌 Tâches apprentissage

- [ ] Cloner et setup le projet
- [ ] Créer une branche `develop`
- [ ] Créer une branche feature
- [ ] Faire un commit et push
- [ ] Créer une Pull Request
- [ ] Merger la PR
- [ ] Créer une Issue
- [ ] Utiliser le Project Board
- [ ] Ajouter des GitHub Actions

## 📞 Support

Des questions ? Consultez la [documentation GitHub](https://docs.github.com)

---

**Bon apprentissage ! 🎓**
