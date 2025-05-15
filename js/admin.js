// Initialize tasks if they don't exist
function initializeTasks() {
    if (!localStorage.getItem('tasks')) {
        const initialTasks = [
            {
                id: '1',
                title: 'Create project roadmap',
                description: 'Outline the key milestones for Q3 project deliverables',
                assignedBy: '1', // Admin ID
                assignedTo: '2', // Manager ID
                deadline: '2023-08-31',
                priority: 'high',
                status: 'not-started',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: '2',
                title: 'Weekly progress report',
                description: 'Compile and submit the weekly progress report by Friday',
                assignedBy: '1', // Admin ID
                assignedTo: '3', // Team Member ID
                deadline: '2023-08-18',
                priority: 'medium',
                status: 'in-progress',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];
        localStorage.setItem('tasks', JSON.stringify(initialTasks));
    }
}

// Get all tasks
function getTasks() {
    const tasksJSON = localStorage.getItem('tasks');
    return tasksJSON ? JSON.parse(tasksJSON) : [];
}

// Get task by ID
function getTaskById(taskId) {
    const tasks = getTasks();
    return tasks.find(task => task.id === taskId);
}

// Get tasks filtered by assignee
function getTasksByAssignee(userId) {
    const tasks = getTasks();
    return tasks.filter(task => task.assignedTo === userId);
}

// Get tasks filtered by status
function getTasksByStatus(status) {
    const tasks = getTasks();
    return status ? tasks.filter(task => task.status === status) : tasks;
}

// Create a new task
function createTask(taskData) {
    const tasks = getTasks();
    const currentUser = getCurrentUser();
    
    const newTask = {
        id: Date.now().toString(),
        ...taskData,
        assignedBy: currentUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    tasks.push(newTask);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    
    return newTask;
}

// Update task
function updateTask(taskId, updatedData) {
    const tasks = getTasks();
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex !== -1) {
        tasks[taskIndex] = {
            ...tasks[taskIndex],
            ...updatedData,
            updatedAt: new Date().toISOString()
        };
        
        localStorage.setItem('tasks', JSON.stringify(tasks));
        return tasks[taskIndex];
    }
    
    return null;
}

// Delete task
function deleteTask(taskId) {
    const tasks = getTasks();
    const filteredTasks = tasks.filter(task => task.id !== taskId);
    
    localStorage.setItem('tasks', JSON.stringify(filteredTasks));
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
        </div>
        <div class="task-actions">
            <div class="task-status">
                <span class="status-badge ${statusClass}">${statusLabel}</span>
            </div>
            <div class="task-action-buttons">
                <button class="task-action-btn edit-task" title="Edit Task">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="task-action-btn delete-task" title="Delete Task">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        </div>
    `;
    
    // Add event listeners
    taskCard.querySelector('.edit-task').addEventListener('click', () => {
        openEditTaskModal(task.id);
    });
    
    taskCard.querySelector('.delete-task').addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this task?')) {
            deleteTask(task.id);
            renderTasks();
        }
    });
    
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
    
    // Get all tasks
    let tasks = getTasks();
    
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

// Populate assignee dropdown
function populateAssigneeDropdown() {
    const filterAssignee = document.getElementById('filter-assignee');
    const taskAssignee = document.getElementById('task-assignee');
    
    if (filterAssignee) {
        // Get all users except current admin
        const currentUser = getCurrentUser();
        const users = getUsers().filter(user => user.id !== currentUser.id);
        
        // Clear existing options and add default option
        filterAssignee.innerHTML = '<option value="">All</option>';
        
        // Add options for managers and team members
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = `${user.name} (${user.role === 'manager' ? 'Manager' : 'Team Member'})`;
            filterAssignee.appendChild(option);
        });
        
        // Add change event listener
        filterAssignee.addEventListener('change', renderTasks);
    }
    
    if (taskAssignee) {
        // Get all users except current admin
        const currentUser = getCurrentUser();
        const users = getUsers().filter(user => user.id !== currentUser.id);
        
        // Clear existing options
        taskAssignee.innerHTML = '';
        
        // Add options for managers and team members
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = `${user.name} (${user.role === 'manager' ? 'Manager' : 'Team Member'})`;
            taskAssignee.appendChild(option);
        });
    }
}

// Setup task modal
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

// Setup status filter
function setupStatusFilter() {
    const statusFilter = document.getElementById('filter-status');
    
    if (statusFilter) {
        statusFilter.addEventListener('change', renderTasks);
    }
}

// Initialize admin dashboard
function initializeAdminDashboard() {
    initializeTasks();
    populateAssigneeDropdown();
    setupTaskModal();
    setupStatusFilter();
    renderTasks();
}

// Run initialization when DOM content is loaded
document.addEventListener('DOMContentLoaded', initializeAdminDashboard);