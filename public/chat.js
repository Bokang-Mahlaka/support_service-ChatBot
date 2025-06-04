document.addEventListener('DOMContentLoaded', function() {
    const chatbox = document.getElementById('chatbox');
    const input = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const chatToggle = document.getElementById('chatToggle');
    const chatContainer = document.getElementById('chatContainer');
    const closeChatBtn = document.getElementById('closeChatBtn');
    const notificationBadge = document.getElementById('notificationBadge');
    
    let messages = [];
    let isRequestInProgress = false;
    let isChatOpen = false;

    // Chat toggle functionality
    function toggleChat() {
        isChatOpen = !isChatOpen;
        if (chatContainer) chatContainer.classList.toggle('active', isChatOpen);
        if (chatToggle) chatToggle.classList.toggle('active', isChatOpen);
        if (isChatOpen && input) {
            input.focus();
            if (notificationBadge) notificationBadge.style.display = 'none';
        }
    }

    if (chatToggle) chatToggle.addEventListener('click', toggleChat);
    if (closeChatBtn) closeChatBtn.addEventListener('click', toggleChat);

    // Hide notification badge after first interaction
    function hideNotification() {
        if (notificationBadge) notificationBadge.style.display = 'none';
    }

    function getCurrentTime() {
        return new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }

    function appendMessage(role, content) {
        if (!chatbox) return;
        // Remove welcome message if it exists
        const welcomeMsg = chatbox.querySelector('.welcome-message');
        if (welcomeMsg) {
            welcomeMsg.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = role === 'user' ? 'You' : 'AI';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        const messageText = document.createElement('div');
        messageText.textContent = content;
        
        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = getCurrentTime();
        
        messageContent.appendChild(messageText);
        messageContent.appendChild(messageTime);
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);
        
        chatbox.appendChild(messageDiv);
        chatbox.scrollTop = chatbox.scrollHeight;
    }

    function showTypingIndicator() {
        if (!chatbox) return;
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message assistant';
        typingDiv.id = 'typing-indicator';
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = 'AI';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator';
        typingIndicator.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
        
        messageContent.appendChild(typingIndicator);
        typingDiv.appendChild(avatar);
        typingDiv.appendChild(messageContent);
        
        chatbox.appendChild(typingDiv);
        chatbox.scrollTop = chatbox.scrollHeight;
    }

    function removeTypingIndicator() {
        if (!chatbox) return;
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    if (sendBtn && input) {
        sendBtn.onclick = async () => {
            if (isRequestInProgress) return;
            
            const userMsg = input.value.trim();
            if (!userMsg) return;
            
            hideNotification();
            appendMessage('user', userMsg);
            messages.push({ role: 'user', content: userMsg });
            input.value = '';
            sendBtn.disabled = true;
            isRequestInProgress = true;
            
            showTypingIndicator();
            
            try {
                const res = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ messages }),
                });
                
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.details || errorData.error || 'Server error');
                }
                
                const data = await res.json();
                
                removeTypingIndicator();
                appendMessage('assistant', data.reply || data.error);
                
                if (data.reply) {
                    messages.push({ role: 'assistant', content: data.reply });
                }
            } catch (err) {
                console.error('Chat error:', err);
                removeTypingIndicator();
                appendMessage('assistant', `Error: ${err.message || 'Sorry, I\'m having trouble connecting right now. Please try again.'}`);
            }
            
            sendBtn.disabled = false;
            isRequestInProgress = false;
        };

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendBtn.onclick();
            }
        });
    }

    // Show notification badge initially
    setTimeout(() => {
        if (!isChatOpen && notificationBadge) {
            notificationBadge.style.display = 'flex';
        }
    }, 3000);
});
    