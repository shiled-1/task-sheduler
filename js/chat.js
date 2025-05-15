// Initialize chat system
function initializeChat() {
    loadContacts();
    setupMessageSending();
    setupBackNavigation();
}

// Get contacts for chat
function loadContacts() {
    const contactsList = document.getElementById('chat-contacts');
    const currentUser = getCurrentUser();
    
    if (!contactsList || !currentUser) return;
    
    // Clear existing contacts
    contactsList.innerHTML = '';
    
    // Get all users except current user
    const contacts = getUsers().filter(user => user.id !== currentUser.id);
    
    // Render contacts
    contacts.forEach(contact => {
        const contactItem = document.createElement('li');
        contactItem.className = 'chat-contact';
        contactItem.dataset.userId = contact.id;
        
        // Create avatar with initials
        const initials = contact.name.split(' ')
            .map(part => part.charAt(0))
            .join('')
            .toUpperCase();
        
        contactItem.innerHTML = `
            <div class="contact-info">
                <div class="contact-avatar">${initials}</div>
                <div class="contact-details">
                    <div class="contact-name">${contact.name}</div>
                    <div class="contact-role">${formatRole(contact.role)}</div>
                </div>
            </div>
        `;
        
        // Add click event to open chat
        contactItem.addEventListener('click', () => {
            openChat(contact);
        });
        
        contactsList.appendChild(contactItem);
    });
}

// Format role for display
function formatRole(role) {
    switch (role) {
        case 'admin': return 'Administrator';
        case 'manager': return 'Manager';
        case 'member': return 'Team Member';
        default: return role;
    }
}

// Open chat with selected contact
function openChat(contact) {
    // Highlight selected contact
    document.querySelectorAll('.chat-contact').forEach(el => {
        el.classList.remove('active');
    });
    document.querySelector(`.chat-contact[data-user-id="${contact.id}"]`).classList.add('active');
    
    // Hide empty state and show chat view
    document.getElementById('empty-chat').style.display = 'none';
    document.getElementById('chat-view').style.display = 'flex';
    
    // Update chat header
    const initials = contact.name.split(' ')
        .map(part => part.charAt(0))
        .join('')
        .toUpperCase();
    
    document.getElementById('chat-avatar').textContent = initials;
    document.getElementById('chat-name').textContent = contact.name;
    document.getElementById('chat-role').textContent = formatRole(contact.role);
    
    // Set active contact ID
    document.getElementById('chat-view').dataset.contactId = contact.id;
    
    // Load chat history
    loadChatHistory(contact.id);
    
    // Focus message input
    document.getElementById('message-input').focus();
}

// Load chat history
function loadChatHistory(contactId) {
    const messagesContainer = document.getElementById('chat-messages');
    const currentUser = getCurrentUser();
    
    if (!messagesContainer || !currentUser) return;
    
    // Clear existing messages
    messagesContainer.innerHTML = '';
    
    // Get chat history
    const chatHistory = getChatHistory(currentUser.id, contactId);
    
    if (chatHistory.length === 0) {
        messagesContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-comments"></i>
                <h3>No messages yet</h3>
                <p>Start the conversation by sending a message</p>
            </div>
        `;
        return;
    }
    
    // Render messages
    chatHistory.forEach(message => {
        const messageEl = document.createElement('div');
        messageEl.className = `message ${message.senderId === currentUser.id ? 'message-sent' : 'message-received'}`;
        
        // Format time
        const messageTime = new Date(message.timestamp);
        const formattedTime = messageTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        messageEl.innerHTML = `
            <div class="message-content">${message.text}</div>
            <div class="message-time">${formattedTime}</div>
        `;
        
        messagesContainer.appendChild(messageEl);
    });
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Get chat history between two users
function getChatHistory(userId1, userId2) {
    const chatHistoryJSON = localStorage.getItem('chatHistory');
    const chatHistory = chatHistoryJSON ? JSON.parse(chatHistoryJSON) : [];
    
    // Find messages between these two users (in either direction)
    return chatHistory.filter(message => 
        (message.senderId === userId1 && message.receiverId === userId2) ||
        (message.senderId === userId2 && message.receiverId === userId1)
    ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

// Setup message sending
function setupMessageSending() {
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-message');
    
    if (!messageInput || !sendBtn) return;
    
    // Send on click
    sendBtn.addEventListener('click', () => {
        sendMessage();
    });
    
    // Send on Enter
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
}

// Send a message
function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const chatView = document.getElementById('chat-view');
    const currentUser = getCurrentUser();
    
    if (!messageInput || !chatView || !currentUser) return;
    
    const contactId = chatView.dataset.contactId;
    const messageText = messageInput.value.trim();
    
    if (!contactId || !messageText) return;
    
    // Create message object
    const message = {
        id: Date.now().toString(),
        senderId: currentUser.id,
        receiverId: contactId,
        text: messageText,
        timestamp: new Date().toISOString()
    };
    
    // Save message to history
    saveChatMessage(message);
    
    // Clear input
    messageInput.value = '';
    
    // Reload chat history
    loadChatHistory(contactId);
    
    // Focus input again
    messageInput.focus();
}

// Save chat message to storage
function saveChatMessage(message) {
    const chatHistoryJSON = localStorage.getItem('chatHistory');
    const chatHistory = chatHistoryJSON ? JSON.parse(chatHistoryJSON) : [];
    
    // Add new message
    chatHistory.push(message);
    
    // Save back to storage
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
}

// Setup back navigation
function setupBackNavigation() {
    const backBtn = document.getElementById('back-to-dashboard');
    
    if (backBtn) {
        backBtn.addEventListener('click', (e) => {
            e.preventDefault();
            redirectToDashboard(getCurrentUser());
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', initializeChat);