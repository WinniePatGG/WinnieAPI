const API_ENDPOINT = '/api/status';
const QUICK_API_ENDPOINT = '/api/quick-status';
const TIMEOUT = 5000;
const RETRY_DELAY = 3000;

const serverInput = document.getElementById('serverInput');
const checkBtn = document.getElementById('checkBtn');
const statusContainer = document.getElementById('statusContainer');
const quickServerLinks = document.querySelectorAll('.quick-servers a');

let currentServer = '';
let timeoutInterval;

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const serverParam = params.get('server');
    if (serverParam) {
        serverInput.value = serverParam;
        checkServer();
    }

    checkBtn.addEventListener('click', checkServer);
    serverInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkServer();
    });

    quickServerLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            serverInput.value = link.dataset.ip;
            checkServer();
        });
    });
});

async function checkServer() {
    currentServer = serverInput.value.trim();
    if (!currentServer) return;
    
    showLoading();
    
    try {
        startTimeoutCounter();
        
        const response = await Promise.race([
            fetch(`${QUICK_API_ENDPOINT}/${encodeURIComponent(currentServer)}`),
            timeoutPromise()
        ]);
        
        if (!response.ok) throw new Error('Server error');
        
        const data = await response.json();
        clearTimeoutCounter();
        
        if (data.online) {
            showServerStatus(data);
            
            if (data.players > 0) {
                loadPlayerList(currentServer);
            }
        } else {
            showError(data.error || 'Server is offline');
        }
        
    } catch (error) {
        clearTimeoutCounter();
        showError(error.message);
    }
}

function timeoutPromise() {
    return new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Server took too long to respond')), TIMEOUT);
    });
}

function startTimeoutCounter() {
    let timeLeft = TIMEOUT / 1000;
    const timeoutBar = document.getElementById('timeoutBar');
    const loadingText = document.getElementById('loadingText');
    
    if (!timeoutBar || !loadingText) return;
    
    timeoutInterval = setInterval(() => {
        timeLeft -= 0.1;
        const percent = (timeLeft / (TIMEOUT / 1000)) * 100;
        timeoutBar.style.width = `${percent}%`;
        
        if (timeLeft <= 0) {
            clearInterval(timeoutInterval);
        } else {
            loadingText.textContent = `Connecting to server... (${timeLeft.toFixed(1)}s)`;
        }
    }, 100);
}

function clearTimeoutCounter() {
    if (timeoutInterval) {
        clearInterval(timeoutInterval);
    }
}

async function loadPlayerList(serverIp) {
    const playersContainer = document.getElementById('playersContainer');
    const playersGrid = document.getElementById('playersGrid');
    const playersLoading = document.getElementById('playersLoading');
    
    if (!playersContainer || !playersGrid || !playersLoading) return;
    
    playersContainer.classList.remove('d-none');
    playersGrid.innerHTML = '';
    playersLoading.classList.remove('d-none');
    
    try {
        const response = await fetch(`${API_ENDPOINT}/${encodeURIComponent(serverIp)}`);
        const data = await response.json();
        
        if (data.players_list && data.players_list.length > 0) {
            renderPlayerList(data.players_list);
        }
    } catch (error) {
        console.error('Failed to load player list:', error);
    } finally {
        playersLoading.classList.add('d-none');
    }
}

function renderPlayerList(players) {
    const playersGrid = document.getElementById('playersGrid');
    const playersCount = document.getElementById('playersCount');
    
    if (!playersGrid || !playersCount) return;
    
    playersCount.textContent = players.length;
    
    playersGrid.innerHTML = players.map(player => `
        <div class="player-card">
            <img src="https://mc-heads.net/avatar/${encodeURIComponent(player)}/64" 
                 alt="${player}" class="player-avatar">
            <div class="player-name">${player}</div>
        </div>
    `).join('');
}

function showLoading() {
    if (!statusContainer) return;
    
    statusContainer.innerHTML = `
        <div class="status-loading text-center py-5">
            <div class="spinner-border text-primary"></div>
            <h5 class="mt-3">Connecting to ${currentServer}...</h5>
            <div class="progress mt-3" style="height: 6px;">
                <div id="timeoutBar" class="progress-bar progress-bar-striped progress-bar-animated" 
                     role="progressbar" style="width: 100%"></div>
            </div>
        </div>
    `;
}

function showError(message) {
    if (!statusContainer) return;
    
    statusContainer.innerHTML = `
        <div class="status-error">
            <div class="alert alert-danger">
                <div class="d-flex">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                    <div>
                        <h5>Error checking ${currentServer}</h5>
                        <p class="mb-0">${message}</p>
                    </div>
                </div>
            </div>
            <button class="btn btn-sm btn-outline-primary w-100 mt-2" onclick="checkServer()">
                <i class="bi bi-arrow-clockwise"></i> Try Again
            </button>
        </div>
    `;
}

function showServerStatus(data) {
    if (!statusContainer) return;
    
    const playerPercentage = (data.players / data.max_players) * 100;
    
    statusContainer.innerHTML = `
        <div class="status-success">
            <div class="server-header">
                <div class="d-flex justify-content-between align-items-center">
                    <h4>${currentServer}</h4>
                    <span class="badge ${data.online ? 'bg-success' : 'bg-danger'}">
                        ${data.online ? 'Online' : 'Offline'}
                    </span>
                </div>
                <div class="server-meta mt-2">
                    <span class="badge bg-dark me-2">${data.version || 'Unknown'}</span>
                    <small class="text-muted">Last updated: ${formatTime(data.last_updated)}</small>
                </div>
            </div>

            <div class="server-stats mt-4">
                <div class="row">
                    <div class="col-md-6">
                        <div class="stat-card">
                            <h6><i class="bi bi-people"></i> Players</h6>
                            <div class="d-flex align-items-end">
                                <h2 class="mb-0 me-2">${data.players}</h2>
                                <span class="text-muted">/ ${data.max_players}</span>
                            </div>
                            <div class="progress mt-2" style="height: 8px;">
                                <div class="progress-bar ${playerPercentage > 90 ? 'bg-danger' : 'bg-success'}" 
                                     role="progressbar" style="width: ${playerPercentage}%"></div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="stat-card">
                            <h6><i class="bi bi-speedometer2"></i> Performance</h6>
                            <div class="d-flex">
                                <div class="me-4">
                                    <div class="stat-value">${data.latency ? data.latency.toFixed(0) : '--'}ms</div>
                                    <div class="stat-label">Ping</div>
                                </div>
                                <div>
                                    <div class="stat-value">${data.response_time_ms ? data.response_time_ms.toFixed(0) : '--'}ms</div>
                                    <div class="stat-label">Response</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="server-motd mt-3">
                <h6><i class="bi bi-chat-square-text"></i> MOTD</h6>
                <div class="motd-box p-3">${formatMotd(data.motd)}</div>
            </div>

            <div id="playersContainer" class="mt-4 ${data.players > 0 ? '' : 'd-none'}">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h6><i class="bi bi-person-video3"></i> Online Players</h6>
                    <small><span id="playersCount">0</span>/<span>${data.max_players}</span></small>
                </div>
                <div id="playersGrid" class="players-grid"></div>
                <div id="playersLoading" class="text-center py-3">
                    <div class="spinner-border spinner-border-sm text-muted"></div>
                    <span class="ms-2">Loading player list...</span>
                </div>
            </div>
        </div>
    `;
}

function formatTime(isoString) {
    if (!isoString) return 'Just now';
    return new Date(isoString).toLocaleTimeString();
}

function formatMotd(motd) {
    if (!motd) return '<span class="text-muted">No MOTD available</span>';
    return motd
        .replace(/§[0-9a-fk-or]/g, '')
        .replace(/\n/g, '<br>')
        .replace(/\[([^\]]+)\]/g, '<span class="motd-format">$1</span>');
}