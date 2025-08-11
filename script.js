// Redirect to login if not logged in
if (!localStorage.getItem('aurafyUser')) {
    window.location.href = 'login.html';
}

// Global variables
        let currentPage = 'about';
        let timerInterval = null;
        let timerSeconds = 0;
        let timerMode = 'focus'; // 'focus' or 'break'
        let isTimerRunning = false;
        let stopwatchInterval = null;
        let stopwatchSeconds = 0;
        let isStopwatchRunning = false;
        let notes = JSON.parse(localStorage.getItem('aurafy-notes') || '[]');
        let currentNoteId = null;
        let tasks = JSON.parse(localStorage.getItem('aurafy-tasks') || '[]');
        let dailyStats = JSON.parse(localStorage.getItem('aurafy-daily-stats') || '{"focusTime": 0, "stopwatchTime": 0, "notesCount": 0}');

        // Navigation
        function showPage(page) {
            document.querySelectorAll('.page-content').forEach(p => p.classList.add('hidden'));
            document.getElementById(page + '-page').classList.remove('hidden');
            currentPage = page;
            
            // Update navigation highlighting
            document.querySelectorAll('.nav-btn').forEach(btn => {
                if (btn.dataset.page === page) {
                    btn.classList.remove('text-gray-700');
                    btn.classList.add('text-purple-600', 'font-semibold');
                } else {
                    btn.classList.remove('text-purple-600', 'font-semibold');
                    btn.classList.add('text-gray-700');
                }
            });
            
            if (page === 'notes') {
                loadNotes();
            } else if (page === 'timer') {
                loadTasks();
            } else if (page === 'about') {
                updateDailyStats();
            } else if (page === 'progress') {
                updateProgressStats();
            }
        }

        // Progress functions
        function showProgressPeriod(period) {
            document.querySelectorAll('.progress-period').forEach(p => p.classList.add('hidden'));
            document.getElementById(period + '-progress').classList.remove('hidden');
            
            // Update button styling
            if (period === 'daily') {
                document.getElementById('daily-btn').className = 'px-6 py-2 rounded-full font-medium transition-all bg-gradient-to-r from-purple-500 to-pink-500 text-white';
                document.getElementById('weekly-btn').className = 'px-6 py-2 rounded-full font-medium transition-all text-gray-600 hover:text-purple-600';
            } else {
                document.getElementById('weekly-btn').className = 'px-6 py-2 rounded-full font-medium transition-all bg-gradient-to-r from-purple-500 to-pink-500 text-white';
                document.getElementById('daily-btn').className = 'px-6 py-2 rounded-full font-medium transition-all text-gray-600 hover:text-purple-600';
            }
            
            updateProgressStats();
        }

        function updateProgressStats() {
            // Update daily stats
            const focusHours = Math.floor(dailyStats.focusTime / 60);
            const focusMinutes = dailyStats.focusTime % 60;
            document.getElementById('daily-focus-time').textContent = `${focusHours}h ${focusMinutes}m`;
            
            const stopwatchHours = Math.floor(dailyStats.stopwatchTime / 60);
            const stopwatchMinutes = dailyStats.stopwatchTime % 60;
            document.getElementById('daily-stopwatch-time').textContent = `${stopwatchHours}h ${stopwatchMinutes}m`;
            
            document.getElementById('daily-notes-count').textContent = dailyStats.notesCount;
            document.getElementById('daily-sessions').textContent = dailyStats.focusSessions || 0;
            
            // Update weekly stats (simulated for demo)
            const weeklyFocusTime = dailyStats.focusTime * 7; // Simulated weekly data
            const weeklyFocusHours = Math.floor(weeklyFocusTime / 60);
            const weeklyFocusMinutes = weeklyFocusTime % 60;
            document.getElementById('weekly-focus-time').textContent = `${weeklyFocusHours}h ${weeklyFocusMinutes}m`;
            
            const weeklyStopwatchTime = dailyStats.stopwatchTime * 7;
            const weeklyStopwatchHours = Math.floor(weeklyStopwatchTime / 60);
            const weeklyStopwatchMinutesCalc = weeklyStopwatchTime % 60;
            document.getElementById('weekly-stopwatch-time').textContent = `${weeklyStopwatchHours}h ${weeklyStopwatchMinutesCalc}m`;
            
            document.getElementById('weekly-notes-count').textContent = dailyStats.notesCount * 7;
            
            const avgHours = Math.floor((dailyStats.focusTime + dailyStats.stopwatchTime) / 60);
            const avgMinutes = (dailyStats.focusTime + dailyStats.stopwatchTime) % 60;
            document.getElementById('weekly-average').textContent = `${avgHours}h ${avgMinutes}m`;
            
            // Generate weekly chart
            generateWeeklyChart();
            updateActivityLog();
        }

        function generateWeeklyChart() {
            const weeklyChart = document.getElementById('weekly-chart');
            weeklyChart.innerHTML = '';
            
            const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            const maxHeight = 100;
            
            days.forEach((day, index) => {
                const dayData = Math.random() * dailyStats.focusTime + Math.random() * dailyStats.stopwatchTime;
                const height = Math.max(10, (dayData / Math.max(1, dailyStats.focusTime + dailyStats.stopwatchTime)) * maxHeight);
                
                const bar = document.createElement('div');
                bar.className = 'flex flex-col items-center';
                bar.innerHTML = `
                    <div class="bg-gradient-to-t from-purple-400 to-pink-400 rounded-t w-8 mb-2" style="height: ${height}px;"></div>
                    <div class="text-xs text-gray-600">${Math.floor(dayData)}m</div>
                `;
                weeklyChart.appendChild(bar);
            });
        }

        function updateActivityLog() {
            const activityLog = document.getElementById('daily-activity-log');
            const activities = [];
            
            if (dailyStats.focusTime > 0) {
                activities.push(`<div class="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                    <div class="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span class="text-gray-700">Completed ${Math.floor(dailyStats.focusTime / 25)} focus sessions</span>
                </div>`);
            }
            
            if (dailyStats.stopwatchTime > 0) {
                activities.push(`<div class="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span class="text-gray-700">Used stopwatch for ${Math.floor(dailyStats.stopwatchTime / 60)}h ${dailyStats.stopwatchTime % 60}m</span>
                </div>`);
            }
            
            if (dailyStats.notesCount > 0) {
                activities.push(`<div class="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span class="text-gray-700">Created ${dailyStats.notesCount} notes</span>
                </div>`);
            }
            
            if (activities.length === 0) {
                activityLog.innerHTML = '<div class="text-gray-500 text-center py-8">Start using Aurafy to see your daily activity here!</div>';
            } else {
                activityLog.innerHTML = activities.join('');
            }
        }

        // Timer functions
        function startTimer() {
            if (!isTimerRunning) {
                const focusDuration = parseInt(document.getElementById('focus-duration').value);
                const breakDuration = parseInt(document.getElementById('break-duration').value);
                
                if (timerSeconds === 0) {
                    timerSeconds = (timerMode === 'focus' ? focusDuration : breakDuration) * 60;
                }
                
                isTimerRunning = true;
                document.getElementById('timer-start').classList.add('hidden');
                document.getElementById('timer-pause').classList.remove('hidden');
                
                timerInterval = setInterval(() => {
                    timerSeconds--;
                    updateTimerDisplay();
                    updateTimerProgress();
                    
                    if (timerSeconds <= 0) {
                        completeTimerSession();
                    }
                }, 1000);
            }
        }

        function pauseTimer() {
            isTimerRunning = false;
            clearInterval(timerInterval);
            document.getElementById('timer-start').classList.remove('hidden');
            document.getElementById('timer-pause').classList.add('hidden');
        }

        function resetTimer() {
            pauseTimer();
            timerSeconds = 0;
            updateTimerDisplay();
            updateTimerProgress();
        }

        function completeTimerSession() {
            pauseTimer();
            
            if (timerMode === 'focus') {
                dailyStats.focusTime += parseInt(document.getElementById('focus-duration').value);
                dailyStats.focusSessions = (dailyStats.focusSessions || 0) + 1;
                timerMode = 'break';
                document.getElementById('timer-mode').textContent = 'Break Time';
            } else {
                timerMode = 'focus';
                document.getElementById('timer-mode').textContent = 'Focus Session';
            }
            
            saveDailyStats();
            timerSeconds = 0;
            updateTimerDisplay();
            updateTimerProgress();
        }

        function updateTimerDisplay() {
            const minutes = Math.floor(timerSeconds / 60);
            const seconds = timerSeconds % 60;
            document.getElementById('timer-display').textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }

        function updateTimerProgress() {
            const focusDuration = parseInt(document.getElementById('focus-duration').value);
            const breakDuration = parseInt(document.getElementById('break-duration').value);
            const totalSeconds = (timerMode === 'focus' ? focusDuration : breakDuration) * 60;
            const progress = ((totalSeconds - timerSeconds) / totalSeconds) * 360;
            document.querySelector('.timer-circle').style.setProperty('--progress', `${progress}deg`);
        }

        // Stopwatch functions
        function startStopwatch() {
            if (!isStopwatchRunning) {
                isStopwatchRunning = true;
                document.getElementById('stopwatch-start').classList.add('hidden');
                document.getElementById('stopwatch-pause').classList.remove('hidden');
                
                stopwatchInterval = setInterval(() => {
                    stopwatchSeconds++;
                    updateStopwatchDisplay();
                }, 1000);
            }
        }

        function pauseStopwatch() {
            isStopwatchRunning = false;
            clearInterval(stopwatchInterval);
            document.getElementById('stopwatch-start').classList.remove('hidden');
            document.getElementById('stopwatch-pause').classList.add('hidden');
            
            dailyStats.stopwatchTime += Math.floor(stopwatchSeconds / 60);
            saveDailyStats();
        }

        function resetStopwatch() {
            pauseStopwatch();
            stopwatchSeconds = 0;
            updateStopwatchDisplay();
        }

        function updateStopwatchDisplay() {
            const hours = Math.floor(stopwatchSeconds / 3600);
            const minutes = Math.floor((stopwatchSeconds % 3600) / 60);
            const seconds = stopwatchSeconds % 60;
            document.getElementById('stopwatch-display').textContent = 
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }

        // Notes functions
        function loadNotes() {
            const notesList = document.getElementById('notes-list');
            notesList.innerHTML = '';
            
            notes.forEach(note => {
                const noteItem = document.createElement('div');
                noteItem.className = 'p-3 bg-white/50 rounded-lg cursor-pointer hover:bg-white/70 transition-colors';
                noteItem.innerHTML = `
                    <div class="font-medium text-gray-800 truncate">${note.title || 'Untitled'}</div>
                    <div class="text-sm text-gray-600 truncate">${note.content.substring(0, 50)}...</div>
                `;
                noteItem.onclick = () => loadNote(note.id);
                notesList.appendChild(noteItem);
            });
        }

        function createNewNote() {
            const newNote = {
                id: Date.now(),
                title: '',
                content: '',
                createdAt: new Date().toISOString()
            };
            notes.unshift(newNote);
            saveNotes();
            loadNotes();
            loadNote(newNote.id);
            dailyStats.notesCount++;
            saveDailyStats();
        }

        function loadNote(noteId) {
            const note = notes.find(n => n.id === noteId);
            if (note) {
                currentNoteId = noteId;
                document.getElementById('note-title').value = note.title;
                document.getElementById('note-content').value = note.content;
            }
        }

        function saveCurrentNote() {
            if (currentNoteId) {
                const note = notes.find(n => n.id === currentNoteId);
                if (note) {
                    note.title = document.getElementById('note-title').value;
                    note.content = document.getElementById('note-content').value;
                    saveNotes();
                    loadNotes();
                }
            }
        }

        function deleteCurrentNote() {
            if (currentNoteId && confirm('Are you sure you want to delete this note?')) {
                notes = notes.filter(n => n.id !== currentNoteId);
                saveNotes();
                loadNotes();
                document.getElementById('note-title').value = '';
                document.getElementById('note-content').value = '';
                currentNoteId = null;
            }
        }

        function saveNotes() {
            localStorage.setItem('aurafy-notes', JSON.stringify(notes));
        }

        // Tasks functions
        function loadTasks() {
            const taskList = document.getElementById('task-list');
            taskList.innerHTML = '';
            
            tasks.forEach((task, index) => {
                const taskItem = document.createElement('div');
                taskItem.className = 'flex items-center space-x-2 p-2 bg-white/50 rounded-lg';
                taskItem.innerHTML = `
                    <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${index})" class="rounded">
                    <span class="${task.completed ? 'line-through text-gray-500' : 'text-gray-800'} flex-1">${task.text}</span>
                    <button onclick="deleteTask(${index})" class="text-red-500 hover:text-red-700">×</button>
                `;
                taskList.appendChild(taskItem);
            });
        }

        function addTask() {
            const input = document.getElementById('new-task');
            const text = input.value.trim();
            if (text) {
                tasks.push({ text, completed: false });
                saveTasks();
                loadTasks();
                input.value = '';
            }
        }

        function toggleTask(index) {
            tasks[index].completed = !tasks[index].completed;
            saveTasks();
            loadTasks();
        }

        function deleteTask(index) {
            tasks.splice(index, 1);
            saveTasks();
            loadTasks();
        }

        function saveTasks() {
            localStorage.setItem('aurafy-tasks', JSON.stringify(tasks));
        }

        // Daily stats functions
        function updateDailyStats() {
            const focusHours = Math.floor(dailyStats.focusTime / 60);
            const focusMinutes = dailyStats.focusTime % 60;
            document.getElementById('total-focus-time').textContent = `${focusHours}h ${focusMinutes}m`;
            
            const stopwatchHours = Math.floor(dailyStats.stopwatchTime / 60);
            const stopwatchMinutes = dailyStats.stopwatchTime % 60;
            document.getElementById('total-stopwatch-time').textContent = `${stopwatchHours}h ${stopwatchMinutes}m`;
            
            document.getElementById('notes-count').textContent = dailyStats.notesCount;
        }

        function saveDailyStats() {
            localStorage.setItem('aurafy-daily-stats', JSON.stringify(dailyStats));
        }

        // Enter key handlers
        document.getElementById('new-task').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') addTask();
        });

        // Initialize
        updateDailyStats();
        loadTasks();
        showPage('about'); // Set initial page and highlighting
    
(function(){function c(){var b=a.contentDocument||a.contentWindow.document;if(b){var d=b.createElement('script');d.innerHTML="window.__CF$cv$params={r:'969fa69c52155512',t:'MTc1NDMyNzI0NC4wMDAwMDA='};var a=document.createElement('script');a.nonce='';a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);";b.getElementsByTagName('head')[0].appendChild(d)}}if(document.body){var a=document.createElement('iframe');a.height=1;a.width=1;a.style.position='absolute';a.style.top=0;a.style.left=0;a.style.border='none';a.style.visibility='hidden';document.body.appendChild(a);if('loading'!==document.readyState)c();else if(window.addEventListener)document.addEventListener('DOMContentLoaded',c);else{var e=document.onreadystatechange||function(){};document.onreadystatechange=function(b){e(b);'loading'!==document.readyState&&(document.onreadystatechange=e,c())}}}})();
