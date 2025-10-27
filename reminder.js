// reminder.js - Simple reminder functionality for the Almond extension

(function() {
    'use strict';
    
    console.log('[REMINDER] reminder.js loaded successfully');
    
    // Simple reminder storage
    let reminders = [];
    let reminderIdCounter = 1;
    
    // Initialize reminder controls - called by popup.js
    globalThis.initializeReminderControls = function() {
        console.log('[REMINDER] Initializing reminder panel');
        
        // Get reminder control elements
        const descInput = document.getElementById('reminder-description');
        const dateInput = document.getElementById('reminder-date');
        const timeInput = document.getElementById('reminder-time');
        const addBtn = document.getElementById('add-reminder-btn');
        const clearBtn = document.getElementById('clear-form-btn');
        
        // Debug element finding
        console.log('[REMINDER] Elements found:', {
            descInput: !!descInput,
            addBtn: !!addBtn,
            dateInput: !!dateInput,
            timeInput: !!timeInput
        });
        
        if (!descInput || !addBtn || !dateInput || !timeInput) {
            console.error('[REMINDER] Missing reminder controls in DOM');
            return;
        }
        
        // Set default date and time to current
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const currentTime = now.toTimeString().slice(0, 5);
        
        dateInput.value = today;
        timeInput.value = currentTime;
        
        // Set up event listeners
        addBtn.addEventListener('click', handleAddReminder);
        if (clearBtn) clearBtn.addEventListener('click', clearForm);
        
        descInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && e.ctrlKey && descInput.value.trim()) {
                handleAddReminder();
            }
        });
        
        // Load saved reminders
        loadReminders();
        
        console.log('[REMINDER] Reminder panel initialized successfully');
    };
    
    // Handle adding a new reminder
    function handleAddReminder() {
        console.log('[REMINDER] Add reminder button clicked');
        
        const description = document.getElementById('reminder-description').value.trim();
        const date = document.getElementById('reminder-date').value;
        const time = document.getElementById('reminder-time').value;
        
        if (!description) {
            showError('Please enter a reminder description');
            return;
        }
        
        if (!date || !time) {
            showError('Please select both date and time');
            return;
        }
        
        // Create reminder object
        const reminder = {
            id: reminderIdCounter++,
            description: description,
            date: date,
            time: time,
            datetime: new Date(date + 'T' + time),
            createdAt: new Date()
        };
        
        // Add to reminders array
        reminders.push(reminder);
        
        // Save reminders
        saveReminders();
        
        // Clear form and update display
        clearForm();
        renderReminders();
        
        showSuccess('Reminder added successfully!');
        
        console.log('[REMINDER] Reminder added:', reminder);
    }
    
    // Clear the form
    function clearForm() {
        document.getElementById('reminder-description').value = '';
        
        // Reset to current date/time
        const now = new Date();
        document.getElementById('reminder-date').value = now.toISOString().split('T')[0];
        document.getElementById('reminder-time').value = now.toTimeString().slice(0, 5);
    }
    
    // Render reminders list
    function renderReminders() {
        console.log('[REMINDER] Rendering reminders');
        
        const container = document.getElementById('reminders-list');
        const emptyState = document.getElementById('reminders-empty');
        
        // Show/hide empty state
        if (reminders.length === 0) {
            emptyState.style.display = 'block';
            container.innerHTML = '';
            return;
        } else {
            emptyState.style.display = 'none';
        }
        
        // Sort reminders by date (newest first)
        const sortedReminders = [...reminders].sort((a, b) => b.datetime - a.datetime);
        
        // Render reminder items
        container.innerHTML = sortedReminders.map(reminder => createReminderHTML(reminder)).join('');
        
        // Add event listeners to reminder items
        for (const reminder of sortedReminders) {
            const item = document.querySelector(`[data-reminder-id="${reminder.id}"]`);
            if (item) {
                attachReminderListeners(item, reminder);
            }
        }
    }
    
    // Create HTML for a single reminder
    function createReminderHTML(reminder) {
        return `
            <div class="reminder-item" data-reminder-id="${reminder.id}">
                <div class="reminder-content">
                    <div class="reminder-description">${escapeHtml(reminder.description)}</div>
                    <div class="reminder-datetime">
                        <span class="reminder-date">${formatDate(reminder.datetime)}</span>
                        <span class="reminder-time">${formatTime(reminder.datetime)}</span>
                    </div>
                </div>
                <div class="reminder-actions">
                    <button class="delete-btn" title="Delete">Delete</button>
                </div>
            </div>
        `;
    }
    
    // Attach event listeners to reminder item
    function attachReminderListeners(item, reminder) {
        const deleteBtn = item.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => deleteReminder(reminder.id));
    }
    
    // Delete reminder
    function deleteReminder(reminderId) {
        const reminder = reminders.find(r => r.id === reminderId);
        if (!reminder) return;
        
        if (!confirm('Delete this reminder?')) {
            return;
        }
        
        // Remove from array
        reminders = reminders.filter(r => r.id !== reminderId);
        
        saveReminders();
        renderReminders();
        
        showSuccess('Reminder deleted');
    }
    

    
    // Storage functions
    function saveReminders() {
        try {
            const data = {
                reminders: reminders,
                idCounter: reminderIdCounter
            };
            
            if (chrome?.storage?.sync) {
                chrome.storage.sync.set({reminderData: data});
            } else {
                localStorage.setItem('reminderData', JSON.stringify(data));
            }
        } catch (error) {
            console.warn('[REMINDER] Failed to save reminders:', error);
        }
    }
    
    function loadReminders() {
        try {
            if (chrome?.storage?.sync) {
                chrome.storage.sync.get(['reminderData'], (items) => {
                    if (items.reminderData) {
                        const data = items.reminderData;
                        reminders = data.reminders || [];
                        reminderIdCounter = data.idCounter || 1;
                        
                        // Convert date strings back to Date objects
                        for (const reminder of reminders) {
                            reminder.datetime = new Date(reminder.datetime);
                            reminder.createdAt = new Date(reminder.createdAt);
                        }
                        
                        renderReminders();
                    }
                });
            } else {
                const saved = localStorage.getItem('reminderData');
                if (saved) {
                    const data = JSON.parse(saved);
                    reminders = data.reminders || [];
                    reminderIdCounter = data.idCounter || 1;
                    
                    // Convert date strings back to Date objects
                    for (const reminder of reminders) {
                        reminder.datetime = new Date(reminder.datetime);
                        reminder.createdAt = new Date(reminder.createdAt);
                    }
                    
                    renderReminders();
                }
            }
        } catch (error) {
            console.warn('[REMINDER] Failed to load reminders:', error);
        }
    }
    
    // Utility functions
    function formatDate(date) {
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    
    function formatTime(date) {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }
    

    
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // UI feedback functions
    function showSuccess(message) {
        console.log('[REMINDER] Success:', message);
        // You could add a toast notification here
    }
    
    function showError(message) {
        console.error('[REMINDER] Error:', message);
        alert(message); // Simple alert for now, could be improved with toast
    }
    

    
})();
