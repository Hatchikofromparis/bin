// Global state
let tasks = [];
let currentFilter = 'all';
let currentSort = 'recent';

// DOM Elements
const taskForm = document.getElementById('taskForm');
const taskTitle = document.getElementById('taskTitle');
const taskDueDate = document.getElementById('taskDueDate');
const taskPriority = document.getElementById('taskPriority');
const taskCategory = document.getElementById('taskCategory');
const taskDescription = document.getElementById('taskDescription');
const tasksList = document.getElementById('tasksList');
const searchInput = document.getElementById('searchInput');
const filterButtons = document.querySelectorAll('.filter-btn');
const sortBy = document.getElementById('sortBy');
const taskModal = document.getElementById('taskModal');
const editTaskForm = document.getElementById('editTaskForm');
const modalClose = document.querySelector('.modal-close');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    setupEventListeners();
    updateStats();
});

// Setup Event Listeners
function setupEventListeners() {
    taskForm.addEventListener('submit', handleAddTask);
    searchInput.addEventListener('input', handleSearch);
    sortBy.addEventListener('change', handleSort);
    editTaskForm.addEventListener('submit', handleEditTask);
    modalClose.addEventListener('click', closeModal);

    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterButtons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            renderTasks();
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target === taskModal) {
            closeModal();
        }
    });
}

// Load tasks from server (which loads from local storage/JSON)
async function loadTasks() {
    try {
        const response = await fetch('/api/tasks');
        tasks = await response.json();
        renderTasks();
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

// Add new task
async function handleAddTask(e) {
    e.preventDefault();

    const taskData = {
        title: taskTitle.value,
        description: taskDescription.value,
        priority: taskPriority.value,
        category: taskCategory.value,
        due_date: taskDueDate.value
    };

    try {
        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
        });

        if (response.ok) {
            const newTask = await response.json();
            tasks.push(newTask);
            renderTasks();
            updateStats();
            taskForm.reset();
            taskPriority.value = 'medium';
            taskCategory.value = 'General';
            showNotification('✨ Task added successfully!', 'success');
        }
    } catch (error) {
        console.error('Error adding task:', error);
        showNotification('❌ Error adding task', 'error');
    }
}

// Toggle task completion
async function toggleTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
        const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed: !task.completed })
        });

        if (response.ok) {
            task.completed = !task.completed;
            renderTasks();
            updateStats();
        }
    } catch (error) {
        console.error('Error toggling task:', error);
    }
}

// Delete task
async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
        const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            tasks = tasks.filter(t => t.id !== taskId);
            renderTasks();
            updateStats();
            showNotification('🗑️ Task deleted', 'success');
        }
    } catch (error) {
        console.error('Error deleting task:', error);
        showNotification('❌ Error deleting task', 'error');
    }
}

// Edit task
function openEditModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    document.getElementById('editTaskId').value = task.id;
    document.getElementById('editTaskTitle').value = task.title;
    document.getElementById('editTaskDescription').value = task.description;
    document.getElementById('editTaskDueDate').value = task.due_date;
    document.getElementById('editTaskPriority').value = task.priority;

    taskModal.style.display = 'block';
}

function closeModal() {
    taskModal.style.display = 'none';
}

async function handleEditTask(e) {
    e.preventDefault();

    const taskId = parseInt(document.getElementById('editTaskId').value);
    const taskData = {
        title: document.getElementById('editTaskTitle').value,
        description: document.getElementById('editTaskDescription').value,
        priority: document.getElementById('editTaskPriority').value,
        due_date: document.getElementById('editTaskDueDate').value
    };

    try {
        const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
        });

        if (response.ok) {
            const updatedTask = await response.json();
            const index = tasks.findIndex(t => t.id === taskId);
            if (index !== -1) {
                tasks[index] = updatedTask;
            }
            renderTasks();
            updateStats();
            closeModal();
            showNotification('💾 Task updated', 'success');
        }
    } catch (error) {
        console.error('Error updating task:', error);
        showNotification('❌ Error updating task', 'error');
    }
}

// Search tasks
async function handleSearch(e) {
    const query = e.target.value;

    if (query.trim() === '') {
        renderTasks();
        return;
    }

    try {
        const response = await fetch(`/api/tasks/search?q=${encodeURIComponent(query)}`);
        const results = await response.json();
        displayTasks(results);
    } catch (error) {
        console.error('Error searching tasks:', error);
    }
}

// Sort tasks
function handleSort(e) {
    currentSort = e.target.value;
    renderTasks();
}

// Filter and render tasks
function renderTasks() {
    let filtered = filterTasks();
    let sorted = sortTasks(filtered);
    displayTasks(sorted);
}

function filterTasks() {
    switch (currentFilter) {
        case 'pending':
            return tasks.filter(t => !t.completed);
        case 'completed':
            return tasks.filter(t => t.completed);
        case 'high':
            return tasks.filter(t => t.priority === 'high' && !t.completed);
        default:
            return tasks;
    }
}

function sortTasks(tasksToSort) {
    const sorted = [...tasksToSort];

    switch (currentSort) {
        case 'priority':
            const priorityOrder = { high: 1, medium: 2, low: 3 };
            sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
            break;
        case 'duedate':
            sorted.sort((a, b) => {
                if (!a.due_date) return 1;
                if (!b.due_date) return -1;
                return new Date(a.due_date) - new Date(b.due_date);
            });
            break;
        case 'title':
            sorted.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'recent':
        default:
            sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            break;
    }

    return sorted;
}

// Display tasks
function displayTasks(tasksToDisplay) {
    if (tasksToDisplay.length === 0) {
        tasksList.innerHTML = '<div class="empty-state">📭 No tasks to display</div>';
        return;
    }

    tasksList.innerHTML = tasksToDisplay.map(task => `
        <div class="task-item ${task.completed ? 'completed' : ''}">
            <input 
                type="checkbox" 
                class="task-checkbox"
                ${task.completed ? 'checked' : ''}
                onchange="toggleTask(${task.id})"
            >
            <div class="task-content">
                <div class="task-header">
                    <span class="task-title">${escapeHtml(task.title)}</span>
                    <span class="task-priority ${task.priority}">${task.priority.toUpperCase()}</span>
                </div>
                ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
                <div class="task-meta">
                    ${task.category ? `<div class="task-meta-item">📌 ${task.category}</div>` : ''}
                    ${task.due_date ? `<div class="task-meta-item">📅 ${formatDate(task.due_date)}</div>` : ''}
                    <div class="task-meta-item">⏰ ${formatTime(task.created_at)}</div>
                </div>
            </div>
            <div class="task-actions">
                <button class="btn-small btn-edit" onclick="openEditModal(${task.id})">✏️ Edit</button>
                <button class="btn-small btn-delete" onclick="deleteTask(${task.id})">🗑️ Delete</button>
            </div>
        </div>
    `).join('');
}

// Update statistics
async function updateStats() {
    try {
        const response = await fetch('/api/stats');
        const stats = await response.json();

        document.getElementById('totalTasks').textContent = stats.total;
        document.getElementById('completedTasks').textContent = stats.completed;
        document.getElementById('pendingTasks').textContent = stats.pending;
        document.getElementById('highPriority').textContent = stats.priority_count.high;
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showNotification(message, type = 'info') {
    // Simple notification - you can enhance this
    console.log(`[${type.toUpperCase()}] ${message}`);
    // Could add a toast notification library here
}
