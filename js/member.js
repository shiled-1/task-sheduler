// Helper functions for data management
function getTasks() {
    const storedTasks = localStorage.getItem('tasks');
    return storedTasks ? JSON.parse(storedTasks) : [];
}

function getTaskById(taskId) {
    const tasks = getTasks();
    return tasks.find(task => task.id === taskId);
}

function getUserById(userId) {
    const storedUsers = localStorage.getItem('users');
    const users = storedUsers ? JSON.parse(storedUsers) : [];
    return users.find(user => user.id === userId);
}

function getCurrentUser() {
    const storedUser = localStorage.getItem('currentUser');
    return storedUser ? JSON.parse(storedUser) : null;
}

function updateTask(taskId, updates) {
    const tasks = getTasks();
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex !== -1) {
        tasks[taskIndex] = {
            ...tasks[taskIndex],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
}

// Initialize team member dashboard
function initializeTeamMemberDashboard() {
    renderTasks();
    setupTaskModal();
    setupStatusFilter();
}

// Render task card for team member
function renderTaskCard(task) {
    const assignedByUser = getUserById(task.assignedBy);
    
    // Format date for display
    const deadlineDate = new Date(task.deadline);
    const formattedDeadline = deadlineDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    // Create task card element
    const taskCard = document.createElement('div');
    taskCard.className = 'task-card';
    taskCard.dataset.taskId = task.id;
    
    // Determine status class and label
    let statusClass, statusLabel;
    switch (task.status) {
        case 'not-started':
            statusClass = 'status-not-started';
            statusLabel = 'Not Started';
            break;
        case 'in-progress':
            statusClass = 'status-in-progress';
            statusLabel = 'In Progress';
            break;
        case 'completed':
            statusClass = 'status-completed';
            statusLabel = 'Completed';
            break;
        default:
            statusClass = '';
            statusLabel = 'Unknown';
    }
    
    // Determine priority class and label
    let priorityClass;
    switch (task.priority) {
        case 'low':
            priorityClass = 'priority-low';
            break;
        case 'medium':
            priorityClass = 'priority-medium';
            break;
        case 'high':
            priorityClass = 'priority-high';
            break;
        default:
            priorityClass = '';
    }
    
    taskCard.innerHTML = `
        <div class="task-card-header">
            <div class="task-title">${task.title}</div>
            <div class="task-priority ${priorityClass}">${task.priority}</div>
        </div>
        <div class="task-description">${task.description}</div>
        <div class="task-meta">
            <div class="task-assigned-by">
                <i class="fas fa-user-tie"></i> Assigned by: ${assignedByUser ? assignedByUser.name : 'Unknown User'}
            </div>
            <div class="task-deadline">
                <i class="fas fa-calendar"></i> ${formattedDeadline}
            </div>
        </div>
        <div class="task-actions">
            <div class="task-status">
                <span class="status-badge ${statusClass}">${statusLabel}</span>
            </div>
            <div class="task-action-buttons">
                <button class="task-action-btn update-task" title="Update Status">
                    <i class="fas fa-clock"></i>
                </button>
            </div>
        </div>
    `;
    
    // Add event listener for update button
    taskCard.querySelector('.update-task').addEventListener('click', () => {
        openUpdateTaskModal(task.id);
    });
    
    return taskCard;
}

// Render tasks assigned to the team member
function renderTasks() {
    const tasksContainer = document.getElementById('tasks-list');
    if (!tasksContainer) return;
    
    // Clear existing tasks
    tasksContainer.innerHTML = '';
    
    // Get current user ID
    const currentUser = getCurrentUser();
    
    // Get status filter
    const statusFilter = document.getElementById('filter-status').value;
    
    // Get tasks assigned to the team member
    let tasks = getTasks().filter(task => task.assignedTo === currentUser.id);
    
    // Apply status filter
    if (statusFilter) {
        tasks = tasks.filter(task => task.status === statusFilter);
    }
    
    // Sort tasks by updated date (newest first)
    tasks.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    
    // Render tasks
    if (tasks.length === 0) {
        tasksContainer.innerHTML = '<div class="empty-state"><i class="fas fa-clipboard-check"></i><p>No tasks assigned to you. Check back later.</p></div>';
        return;
    }
    
    tasks.forEach(task => {
        tasksContainer.appendChild(renderTaskCard(task));
    });
}

// Setup task update modal
function setupTaskModal() {
    const modal = document.getElementById('task-modal');
    const closeModal = document.querySelector('.close-modal');
    const cancelBtn = document.getElementById('cancel-task');
    const taskForm = document.getElementById('task-form');
    
    if (!modal || !closeModal || !cancelBtn || !taskForm) return;
    
    // Close modal when X is clicked
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    // Close modal when Cancel button is clicked
    cancelBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    // Close modal when clicking outside the content
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Handle form submission
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const taskId = document.getElementById('task-id').value;
        const newStatus = document.getElementById('task-status').value;
        const comment = document.getElementById('task-comment').value;
        
        // Update task status
        updateTask(taskId, {
            status: newStatus,
            lastComment: comment || null
        });
        
        // Close modal and update task list
        modal.style.display = 'none';
        renderTasks();
    });
}

// Open update task modal
function openUpdateTaskModal(taskId) {
    const task = getTaskById(taskId);
    if (!task) return;
    
    const modal = document.getElementById('task-modal');
    
    document.getElementById('modal-title').textContent = 'Update Task Status';
    document.getElementById('task-id').value = task.id;
    document.getElementById('task-title').value = task.title;
    document.getElementById('task-description').value = task.description;
    document.getElementById('task-status').value = task.status;
    document.getElementById('task-comment').value = '';
    
    modal.style.display = 'block';
}

// Setup status filter
function setupStatusFilter() {
    const statusFilter = document.getElementById('filter-status');
    
    if (statusFilter) {
        statusFilter.addEventListener('change', renderTasks);
    }
}

// Run initialization when DOM content is loaded
document.addEventListener('DOMContentLoaded', initializeTeamMemberDashboard);