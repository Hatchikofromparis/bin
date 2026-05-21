from flask import Flask, render_template, request, jsonify
import json
import os
from datetime import datetime

app = Flask(__name__)

TASKS_FILE = "tasks.json"

def load_tasks():
    """Load tasks from JSON file (local storage)"""
    if os.path.exists(TASKS_FILE):
        try:
            with open(TASKS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            return []
    return []

def save_tasks(tasks):
    """Save tasks to JSON file (local storage)"""
    with open(TASKS_FILE, 'w', encoding='utf-8') as f:
        json.dump(tasks, f, ensure_ascii=False, indent=2)

@app.route('/')
def index():
    """Main page"""
    tasks = load_tasks()
    return render_template('index.html', tasks=tasks)

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    """Get all tasks"""
    tasks = load_tasks()
    return jsonify(tasks)

@app.route('/api/tasks', methods=['POST'])
def add_task():
    """Add a new task"""
    data = request.json
    tasks = load_tasks()
    
    new_id = max([t.get('id', 0) for t in tasks], default=0) + 1
    
    new_task = {
        'id': new_id,
        'title': data.get('title', ''),
        'description': data.get('description', ''),
        'priority': data.get('priority', 'medium'),
        'category': data.get('category', 'General'),
        'completed': False,
        'due_date': data.get('due_date', ''),
        'created_at': datetime.now().isoformat(),
        'updated_at': datetime.now().isoformat()
    }
    
    tasks.append(new_task)
    save_tasks(tasks)
    return jsonify(new_task), 201

@app.route('/api/tasks/<int:task_id>', methods=['GET'])
def get_task(task_id):
    """Get a specific task"""
    tasks = load_tasks()
    for task in tasks:
        if task['id'] == task_id:
            return jsonify(task)
    return jsonify({'error': 'Task not found'}), 404

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    """Update a task"""
    data = request.json
    tasks = load_tasks()
    
    for task in tasks:
        if task['id'] == task_id:
            task.update({
                'title': data.get('title', task['title']),
                'description': data.get('description', task['description']),
                'priority': data.get('priority', task['priority']),
                'category': data.get('category', task['category']),
                'completed': data.get('completed', task['completed']),
                'due_date': data.get('due_date', task['due_date']),
                'updated_at': datetime.now().isoformat()
            })
            save_tasks(tasks)
            return jsonify(task)
    
    return jsonify({'error': 'Task not found'}), 404

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    """Delete a task"""
    tasks = load_tasks()
    original_length = len(tasks)
    tasks = [t for t in tasks if t['id'] != task_id]
    
    if len(tasks) < original_length:
        save_tasks(tasks)
        return jsonify({'success': True})
    
    return jsonify({'error': 'Task not found'}), 404

@app.route('/api/tasks/search', methods=['GET'])
def search_tasks():
    """Search tasks by title or description"""
    query = request.args.get('q', '').lower()
    tasks = load_tasks()
    
    results = [t for t in tasks if query in t['title'].lower() or query in t['description'].lower()]
    return jsonify(results)

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get task statistics"""
    tasks = load_tasks()
    total = len(tasks)
    completed = len([t for t in tasks if t['completed']])
    pending = total - completed
    
    priority_count = {
        'high': len([t for t in tasks if t['priority'] == 'high' and not t['completed']]),
        'medium': len([t for t in tasks if t['priority'] == 'medium' and not t['completed']]),
        'low': len([t for t in tasks if t['priority'] == 'low' and not t['completed']])
    }
    
    return jsonify({
        'total': total,
        'completed': completed,
        'pending': pending,
        'priority_count': priority_count
    })

if __name__ == '__main__':
    print("🚀 Advanced To-Do List App running on http://localhost:5000")
    print("💾 Data is stored locally in tasks.json")
    app.run(debug=True, port=5000)
