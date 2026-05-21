from flask import Flask, render_template, request, jsonify
import json
import os
from datetime import datetime

app = Flask(__name__)

TASKS_FILE = "tasks.json"

def load_tasks():
    """Charger les tâches depuis le fichier JSON"""
    if os.path.exists(TASKS_FILE):
        with open(TASKS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def save_tasks(tasks):
    """Sauvegarder les tâches dans le fichier JSON"""
    with open(TASKS_FILE, 'w', encoding='utf-8') as f:
        json.dump(tasks, f, ensure_ascii=False, indent=2)

@app.route('/')
def index():
    """Page principale"""
    tasks = load_tasks()
    return render_template('index.html', tasks=tasks)

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    """Récupérer toutes les tâches"""
    tasks = load_tasks()
    return jsonify(tasks)

@app.route('/api/tasks', methods=['POST'])
def add_task():
    """Ajouter une nouvelle tâche"""
    data = request.json
    tasks = load_tasks()
    
    new_task = {
        'id': len(tasks) + 1,
        'title': data.get('title'),
        'completed': False,
        'created_at': datetime.now().isoformat()
    }
    
    tasks.append(new_task)
    save_tasks(tasks)
    return jsonify(new_task), 201

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    """Mettre à jour une tâche (marquer comme complétée)"""
    data = request.json
    tasks = load_tasks()
    
    for task in tasks:
        if task['id'] == task_id:
            task['completed'] = data.get('completed', task['completed'])
            save_tasks(tasks)
            return jsonify(task)
    
    return jsonify({'error': 'Task not found'}), 404

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    """Supprimer une tâche"""
    tasks = load_tasks()
    tasks = [t for t in tasks if t['id'] != task_id]
    save_tasks(tasks)
    return jsonify({'success': True})

if __name__ == '__main__':
    print("🚀 Application lancée sur http://localhost:5000")
    app.run(debug=True, port=5000)
