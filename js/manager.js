// Task management functions
let tasks = [];

function initializeTasks() {
    // Load tasks from localStorage or initialize empty array
    const storedTasks = localStorage.getItem('tasks');
    tasks = storedTasks ? JSON.parse(storedTasks) : [];
}

function getTasks() {
    return tasks;
}

function getTaskById(id) {
    return tasks.find(task => task.id === id);
}

function createTask(taskData) {
    const newTask = {
        id: Date.now().toString(),
        ...taskData,
        assignedBy: getCurrentUser().id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    tasks.push(newTask);
    saveTasks();
    return newTask;
}

function updateTask(taskId, taskData) {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
        tasks[taskIndex] = {
            ...tasks[taskIndex],
            ...taskData,
            updatedAt: new Date().toISOString()
        };
        saveTasks();
        return tasks[taskIndex];
    }
    return null;
}

function deleteTask(taskId) {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
        tasks.splice(taskIndex, 1);
        saveTasks();
        return true;
    }
    return false;
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Initialize manager dashboard
function initializeManagerDashboard() {
    initializeTasks();
    populateAssigneeDropdown();
    setupTaskModal();
    setupStatusFilter();
    renderTasks();
}

// Get team members under current manager
function getTeamMembersForManager() {
    return getTeamMembers();
}

// Populate assignee dropdown with team members only
function populateAssigneeDropdown() {
    const filterAssignee = document.getElementById('filter-assignee');
    const taskAssignee = document.getElementById('task-assignee');
    
    if (filterAssignee) {
        // Get all team members
        const teamMembers = getTeamMembersForManager();
        
        // Clear existing options and add default option
        filterAssignee.innerHTML = '<option value="">All</option>';
        
        // Add options for team members
        teamMembers.forEach(member => {
            const option = document.createElement('option');
            option.value = member.id;
            option.textContent = member.name;
            filterAssignee.appendChild(option);
        });
        
        // Add change event listener
        filterAssignee.addEventListener('change', renderTasks);
    }
    
    if (taskAssignee) {
        // Get all team members
        const teamMembers = getTeamMembersForManager();
        
        // Clear existing options
        taskAssignee.innerHTML = '';
        
        // Add options for team members
        teamMembers.forEach(member => {
            const option = document.createElement('option');
            option.value = member.id;
            option.textContent = member.name;
            taskAssignee.appendChild(option);
        });
    }
}

// Render task card
function renderTaskCard(task) {
    const assignedToUser = getUserById(task.assignedTo);
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
    
    // Check if this is a task assigned by manager or to manager
    const currentUser = getCurrentUser();
    const isTaskFromManager = task.assignedBy === currentUser.id;
    const isTaskToManager = task.assignedTo === currentUser.id;
    
    taskCard.innerHTML = `
        <div class="task-card-header">
            <div class="task-title">${task.title}</div>
            <div class="task-priority ${priorityClass}">${task.priority}</div>
        </div>
        <div class="task-description">${task.description}</div>
        <div class="task-meta">
            <div class="task-assignee">
                <i class="fas fa-user"></i> ${assignedToUser ? assignedToUser.name : 'Unknown User'}
            </div>
            <div class="task-deadline">
                <i class="fas fa-calendar"></i> ${formattedDeadline}
            </div>
            ${!isTaskFromManager ? `<div class="task-assigned-by">
                <i class="fas fa-user-tie"></i> Assigned by: ${assignedByUser ? assignedByUser.name : 'Unknown User'}
            </div>` : ''}
        </div>
        <div class="task-actions">
            <div class="task-status">
                <span class="status-badge ${statusClass}">${statusLabel}</span>
            </div>
            <div class="task-action-buttons">
                ${isTaskFromManager ? `
                <button class="task-action-btn edit-task" title="Edit Task">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="task-action-btn delete-task" title="Delete Task">
                    <i class="fas fa-trash-alt"></i>
                </button>
                ` : isTaskToManager ? `
                <button class="task-action-btn update-task" title="Update Status">
                    <i class="fas fa-clock"></i>
                </button>
                ` : `
                <button class="task-action-btn view-task" title="View Task">
                    <i class="fas fa-eye"></i>
                </button>
                `}
            </div>
        </div>
    `;
    
    // Add event listeners
    if (isTaskFromManager) {
        taskCard.querySelector('.edit-task').addEventListener('click', () => {
            openEditTaskModal(task.id);
        });
        
        taskCard.querySelector('.delete-task').addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this task?')) {
                deleteTask(task.id);
                renderTasks();
            }
        });
    } else if (isTaskToManager) {
        taskCard.querySelector('.update-task').addEventListener('click', () => {
            openUpdateTaskModal(task.id);
        });
    }
    
    return taskCard;
}

// Render tasks to the tasks list
function renderTasks() {
    const tasksContainer = document.getElementById('tasks-list');
    if (!tasksContainer) return;
    
    // Clear existing tasks
    tasksContainer.innerHTML = '';
    
    // Get filters
    const assigneeFilter = document.getElementById('filter-assignee').value;
    const statusFilter = document.getElementById('filter-status').value;
    
    // Get current user
    const currentUser = getCurrentUser();
    
    // Get all tasks (either assigned by the manager or assigned to the manager)
    let tasks = getTasks().filter(task => 
        task.assignedBy === currentUser.id || task.assignedTo === currentUser.id
    );
    
    // Apply filters
    if (assigneeFilter) {
        tasks = tasks.filter(task => task.assignedTo === assigneeFilter);
    }
    
    if (statusFilter) {
        tasks = tasks.filter(task => task.status === statusFilter);
    }
    
    // Sort tasks by updated date (newest first)
    tasks.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    
    // Render tasks
    if (tasks.length === 0) {
        tasksContainer.innerHTML = '<div class="empty-state"><i class="fas fa-tasks"></i><p>No tasks found. Create a new task to get started.</p></div>';
        return;
    }
    
    tasks.forEach(task => {
        tasksContainer.appendChild(renderTaskCard(task));
    });
}

// Setup task modal for creating/editing tasks
function setupTaskModal() {
    const modal = document.getElementById('task-modal');
    const addTaskBtn = document.getElementById('add-task-btn');
    const closeModal = document.querySelector('.close-modal');
    const cancelBtn = document.getElementById('cancel-task');
    const taskForm = document.getElementById('task-form');
    
    if (!modal || !addTaskBtn || !closeModal || !cancelBtn || !taskForm) return;
    
    // Open modal when Add Task button is clicked
    addTaskBtn.addEventListener('click', () => {
        document.getElementById('modal-title').textContent = 'New Task';
        taskForm.reset();
        document.getElementById('task-id').value = '';
        
        // Set deadline to tomorrow by default
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        document.getElementById('task-deadline').value = tomorrow.toISOString().split('T')[0];
        
        modal.style.display = 'block';
    });
    
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
        const taskData = {
            title: document.getElementById('task-title').value,
            description: document.getElementById('task-description').value,
            assignedTo: document.getElementById('task-assignee').value,
            deadline: document.getElementById('task-deadline').value,
            priority: document.getElementById('task-priority').value,
            status: 'not-started'
        };
        
        if (taskId) {
            // Update existing task
            updateTask(taskId, taskData);
        } else {
            // Create new task
            createTask(taskData);
        }
        
        // Close modal and update task list
        modal.style.display = 'none';
        renderTasks();
    });
}

// Open edit task modal
function openEditTaskModal(taskId) {
    const task = getTaskById(taskId);
    if (!task) return;
    
    const modal = document.getElementById('task-modal');
    document.getElementById('modal-title').textContent = 'Edit Task';
    
    document.getElementById('task-id').value = task.id;
    document.getElementById('task-title').value = task.title;
    document.getElementById('task-description').value = task.description;
    document.getElementById('task-assignee').value = task.assignedTo;
    document.getElementById('task-deadline').value = task.deadline;
    document.getElementById('task-priority').value = task.priority;
    
    modal.style.display = 'block';
}

// Open update task modal for tasks assigned to the manager
function openUpdateTaskModal(taskId) {
    const task = getTaskById(taskId);
    if (!task) return;
    
    // Show custom modal for updating status
    const modal = document.getElementById('task-modal');
    document.getElementById('modal-title').textContent = 'Update Task Status';
    
    document.getElementById('task-id').value = task.id;
    document.getElementById('task-title').value = task.title;
    document.getElementById('task-description').value = task.description;
    
    // If there's a task-status field for manager to update their own tasks
    const taskStatusField = document.getElementById('task-status');
    if (taskStatusField) {
        taskStatusField.value = task.status;
    }
    
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
document.addEventListener('DOMContentLoaded', initializeManagerDashboard);