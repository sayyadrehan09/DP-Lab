/**
 * CinePattern - Movie & OTT Recommendation System
 * Frontend Application Logic & Backend Integration
 * Interacting with 5 Design Patterns:
 * 1. Singleton (MovieDatabase)
 * 2. Factory Method (MovieFactory)
 * 3. Observer (NotificationService & UserObserver)
 * 4. Protection Proxy (MovieServiceProxy)
 * 5. Chain of Responsibility (RecommendationChain)
 */

// Determine API Base URL
const API_BASE = (window.location.protocol.startsWith('http') && window.location.port === '8080')
  ? '' // Same origin
  : 'http://localhost:8080';

// Application State
const state = {
  currentUser: localStorage.getItem('cp_user') || 'Aryan',
  currentRole: localStorage.getItem('cp_role') || 'USER',
  activeTab: 'catalog',
  movies: [],
  topMovies: [],
  watchlist: [],
  watchlistIds: new Set(),
  notifications: [],
  unreadNotifications: 0,
  patternsInfo: null,
};

// DOM Elements
const elements = {
  // Nav
  navTabs: document.querySelectorAll('.nav-tab'),
  tabSections: document.querySelectorAll('.tab-section'),
  watchlistCountBadge: document.getElementById('watchlistCountBadge'),
  notificationBtn: document.getElementById('notificationBtn'),
  notificationDropdown: document.getElementById('notificationDropdown'),
  notifBadge: document.getElementById('notifBadge'),
  notificationList: document.getElementById('notificationList'),
  userAvatar: document.getElementById('userAvatar'),
  userNameDisplay: document.getElementById('userNameDisplay'),
  userRoleDisplay: document.getElementById('userRoleDisplay'),
  switchUserBtn: document.getElementById('switchUserBtn'),
  
  // Hero Stats
  statTotalMovies: document.getElementById('statTotalMovies'),
  statTopMovies: document.getElementById('statTopMovies'),
  statObservers: document.getElementById('statObservers'),
  
  // Catalog
  catalogMoviesGrid: document.getElementById('catalogMoviesGrid'),
  catalogSearchInput: document.getElementById('catalogSearchInput'),
  catalogGenreFilter: document.getElementById('catalogGenreFilter'),
  catalogPlatformFilter: document.getElementById('catalogPlatformFilter'),

  // Top Rated
  topRatedContainer: document.getElementById('topRatedContainer'),

  // Recommender
  recGenre: document.getElementById('recGenre'),
  recLanguage: document.getElementById('recLanguage'),
  recRating: document.getElementById('recRating'),
  ratingValDisplay: document.getElementById('ratingValDisplay'),
  recPlatform: document.getElementById('recPlatform'),
  runRecommendationBtn: document.getElementById('runRecommendationBtn'),
  countInput: document.getElementById('countInput'),
  countGenre: document.getElementById('countGenre'),
  countLanguage: document.getElementById('countLanguage'),
  countRating: document.getElementById('countRating'),
  countPlatform: document.getElementById('countPlatform'),
  recMatchesCount: document.getElementById('recMatchesCount'),
  recFilterSummary: document.getElementById('recFilterSummary'),
  recMoviesGrid: document.getElementById('recMoviesGrid'),

  // Watchlist
  watchlistMoviesGrid: document.getElementById('watchlistMoviesGrid'),
  watchlistUserName: document.getElementById('watchlistUserName'),

  // Admin Portal
  adminAccessIndicator: document.getElementById('adminAccessIndicator'),
  adminAccessText: document.getElementById('adminAccessText'),
  proxyDeniedAlert: document.getElementById('proxyDeniedAlert'),
  switchToAdminBtn: document.getElementById('switchToAdminBtn'),
  addMovieForm: document.getElementById('addMovieForm'),
  broadcastForm: document.getElementById('broadcastForm'),
  adminObserverCount: document.getElementById('adminObserverCount'),
  adminSubscribersList: document.getElementById('adminSubscribersList'),

  // Patterns Inspector
  refreshPatternsBtn: document.getElementById('refreshPatternsBtn'),
  metricSingletonHash: document.getElementById('metricSingletonHash'),
  metricSingletonCount: document.getElementById('metricSingletonCount'),
  metricObserverCount: document.getElementById('metricObserverCount'),
  metricNotificationCount: document.getElementById('metricNotificationCount'),

  // Login Modal
  loginModal: document.getElementById('loginModal'),
  loginForm: document.getElementById('loginForm'),
  loginNameInput: document.getElementById('loginNameInput'),
  closeLoginModalBtn: document.getElementById('closeLoginModalBtn'),
  toastContainer: document.getElementById('toastContainer'),
};

// ============================================================================
// Initialization
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  updateUserInterface();
  loginUser(state.currentUser, state.currentRole);
  fetchCatalog();
  fetchTopMovies();
  fetchWatchlist();
  fetchNotifications();
  fetchPatternsInfo();

  // Periodic polling for notifications (Observer Pattern)
  setInterval(fetchNotifications, 12000);
});

// ============================================================================
// Event Listeners
// ============================================================================
function setupEventListeners() {
  // Navigation Tabs
  elements.navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.getAttribute('data-tab');
      switchTab(targetTab);
    });
  });

  // Notification Dropdown Toggle
  elements.notificationBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    elements.notificationDropdown.classList.toggle('show');
    if (elements.notificationDropdown.classList.contains('show')) {
      state.unreadNotifications = 0;
      updateNotifBadge();
    }
  });

  document.addEventListener('click', (e) => {
    if (!elements.notificationDropdown.contains(e.target) && e.target !== elements.notificationBtn) {
      elements.notificationDropdown.classList.remove('show');
    }
  });

  // Switch User Modal
  elements.switchUserBtn.addEventListener('click', openLoginModal);
  elements.closeLoginModalBtn.addEventListener('click', closeLoginModal);
  elements.loginModal.addEventListener('click', (e) => {
    if (e.target === elements.loginModal) closeLoginModal();
  });

  elements.loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = elements.loginNameInput.value.trim();
    const roleRadio = document.querySelector('input[name="loginRole"]:checked');
    const role = roleRadio ? roleRadio.value : 'USER';

    if (name) {
      loginUser(name, role);
      closeLoginModal();
    }
  });

  if (elements.switchToAdminBtn) {
    elements.switchToAdminBtn.addEventListener('click', () => {
      loginUser(state.currentUser, 'ADMIN');
    });
  }

  // Catalog Search & Filters
  let searchTimeout;
  elements.catalogSearchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(fetchCatalog, 300);
  });
  elements.catalogGenreFilter.addEventListener('change', fetchCatalog);
  elements.catalogPlatformFilter.addEventListener('change', fetchCatalog);

  // Recommendation Slider
  elements.recRating.addEventListener('input', (e) => {
    elements.ratingValDisplay.textContent = parseFloat(e.target.value).toFixed(1);
  });

  // Execute Recommendation Chain
  elements.runRecommendationBtn.addEventListener('click', executeRecommendationChain);

  // Admin Forms
  elements.addMovieForm.addEventListener('submit', handleAddMovie);
  elements.broadcastForm.addEventListener('submit', handleBroadcast);

  // Refresh Patterns
  elements.refreshPatternsBtn.addEventListener('click', () => {
    fetchPatternsInfo();
    showToast('Design Patterns metrics refreshed from Java backend.', 'info');
  });
}

// ============================================================================
// Tab Navigation
// ============================================================================
function switchTab(tabId) {
  state.activeTab = tabId;
  elements.navTabs.forEach(t => {
    t.classList.toggle('active', t.getAttribute('data-tab') === tabId);
  });
  elements.tabSections.forEach(s => {
    s.classList.toggle('active', s.id === `tab${capitalize(tabId)}`);
  });

  if (tabId === 'watchlist') fetchWatchlist();
  if (tabId === 'top-rated') fetchTopMovies();
  if (tabId === 'patterns') fetchPatternsInfo();
  if (tabId === 'admin') updateAdminPortalView();
}

function capitalize(str) {
  if (!str) return '';
  return str.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
}

// ============================================================================
// User & Auth Management
// ============================================================================
async function loginUser(name, role) {
  state.currentUser = name;
  state.currentRole = role;
  localStorage.setItem('cp_user', name);
  localStorage.setItem('cp_role', role);

  updateUserInterface();

  try {
    const res = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, role })
    });
    const data = await res.json();
    if (data.success) {
      showToast(`Logged in as ${name} (${role}). Registered in Observer Pattern.`, 'success');
      fetchWatchlist();
      fetchPatternsInfo();
    }
  } catch (err) {
    console.warn('Backend offline or login error:', err);
    showToast(`Logged in locally as ${name} (${role})`, 'info');
  }
}

function updateUserInterface() {
  elements.userNameDisplay.textContent = state.currentUser;
  elements.userAvatar.textContent = state.currentUser.charAt(0).toUpperCase();
  elements.userRoleDisplay.textContent = state.currentRole;
  elements.userRoleDisplay.className = `user-role-badge ${state.currentRole === 'ADMIN' ? 'role-admin' : 'role-user'}`;
  elements.watchlistUserName.textContent = state.currentUser;

  updateAdminPortalView();
}

function updateAdminPortalView() {
  const isAdmin = state.currentRole === 'ADMIN';

  elements.adminAccessIndicator.className = `role-status-indicator ${isAdmin ? 'admin-active' : 'user-blocked'}`;
  elements.adminAccessText.textContent = isAdmin
    ? 'Access Granted (ADMIN Role)'
    : 'Mutations Blocked (USER Role)';

  elements.proxyDeniedAlert.style.display = isAdmin ? 'none' : 'flex';
}

function openLoginModal() {
  elements.loginNameInput.value = state.currentUser;
  const roleRadios = document.querySelectorAll('input[name="loginRole"]');
  roleRadios.forEach(r => r.checked = (r.value === state.currentRole));
  elements.loginModal.style.display = 'flex';
}

function closeLoginModal() {
  elements.loginModal.style.display = 'none';
}

// ============================================================================
// Catalog & Movie Rendering
// ============================================================================
async function fetchCatalog() {
  const search = elements.catalogSearchInput.value.trim();
  const genre = elements.catalogGenreFilter.value;
  const platform = elements.catalogPlatformFilter.value;

  const url = new URL(`${API_BASE}/api/movies`, window.location.href);
  if (search) url.searchParams.set('search', search);
  if (genre !== 'Any') url.searchParams.set('genre', genre);
  if (platform !== 'Any') url.searchParams.set('platform', platform);

  try {
    const res = await fetch(url);
    const movies = await res.json();
    state.movies = movies;
    renderCatalogGrid(movies, elements.catalogMoviesGrid);

    elements.statTotalMovies.textContent = movies.length;
  } catch (err) {
    console.error('Error fetching catalog:', err);
    elements.catalogMoviesGrid.innerHTML = `
      <div class="empty-state">
        <p>⚠️ Could not connect to Java Backend at <code>${API_BASE}</code>.</p>
        <p style="margin-top: 0.5rem; font-size: 0.85rem;">Make sure the Java server is running (Run <code>run-backend.bat</code> in backend folder).</p>
      </div>`;
  }
}

function renderCatalogGrid(movies, container, isWatchlistView = false) {
  if (!movies || movies.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>No movies found matching the selected criteria.</p>
      </div>`;
    return;
  }

  container.innerHTML = movies.map(movie => createMovieCardHtml(movie, isWatchlistView)).join('');

  // Attach card event listeners
  container.querySelectorAll('.btn-watchlist').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const movieId = parseInt(btn.getAttribute('data-id'));
      toggleWatchlist(movieId);
    });
  });

  container.querySelectorAll('.btn-delete-movie').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const movieId = parseInt(btn.getAttribute('data-id'));
      deleteMovie(movieId);
    });
  });
}

function createMovieCardHtml(movie, isWatchlistView = false) {
  const isElite = movie.rating >= 9.0;
  const inWatchlist = state.watchlistIds.has(movie.id);
  const platformClass = getPlatformClass(movie.platform);

  return `
    <div class="movie-card" data-id="${movie.id}">
      <div class="card-poster">
        <div class="poster-pattern"></div>
        <div class="card-badges-top">
          <span class="rating-badge ${isElite ? 'elite-rating' : ''}">
            ★ ${movie.rating.toFixed(1)}
          </span>
          <span class="platform-pill ${platformClass}">
            ${movie.platform}
          </span>
        </div>
        <h3 class="card-movie-title">${escapeHtml(movie.title)}</h3>
      </div>
      <div class="card-body">
        <div class="card-meta-list">
          <span class="meta-chip genre-chip">${escapeHtml(movie.genre)}</span>
          <span class="meta-chip">🗣️ ${escapeHtml(movie.language)}</span>
          <span class="meta-chip">📅 ${movie.year}</span>
          <span class="meta-chip">ID #${movie.id}</span>
        </div>
        <div class="card-actions">
          ${isWatchlistView 
            ? `<button class="btn-watchlist in-watchlist" data-id="${movie.id}" title="Remove from Watchlist">
                 <span>✕ Remove</span>
               </button>`
            : `<button class="btn-watchlist ${inWatchlist ? 'in-watchlist' : ''}" data-id="${movie.id}">
                 <span>${inWatchlist ? '✓ In Watchlist' : '+ Watchlist'}</span>
               </button>`
          }
          <button class="btn-delete-movie" data-id="${movie.id}" title="Remove Movie (Proxy Check)">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;
}

function getPlatformClass(platform) {
  const p = (platform || '').toLowerCase();
  if (p.includes('netflix')) return 'platform-netflix';
  if (p.includes('prime')) return 'platform-prime-video';
  if (p.includes('disney')) return 'platform-disney';
  return 'platform-other';
}

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ============================================================================
// Top 5 Rated Movies (9.0+)
// ============================================================================
async function fetchTopMovies() {
  try {
    const res = await fetch(`${API_BASE}/api/top-movies`);
    const movies = await res.json();
    state.topMovies = movies;
    renderTopMovies(movies);

    elements.statTopMovies.textContent = movies.length;
  } catch (err) {
    console.error('Error fetching top movies:', err);
  }
}

function renderTopMovies(movies) {
  if (!movies || movies.length === 0) {
    elements.topRatedContainer.innerHTML = `
      <div class="empty-state">
        <p>No movies with rating 9.0 or higher found.</p>
      </div>`;
    return;
  }

  elements.topRatedContainer.innerHTML = movies.map((movie, index) => {
    const platformClass = getPlatformClass(movie.platform);
    const inWatchlist = state.watchlistIds.has(movie.id);

    return `
      <div class="top-rated-item">
        <div class="rank-badge">#${index + 1}</div>
        <div class="top-rated-info">
          <h3 class="top-rated-title">${escapeHtml(movie.title)}</h3>
          <div class="top-rated-chips">
            <span class="platform-pill ${platformClass}">${movie.platform}</span>
            <span class="meta-chip genre-chip">${escapeHtml(movie.genre)}</span>
            <span class="meta-chip">🗣️ ${escapeHtml(movie.language)}</span>
            <span class="meta-chip">📅 ${movie.year}</span>
          </div>
        </div>
        <div class="top-rated-score">
          <span class="score-num">★ ${movie.rating.toFixed(1)}</span>
          <span class="score-caption">IMDb Masterpiece</span>
        </div>
        <button class="btn-watchlist ${inWatchlist ? 'in-watchlist' : ''}" data-id="${movie.id}">
          <span>${inWatchlist ? '✓ In Watchlist' : '+ Watchlist'}</span>
        </button>
      </div>
    `;
  }).join('');

  elements.topRatedContainer.querySelectorAll('.btn-watchlist').forEach(btn => {
    btn.addEventListener('click', () => {
      const movieId = parseInt(btn.getAttribute('data-id'));
      toggleWatchlist(movieId);
    });
  });
}

// ============================================================================
// Chain of Responsibility Recommender
// ============================================================================
async function executeRecommendationChain() {
  const genre = elements.recGenre.value;
  const language = elements.recLanguage.value;
  const rating = parseFloat(elements.recRating.value);
  const platform = elements.recPlatform.value;

  elements.runRecommendationBtn.disabled = true;
  elements.runRecommendationBtn.innerHTML = `
    <div class="spinner" style="width: 16px; height: 16px; margin: 0; border-width: 2px;"></div>
    Filtering Pipeline...`;

  try {
    const res = await fetch(`${API_BASE}/api/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ genre, language, rating, platform })
    });
    const data = await res.json();

    // Animate and update pipeline trace visualizer
    renderPipelineTrace(data.trace, data.count);

    // Update summary text
    elements.recFilterSummary.textContent = `${genre} | ${language} | Rating ≥ ${rating} | ${platform}`;
    elements.recMatchesCount.textContent = data.count;

    // Render results
    renderCatalogGrid(data.movies, elements.recMoviesGrid);

    showToast(`Chain of Responsibility filtered down to ${data.count} recommendations!`, 'success');
  } catch (err) {
    console.error('Error executing recommendation chain:', err);
    showToast('Failed to execute recommendation pipeline', 'error');
  } finally {
    elements.runRecommendationBtn.disabled = false;
    elements.runRecommendationBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
        <polygon points="5 3 19 12 5 21 5 3"></polygon>
      </svg>
      Execute Chain Pipeline`;
  }
}

function renderPipelineTrace(trace, finalCount) {
  if (!trace || trace.length === 0) return;

  const initialCount = trace[0].inputCount;
  elements.countInput.textContent = initialCount;

  // Trace steps mapping
  // Stage 1: GenreHandler
  const genreStep = trace.find(s => s.handler === 'GenreHandler');
  if (genreStep) {
    elements.countGenre.textContent = genreStep.outputCount;
    highlightNode('nodeGenre');
  }

  // Stage 2: LanguageHandler
  const langStep = trace.find(s => s.handler === 'LanguageHandler');
  if (langStep) {
    elements.countLanguage.textContent = langStep.outputCount;
    highlightNode('nodeLanguage');
  }

  // Stage 3: RatingHandler
  const ratingStep = trace.find(s => s.handler === 'RatingHandler');
  if (ratingStep) {
    elements.countRating.textContent = ratingStep.outputCount;
    highlightNode('nodeRating');
  }

  // Stage 4: PlatformHandler
  const platformStep = trace.find(s => s.handler === 'PlatformHandler');
  if (platformStep) {
    elements.countPlatform.textContent = platformStep.outputCount;
    highlightNode('nodePlatform');
  }
}

function highlightNode(nodeId) {
  const node = document.getElementById(nodeId);
  if (!node) return;
  node.classList.add('active-stage');
  setTimeout(() => {
    node.classList.remove('active-stage');
  }, 1600);
}

// ============================================================================
// Watchlist Management
// ============================================================================
async function fetchWatchlist() {
  try {
    const res = await fetch(`${API_BASE}/api/watchlist?user=${encodeURIComponent(state.currentUser)}`);
    const list = await res.json();
    state.watchlist = list;
    state.watchlistIds = new Set(list.map(m => m.id));

    elements.watchlistCountBadge.textContent = list.length;
    renderCatalogGrid(list, elements.watchlistMoviesGrid, true);
  } catch (err) {
    console.error('Error fetching watchlist:', err);
  }
}

async function toggleWatchlist(movieId) {
  const inWatchlist = state.watchlistIds.has(movieId);

  if (inWatchlist) {
    // Remove from watchlist
    try {
      const res = await fetch(`${API_BASE}/api/watchlist?user=${encodeURIComponent(state.currentUser)}&movieId=${movieId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'info');
        fetchWatchlist();
        fetchCatalog();
      }
    } catch (err) {
      showToast('Error removing from watchlist', 'error');
    }
  } else {
    // Add to watchlist
    try {
      const res = await fetch(`${API_BASE}/api/watchlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: state.currentUser, movieId })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        fetchWatchlist();
        fetchCatalog();
      }
    } catch (err) {
      showToast('Error adding to watchlist', 'error');
    }
  }
}

// ============================================================================
// Admin Operations & Protection Proxy Pattern Interception
// ============================================================================
async function handleAddMovie(e) {
  e.preventDefault();

  const title = document.getElementById('newMovieTitle').value.trim();
  const genre = document.getElementById('newMovieGenre').value;
  const language = document.getElementById('newMovieLang').value;
  const rating = parseFloat(document.getElementById('newMovieRating').value);
  const year = parseInt(document.getElementById('newMovieYear').value);
  const platform = document.getElementById('newMoviePlatform').value;

  const payload = {
    title, genre, language, rating, year, platform, role: state.currentRole
  };

  try {
    const res = await fetch(`${API_BASE}/api/movies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Role': state.currentRole
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (res.status === 403 || !data.success) {
      // Protection Proxy Pattern caught this!
      showToast(`🛡️ ${data.message || 'Access Denied by MovieServiceProxy!'}`, 'error');
    } else {
      showToast(`✨ Movie created via MovieFactory! Broadcast sent to observers.`, 'success');
      elements.addMovieForm.reset();
      fetchCatalog();
      fetchTopMovies();
      fetchNotifications();
      fetchPatternsInfo();
    }
  } catch (err) {
    showToast('Failed to add movie', 'error');
  }
}

async function deleteMovie(movieId) {
  if (!confirm(`Are you sure you want to remove movie #${movieId}?`)) return;

  try {
    const res = await fetch(`${API_BASE}/api/movies?id=${movieId}`, {
      method: 'DELETE',
      headers: {
        'X-User-Role': state.currentRole
      }
    });

    const data = await res.json();

    if (res.status === 403 || !data.success) {
      // Intercepted by MovieServiceProxy!
      showToast(`🛡️ ${data.message || 'Access Denied by MovieServiceProxy!'}`, 'error');
    } else {
      showToast(`🗑️ ${data.message}`, 'success');
      fetchCatalog();
      fetchTopMovies();
      fetchWatchlist();
      fetchNotifications();
      fetchPatternsInfo();
    }
  } catch (err) {
    showToast('Failed to delete movie', 'error');
  }
}

async function handleBroadcast(e) {
  e.preventDefault();

  const message = document.getElementById('broadcastMessage').value.trim();
  if (!message) return;

  try {
    const res = await fetch(`${API_BASE}/api/notify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Role': state.currentRole
      },
      body: JSON.stringify({ message, role: state.currentRole })
    });

    const data = await res.json();

    if (res.status === 403 || !data.success) {
      showToast(`🛡️ ${data.message}`, 'error');
    } else {
      showToast(`📢 ${data.message}`, 'success');
      document.getElementById('broadcastMessage').value = '';
      fetchNotifications();
      fetchPatternsInfo();
    }
  } catch (err) {
    showToast('Failed to broadcast notification', 'error');
  }
}

// ============================================================================
// Observer Pattern Notifications Feed
// ============================================================================
async function fetchNotifications() {
  try {
    const res = await fetch(`${API_BASE}/api/notifications`);
    const records = await res.json();

    if (records.length > state.notifications.length) {
      const newItems = records.length - state.notifications.length;
      state.unreadNotifications += newItems;
      updateNotifBadge();
    }

    state.notifications = records;
    renderNotificationList(records);
  } catch (err) {
    // Server offline or initializing
  }
}

function updateNotifBadge() {
  if (state.unreadNotifications > 0) {
    elements.notifBadge.style.display = 'flex';
    elements.notifBadge.textContent = state.unreadNotifications > 9 ? '9+' : state.unreadNotifications;
  } else {
    elements.notifBadge.style.display = 'none';
  }
}

function renderNotificationList(records) {
  if (!records || records.length === 0) {
    elements.notificationList.innerHTML = `<div class="empty-state">No notifications recorded yet</div>`;
    return;
  }

  elements.notificationList.innerHTML = records.map(rec => `
    <div class="notif-item">
      <div class="notif-message">${escapeHtml(rec.message)}</div>
      <div class="notif-time">${rec.timestamp}</div>
    </div>
  `).join('');
}

// ============================================================================
// Design Patterns Inspector
// ============================================================================
async function fetchPatternsInfo() {
  try {
    const res = await fetch(`${API_BASE}/api/design-patterns`);
    const data = await res.json();
    state.patternsInfo = data;

    // Singleton Metrics
    if (data.singleton) {
      elements.metricSingletonHash.textContent = data.singleton.instanceHash;
      elements.metricSingletonCount.textContent = `${data.singleton.totalMovies} Movies`;
      elements.statTotalMovies.textContent = data.singleton.totalMovies;
    }

    // Observer Metrics
    if (data.observer) {
      elements.metricObserverCount.textContent = `${data.observer.totalSubscribers} Observers`;
      elements.metricNotificationCount.textContent = `${data.observer.recentNotificationsCount} Broadcasts`;
      elements.statObservers.textContent = data.observer.totalSubscribers;

      elements.adminObserverCount.textContent = data.observer.totalSubscribers;
      elements.adminSubscribersList.innerHTML = data.observer.subscribers.map(name => `
        <span class="subscriber-pill">👤 ${escapeHtml(name)}</span>
      `).join('');
    }
  } catch (err) {
    console.warn('Patterns info fetch error:', err);
  }
}

// ============================================================================
// Toast Notification Helper
// ============================================================================
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icon = type === 'success' ? '✓' : (type === 'error' ? '✕' : 'ℹ');
  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-message">${escapeHtml(message)}</span>
  `;

  elements.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(40px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
