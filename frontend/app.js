/**
 * TiMN / CinePattern - Ultra-Modern OTT Frontend Architecture
 * Interacting with 8 Gang of Four Design Patterns:
 * 1. Singleton (MovieDatabase)
 * 2. Factory Method (MovieFactory)
 * 3. Observer (NotificationService & UserObserver)
 * 4. Protection Proxy (MovieServiceProxy)
 * 5. Chain of Responsibility (RecommendationChain)
 * 6. Strategy (SortingStrategy)
 * 7. Template Method (WatchlistReportTemplate)
 * 8. Memento (WatchlistMemento)
 */

const API_BASE = (window.location.protocol.startsWith('http') && (
  (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') ||
  window.location.port === '8080'
)) ? '' : 'http://localhost:8080';

// Supabase Cloud Configuration
const SUPABASE_URL = "https://mhxkftnldxziqhydyfbf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oeGtmdG5sZHh6aXFoeWR5ZmJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2MjM5NDIsImV4cCI6MjEwNzE5OTk0Mn0.3PSHd6qK3WuhN69gXZhcC_yTmHwmFf5sEwyVTdMe714";
const SUPABASE_BUCKET = "invoices";

let supabaseClient = null;
if (window.supabase && typeof window.supabase.createClient === 'function') {
  try {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (err) {
    console.warn('Supabase initialization warning:', err);
  }
}

// Global Curated High-Definition Posters & Backdrops from TMDb & Wikimedia Commons (Saved Locally)
const MOVIE_IMAGE_ASSETS = {
  'Elio': {
    poster: 'images/elio_poster.jpg',
    backdrop: 'images/elio_backdrop.jpg',
    synopsis: 'Elio, an 11-year-old space fanatic, is beamed up to the Communiverse and mistaken for the intergalactic ambassador of Earth.'
  },
  'Spider Man': {
    poster: 'images/spiderman_poster.jpg',
    backdrop: 'images/spiderman_backdrop.jpg',
    synopsis: 'With Spider-Man\'s identity revealed, Peter asks Doctor Strange for help, unleashing villains from alternate dimensions across the multiverse.'
  },
  'Wonder Woman': {
    poster: 'images/wonderwoman_poster.jpg',
    backdrop: 'images/wonderwoman_poster.jpg',
    synopsis: 'When pilot Steve Trevor crashes on Themyscira, Amazon princess Diana leaves her island to stop World War I.'
  },
  'Mortal Engines': {
    poster: 'images/mortalengines_poster.jpg',
    backdrop: 'images/mortalengines_backdrop.jpg',
    synopsis: 'In a post-apocalyptic world where cities roam on giant wheels devouring smaller towns, a mysterious young woman seeks vengeance.'
  },
  'Rampage': {
    poster: 'images/rampage_poster.jpg',
    backdrop: 'images/rampage_poster.jpg',
    synopsis: 'Primatologist Davis Okoye teams up with genetic engineer Kate to halt genetically mutated apex predators devastating Chicago.'
  },
  'Alita: Battle Angel': {
    poster: 'images/alita_poster.jpg',
    backdrop: 'images/alita_backdrop.jpg',
    synopsis: 'A deactivated female cyborg with a human brain is revived by cyberdoctor Ido and embarks on a journey to reclaim her identity.'
  },
  'Black Widow': {
    poster: 'images/blackwidow_poster.jpg',
    backdrop: 'images/blackwidow_backdrop.jpg',
    synopsis: 'Natasha Romanoff confronts the darkest parts of her ledger when a dangerous conspiracy with ties to her past emerges.'
  },
  'Jurassic World: Dominion': {
    poster: 'images/jurassicworld_poster.jpg',
    backdrop: 'images/jurassicworld_poster.jpg',
    synopsis: 'Dinosaurs now live and hunt alongside humans worldwide, determining whether humans remain the apex predators.'
  },
  'Guardians of the Galaxy': {
    poster: 'images/guardians_poster.jpg',
    backdrop: 'images/guardians_poster.jpg',
    synopsis: 'Peter Quill rallies his team on a dangerous mission to save Rocket\'s life, a quest that could lead to the team\'s dissolution.'
  },
  'The Shawshank Redemption': {
    poster: 'images/shawshank_poster.jpg',
    backdrop: 'images/shawshank_poster.jpg',
    synopsis: 'Banker Andy Dufresne is sentenced to life imprisonment in Shawshank State Prison for a crime he did not commit.'
  },
  'The Godfather': {
    poster: 'images/godfather_poster.jpg',
    backdrop: 'images/godfather_poster.jpg',
    synopsis: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant youngest son.'
  },
  'The Dark Knight': {
    poster: 'images/darkknight_poster.jpg',
    backdrop: 'images/darkknight_poster.jpg',
    synopsis: 'When the menace known as the Joker wreaks havoc on Gotham City, Batman must accept one of the greatest tests of his ability to fight injustice.'
  },
  'The Lord of the Rings': {
    poster: 'images/lotr_poster.jpg',
    backdrop: 'images/lotr_poster.jpg',
    synopsis: 'Gandalf and Aragorn lead the World of Men against Sauron\'s army to draw his gaze from Frodo and Sam approaching Mount Doom.'
  },
  'Inception': {
    poster: 'images/inception_poster.jpg',
    backdrop: 'images/inception_poster.jpg',
    synopsis: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea.'
  },
  'Interstellar': {
    poster: 'images/interstellar_poster.jpg',
    backdrop: 'images/interstellar_poster.jpg',
    synopsis: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot is tasked with piloting a spacecraft to find a new home.'
  },
  'Avengers: Endgame': {
    poster: 'images/avengers_poster.jpg',
    backdrop: 'images/avengers_poster.jpg',
    synopsis: 'After the devastating events of Infinity War, the universe is in ruins. With the help of allies, the Avengers assemble once more.'
  },
  'Dangal': {
    poster: 'images/dangal_poster.jpg',
    backdrop: 'images/dangal_poster.jpg',
    synopsis: 'Former wrestler Mahavir Singh Phogat trains his daughters Geeta and Babita to become India\'s first world-class female wrestlers.'
  },
  '3 Idiots': {
    poster: 'images/3idiots_poster.jpg',
    backdrop: 'images/3idiots_poster.jpg',
    synopsis: 'Two friends search for their long-lost companion Rancho while revisiting college memories and his teachings to question conformity.'
  },
  'KGF': {
    poster: 'images/kgf_poster.jpg',
    backdrop: 'images/kgf_poster.jpg',
    synopsis: 'Rocky, a high-ranking mercenary in Mumbai, journeys undercover to the Kolar Gold Fields to liberate enslaved workers.'
  },
  'Drishyam': {
    poster: 'images/drishyam_poster.jpg',
    backdrop: 'images/drishyam_poster.jpg',
    synopsis: 'A cable TV operator takes desperate measures to shield his family from law enforcement after an unexpected incident occurs.'
  },
  'The Martian': {
    poster: 'images/martian_poster.jpg',
    backdrop: 'images/martian_poster.jpg',
    synopsis: 'An astronaut becomes stranded on Mars after his team assume him dead, and must rely on his ingenuity to signal Earth.'
  },
  'Joker': {
    poster: 'images/joker_poster.jpg',
    backdrop: 'images/joker_poster.jpg',
    synopsis: 'A mentally troubled stand-up comedian embarks on a downward spiral that leads to the creation of an iconic villain.'
  },
  'The Matrix': {
    poster: 'images/matrix_poster.jpg',
    backdrop: 'images/matrix_poster.jpg',
    synopsis: 'A computer programmer discovers a dystopian world where humanity is trapped inside a simulated reality created by machines.'
  },
  'Gladiator': {
    poster: 'images/gladiator_poster.jpg',
    backdrop: 'images/gladiator_poster.jpg',
    synopsis: 'A betrayed Roman general fights his way through the gladiatorial arenas of Rome to avenge the murders of his family and emperor.'
  },
  'Forrest Gump': {
    poster: 'images/forrestgump_poster.jpg',
    backdrop: 'images/forrestgump_poster.jpg',
    synopsis: 'The history of the United States unfolds from the perspective of an Alabama man with an IQ of 75 who longs for his childhood sweetheart.'
  },
  'The Hangover': {
    poster: 'images/hangover_poster.jpg',
    backdrop: 'images/hangover_poster.jpg',
    synopsis: 'Three buddies wake up from a bachelor party in Las Vegas with no memory of the previous night and the bachelor missing.'
  },
  'Shutter Island': {
    poster: 'images/shutterisland_poster.jpg',
    backdrop: 'images/shutterisland_poster.jpg',
    synopsis: 'A U.S. Marshal investigates the mysterious disappearance of a murderess who escaped from a hospital for the criminally insane.'
  },
  'Taare Zameen Par': {
    poster: 'images/taarezameenpar_poster.jpg',
    backdrop: 'images/taarezameenpar_poster.jpg',
    synopsis: 'An eight-year-old boy is thought to be a troublemaker until the new art teacher discovers the real problem behind his struggles.'
  },
  'Zindagi Na Milegi Dobara': {
    poster: 'images/znmd_poster.jpg',
    backdrop: 'images/znmd_poster.jpg',
    synopsis: 'Three childhood friends embark on a three-week road trip across Spain, facing their deepest fears and discovering the value of life.'
  },
  'War': {
    poster: 'images/war_poster.jpg',
    backdrop: 'images/war_poster.jpg',
    synopsis: 'An Indian soldier is assigned to eliminate his former mentor, who has unexpectedly gone rogue.'
  },
  'Andhadhun': {
    poster: 'images/andhadhun_poster.jpg',
    backdrop: 'images/andhadhun_poster.jpg',
    synopsis: 'A series of mysterious events unfold when a blind pianist unknowingly crosses paths with a crime scene in an actor\'s apartment.'
  },
  'Lagaan': {
    poster: 'images/lagaan_poster.jpg',
    backdrop: 'images/lagaan_poster.jpg',
    synopsis: 'In Victorian India, the residents of a small village bet their future on a game of cricket against their ruthless British rulers.'
  },
  'PK': {
    poster: 'images/pk_poster.jpg',
    backdrop: 'images/pk_poster.jpg',
    synopsis: 'An alien on Earth loses the only device he can use to communicate with his spaceship, exposing the rigidities of earthly religions.'
  },
  'RRR': {
    poster: 'images/rrr_poster.jpg',
    backdrop: 'images/rrr_poster.jpg',
    synopsis: 'A fictitious story about two legendary revolutionaries and their journey away from home before they began fighting for their country in the 1920s.'
  },
  'Avatar': {
    poster: 'images/avatar_poster.jpg',
    backdrop: 'images/avatar_poster.jpg',
    synopsis: 'A paraplegic Marine dispatched to the moon Pandora on a unique mission becomes torn between following his orders and protecting the world he feels is his home.'
  },
  'Dead Poets Society': {
    poster: 'images/deadpoets_poster.jpg',
    backdrop: 'images/deadpoets_poster.jpg',
    synopsis: 'Maverick teacher John Keating uses poetry to embolden his pupils to seize the day at an orthodox boarding school.'
  },
  'Harry Potter and the Philosopher\'s Stone': {
    poster: 'images/harrypotter_poster.jpg',
    backdrop: 'images/harrypotter_poster.jpg',
    synopsis: 'An orphaned boy enrolls in a school of wizardry, where he learns the truth about himself, his family and the terrible evil that haunts the magical world.'
  },
  'Dune: Part Two': {
    poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&fit=crop',
    synopsis: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.'
  },
  'Oppenheimer': {
    poster: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=500&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1200&fit=crop',
    synopsis: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.'
  }
};

// Application State
const isSessionActive = localStorage.getItem('cp_timn_session_active') === 'true';
const appState = {
  currentUser: isSessionActive ? localStorage.getItem('cp_timn_user') : null,
  currentRole: isSessionActive ? localStorage.getItem('cp_timn_role') : null,
  isLoggedIn: isSessionActive && !!localStorage.getItem('cp_timn_user'),
  currentView: 'home',
  pendingWatchlistMovie: null,
  movies: [],
  filteredMovies: [],
  watchlist: [],
  notifications: [],
  activePlatformFilter: 'all',
  activeGenreFilter: null,
  activeSeriesType: 'all',
  searchGenreFilter: 'all',
  searchPlatformFilter: 'all',
  activeSortStrategy: 'rating',
  selectedParty: 'Mortal Engines',
  featuredHeroMovie: 'Elio',
  selectedMovieForModal: null,
  historyStack: ['home'],
  historyIndex: 0
};

// Rich Web Series & Anime Catalog with Genre Types, Seasons, Ratings & OTT Badges
const WEB_SERIES_CATALOG = [
  {
    id: 'ws-1',
    title: 'Breaking Bad',
    type: 'Thriller',
    platform: 'Netflix',
    rating: 9.5,
    seasons: '5 Seasons • 62 Episodes',
    year: 2008,
    synopsis: 'A high school chemistry teacher diagnosed with terminal lung cancer teams up with a former student to secure his family\'s future.',
    posterUrl: 'images/matrix_poster.jpg'
  },
  {
    id: 'ws-2',
    title: 'Stranger Things',
    type: 'Sci-Fi & Mystery',
    platform: 'Netflix',
    rating: 8.7,
    seasons: '4 Seasons • 34 Episodes',
    year: 2016,
    synopsis: 'When a young boy vanishes, a small Indiana town uncovers a supernatural mystery involving the secret Upside Down dimension.',
    posterUrl: 'images/spiderman_poster.jpg'
  },
  {
    id: 'ws-3',
    title: 'Dark',
    type: 'Thriller',
    platform: 'Netflix',
    rating: 8.7,
    seasons: '3 Seasons • 26 Episodes',
    year: 2017,
    synopsis: 'A missing child sets four families on a frantic hunt for answers as they unearth a mind-bending mystery spanning three generations.',
    posterUrl: 'images/shutterisland_poster.jpg'
  },
  {
    id: 'ws-4',
    title: 'Attack on Titan',
    type: 'Anime',
    platform: 'Crunchyroll',
    rating: 9.1,
    seasons: '4 Seasons • 89 Episodes',
    year: 2013,
    synopsis: 'After his hometown is destroyed and his mother killed, Eren Jaeger vows to cleanse the earth of the giant humanoid Titans.',
    posterUrl: 'images/avatar_poster.jpg'
  },
  {
    id: 'ws-5',
    title: 'Death Note',
    type: 'Anime',
    platform: 'Netflix',
    rating: 9.0,
    seasons: '1 Season • 37 Episodes',
    year: 2006,
    synopsis: 'An intelligent high school student embarks on a secret crusade to eliminate criminals using a supernatural notebook.',
    posterUrl: 'images/joker_poster.jpg'
  },
  {
    id: 'ws-6',
    title: 'Jujutsu Kaisen',
    type: 'Anime',
    platform: 'Crunchyroll',
    rating: 8.6,
    seasons: '2 Seasons • 47 Episodes',
    year: 2020,
    synopsis: 'Yuji Itadori swallows a cursed finger talisman to save his friends, plunging into the deadly world of Jujutsu sorcerers.',
    posterUrl: 'images/rampage_poster.jpg'
  },
  {
    id: 'ws-7',
    title: 'Demon Slayer',
    type: 'Anime',
    platform: 'Netflix',
    rating: 8.6,
    seasons: '4 Seasons • 55 Episodes',
    year: 2019,
    synopsis: 'Tanjiro sets out on a perilous quest to avenge his slaughtered family and find a cure to turn his demon sister Nezuko human.',
    posterUrl: 'images/guardians_poster.jpg'
  },
  {
    id: 'ws-8',
    title: 'Cyberpunk: Edgerunners',
    type: 'Anime',
    platform: 'Netflix',
    rating: 8.3,
    seasons: '1 Season • 10 Episodes',
    year: 2022,
    synopsis: 'A street kid trying to survive in Night City - a tech and body-modification obsessed metropolis - becomes a mercenary outlaw.',
    posterUrl: 'images/alita_poster.jpg'
  },
  {
    id: 'ws-9',
    title: 'Panchayat',
    type: 'Comedy',
    platform: 'Prime Video',
    rating: 9.0,
    seasons: '3 Seasons • 24 Episodes',
    year: 2020,
    synopsis: 'An engineering graduate takes up a low-salary job as secretary of a remote Gram Panchayat in the rural village of Phulera.',
    posterUrl: 'images/3idiots_poster.jpg'
  },
  {
    id: 'ws-10',
    title: 'The Office',
    type: 'Comedy',
    platform: 'Netflix',
    rating: 9.0,
    seasons: '9 Seasons • 201 Episodes',
    year: 2005,
    synopsis: 'A hilarious mockumentary on the quirky employees at Dunder Mifflin paper company led by the eccentric Michael Scott.',
    posterUrl: 'images/hangover_poster.jpg'
  },
  {
    id: 'ws-11',
    title: 'Brooklyn Nine-Nine',
    type: 'Comedy',
    platform: 'Netflix',
    rating: 8.4,
    seasons: '8 Seasons • 153 Episodes',
    year: 2013,
    synopsis: 'Talented but carefree NYPD detective Jake Peralta clashes and bonds with his strict commanding officer Captain Ray Holt.',
    posterUrl: 'images/znmd_poster.jpg'
  },
  {
    id: 'ws-12',
    title: 'Money Heist',
    type: 'Thriller',
    platform: 'Netflix',
    rating: 8.2,
    seasons: '5 Seasons • 41 Episodes',
    year: 2017,
    synopsis: 'The Professor leads eight masked robbers code-named after world cities to print 2.4 billion euros inside Spain\'s Royal Mint.',
    posterUrl: 'images/drishyam_poster.jpg'
  },
  {
    id: 'ws-13',
    title: 'Squid Game',
    type: 'Thriller',
    platform: 'Netflix',
    rating: 8.0,
    seasons: '1 Season • 9 Episodes',
    year: 2021,
    synopsis: '456 debt-ridden players risk their lives in deadly children\'s games for a life-changing 45.6 billion won jackpot.',
    posterUrl: 'images/mortalengines_poster.jpg'
  },
  {
    id: 'ws-14',
    title: 'Mirzapur',
    type: 'Crime Drama',
    platform: 'Prime Video',
    rating: 8.5,
    seasons: '3 Seasons • 28 Episodes',
    year: 2018,
    synopsis: 'Akhandanand Tripathi rules the carpet underworld of Mirzapur while his ruthless son Munna clashes with Guddu Pandit.',
    posterUrl: 'images/kgf_poster.jpg'
  },
  {
    id: 'ws-15',
    title: 'Sacred Games',
    type: 'Crime Drama',
    platform: 'Netflix',
    rating: 8.5,
    seasons: '2 Seasons • 16 Episodes',
    year: 2018,
    synopsis: 'A cryptic call from wanted gangster Ganesh Gaitonde gives troubled cop Sartaj Singh 25 days to save Mumbai from annihilation.',
    posterUrl: 'images/andhadhun_poster.jpg'
  },
  {
    id: 'ws-16',
    title: 'Peaky Blinders',
    type: 'Crime Drama',
    platform: 'Netflix',
    rating: 8.8,
    seasons: '6 Seasons • 36 Episodes',
    year: 2013,
    synopsis: 'Thomas Shelby leads the notorious Birmingham gang Peaky Blinders through razor battles, racecourses, and political corruption.',
    posterUrl: 'images/godfather_poster.jpg'
  },
  {
    id: 'ws-17',
    title: 'Severance',
    type: 'Sci-Fi & Mystery',
    platform: 'Apple TV+',
    rating: 8.7,
    seasons: '1 Season • 9 Episodes',
    year: 2022,
    synopsis: 'Lumon Industries employees undergo a surgical procedure separating their work memories from their personal home life.',
    posterUrl: 'images/inception_poster.jpg'
  },
  {
    id: 'ws-18',
    title: 'The Boys',
    type: 'Action',
    platform: 'Prime Video',
    rating: 8.7,
    seasons: '4 Seasons • 32 Episodes',
    year: 2019,
    synopsis: 'Billy Butcher and The Boys embark on a bloody quest to expose the corrupt, megalomaniacal superhero corporation Vought.',
    posterUrl: 'images/war_poster.jpg'
  }
];

// Helper: Get Movie Images & Metadata
function getMovieAssets(title) {
  if (MOVIE_IMAGE_ASSETS[title]) return MOVIE_IMAGE_ASSETS[title];
  
  // Search partial matches
  for (const [key, val] of Object.entries(MOVIE_IMAGE_ASSETS)) {
    if (title.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(title.toLowerCase())) {
      return val;
    }
  }

  // Local Fallback
  return {
    poster: 'images/elio_poster.jpg',
    backdrop: 'images/elio_backdrop.jpg',
    synopsis: 'An acclaimed cinematic masterpiece streaming on premium OTT channels.'
  };
}

// ============================================================================
// INITIALIZATION
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  initUserSession();
  setupEventListeners();
  loadMoviesFromBackend();
  loadWatchlistFromBackend();
  loadNotificationsFromBackend();
  renderWebSeries('all');
  switchView('home');

  // Periodic Observer notifications polling (every 7s)
  setInterval(loadNotificationsFromBackend, 7000);
});

function initUserSession() {
  const sidebarGuestBlock = document.getElementById('sidebarGuestBlock');
  const sidebarUserBlock = document.getElementById('sidebarUserBlock');
  const topNavSignInBtn = document.getElementById('topNavSignInBtn');
  const topUserWrap = document.getElementById('topUserWrap');
  const topNavAddMovieBtn = document.getElementById('topNavAddMovieBtn');

  if (appState.isLoggedIn && appState.currentUser) {
    if (sidebarGuestBlock) sidebarGuestBlock.style.display = 'none';
    if (sidebarUserBlock) sidebarUserBlock.style.display = 'block';
    if (topNavSignInBtn) topNavSignInBtn.style.display = 'none';
    if (topUserWrap) topUserWrap.style.display = 'flex';

    const nameEl = document.getElementById('sidebarUserName');
    if (nameEl) nameEl.textContent = appState.currentUser;

    const roleEl = document.getElementById('sidebarUserRole');
    if (roleEl) {
      if (appState.currentRole === 'ADMIN') {
        roleEl.style.color = 'var(--accent-gold)';
        roleEl.textContent = 'ADMIN (Catalog)';
        if (topNavAddMovieBtn) topNavAddMovieBtn.style.display = 'inline-flex';
      } else {
        roleEl.style.color = 'var(--accent-cyan)';
        roleEl.textContent = 'USER';
        if (topNavAddMovieBtn) topNavAddMovieBtn.style.display = 'none';
      }
    }
  } else {
    // Guest Mode
    if (sidebarGuestBlock) sidebarGuestBlock.style.display = 'block';
    if (sidebarUserBlock) sidebarUserBlock.style.display = 'none';
    if (topNavSignInBtn) topNavSignInBtn.style.display = 'inline-flex';
    if (topUserWrap) topUserWrap.style.display = 'none';
    if (topNavAddMovieBtn) topNavAddMovieBtn.style.display = 'none';

    const badge = document.getElementById('sidebarWatchlistBadge');
    if (badge) badge.textContent = '0';
  }

  updateProxyStatusText();
  updateAccountUI();
  renderWatchlistPageView();
}

function updateProxyStatusText() {
  const explanationEl = document.getElementById('proxyStatusExplanation');
  const adminAddMovieSec = document.getElementById('adminAddMovieSection');
  if (!explanationEl) return;

  if (appState.isLoggedIn && appState.currentRole === 'ADMIN') {
    explanationEl.innerHTML = `<span style="color:var(--accent-green);">✓ ADMIN GRANTED:</span> Logged in with Admin privileges (<code>admin@gmail.com</code>). You can add movies to the global catalog and broadcast announcements via <code>MovieServiceProxy</code>.`;
    if (adminAddMovieSec) adminAddMovieSec.style.display = 'block';
  } else if (appState.isLoggedIn) {
    explanationEl.innerHTML = `<span style="color:var(--accent-cyan);">👤 USER ACCESS:</span> Logged in as standard user. You can add any movie to your personal Watchlist. Global catalog movie additions are protected by <code>MovieServiceProxy</code>.`;
    if (adminAddMovieSec) adminAddMovieSec.style.display = 'none';
  } else {
    explanationEl.innerHTML = `<span style="color:var(--text-muted);">🔒 GUEST MODE:</span> You are browsing without an active session. Please sign in to save movies to your Watchlist.`;
    if (adminAddMovieSec) adminAddMovieSec.style.display = 'none';
  }
}

// ============================================================================
// API INTEGRATIONS
// ============================================================================

// 1. Singleton Database & Strategy Sorter
async function loadMoviesFromBackend() {
  try {
    const res = await fetch(`${API_BASE}/api/sort?strategy=${appState.activeSortStrategy}`);
    if (!res.ok) throw new Error('API fetch failed');
    const data = await res.json();
    appState.movies = data.movies || [];
    applyClientFilters();
    renderLatestMovies();
    renderTop10Movies();
    renderTrendingMovies();
    renderSearchResults();
  } catch (err) {
    console.warn('Fallback loading /api/movies:', err);
    try {
      const res2 = await fetch(`${API_BASE}/api/movies`);
      const data2 = await res2.json();
      appState.movies = Array.isArray(data2) ? data2 : (data2.movies || []);
      applyClientFilters();
      renderLatestMovies();
      renderTop10Movies();
      renderTrendingMovies();
      renderSearchResults();
    } catch (e2) {
      showToast('Error connecting to backend server on port 8080');
    }
  }
}

// 2. Watchlist (Memento & Observer Pattern)
async function loadWatchlistFromBackend() {
  if (!appState.isLoggedIn || !appState.currentUser) {
    appState.watchlist = [];
    updateWatchlistUI();
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/api/watchlist?username=${encodeURIComponent(appState.currentUser)}`);
    if (!res.ok) return;
    const data = await res.json();
    appState.watchlist = Array.isArray(data) ? data : (data.watchlist || []);
    updateWatchlistUI();
  } catch (e) {
    console.warn('Watchlist load error:', e);
  }
}

function openAuthModal(noticeText) {
  const modal = document.getElementById('authModal');
  const banner = document.getElementById('authNoticeBanner');
  if (banner && noticeText) {
    banner.querySelector('div').innerHTML = `<strong>Login Required:</strong> ${noticeText}`;
    banner.style.display = 'flex';
  }
  if (modal) modal.classList.add('active');
}

async function toggleWatchlistMovie(movie) {
  // If user is guest, prompt login/signup modal!
  if (!appState.isLoggedIn) {
    appState.pendingWatchlistMovie = movie;
    openAuthModal(`Please sign in or create an account to add "${movie.title}" to your Watchlist.`);
    return;
  }

  const isPresent = appState.watchlist.some(m => m.id === movie.id || m.title === movie.title);
  try {
    if (isPresent) {
      const res = await fetch(`${API_BASE}/api/watchlist?username=${encodeURIComponent(appState.currentUser)}&movieId=${movie.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast(`Removed "${movie.title}" from Watchlist (Memento snapshot recorded)`, 'undo');
        loadWatchlistFromBackend();
        loadNotificationsFromBackend();
        applyClientFilters();
      }
    } else {
      const res = await fetch(`${API_BASE}/api/watchlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: appState.currentUser,
          movieId: movie.id
        })
      });
      if (res.ok) {
        showToast(`✓ Added "${movie.title}" to your Watchlist!`);
        loadWatchlistFromBackend();
        loadNotificationsFromBackend();
        applyClientFilters();
      }
    }
  } catch (e) {
    showToast('Failed to update watchlist');
  }
}

// 3. Memento Pattern: Undo Last Watchlist Action
async function triggerMementoUndo() {
  try {
    const res = await fetch(`${API_BASE}/api/watchlist/undo?username=${encodeURIComponent(appState.currentUser)}`, {
      method: 'POST'
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast('↩ Watchlist state restored via Memento Pattern!');
      loadWatchlistFromBackend();
      loadNotificationsFromBackend();
    } else {
      showToast(data.message || 'No previous Memento snapshot found to restore.');
    }
  } catch (e) {
    showToast('Undo failed: network error');
  }
}

// 4. Template Method Pattern: Export Watchlist Report
async function exportWatchlistReport(format = 'html') {
  if (!appState.currentUser) {
    showToast('Please sign in first to export your watchlist.');
    openAuthModal();
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/api/watchlist/export?username=${encodeURIComponent(appState.currentUser)}&format=${format}`);
    if (!res.ok) throw new Error('Export failed');
    const data = await res.json();
    const content = data.content || '';

    if (format === 'html') {
      const blob = new Blob([content], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      showToast('Generated HTML report via Template Method Pattern');
    } else {
      const mime = format === 'json' ? 'application/json' : (format === 'markdown' || format === 'md' ? 'text/markdown' : 'text/plain');
      const ext = format === 'json' ? 'json' : (format === 'markdown' || format === 'md' ? 'md' : 'txt');
      const blob = new Blob([content], { type: mime });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Watchlist_${appState.currentUser}.${ext}`;
      link.click();
      showToast(`Exported ${data.format || format.toUpperCase()} report via Template Method Pattern`);
    }
  } catch (e) {
    showToast('Export failed');
  }
}

// 5. Observer Pattern: Notifications Feed
async function loadNotificationsFromBackend() {
  try {
    const res = await fetch(`${API_BASE}/api/notifications?username=${encodeURIComponent(appState.currentUser)}`);
    if (!res.ok) return;
    const data = await res.json();
    appState.notifications = data.notifications || [];
    renderNotifications();
  } catch (e) {
    // silently catch polling errors
  }
}

async function sendAdminBroadcast() {
  const input = document.getElementById('broadcastInput');
  const message = input.value.trim();
  if (!message) return;

  try {
    const res = await fetch(`${API_BASE}/api/notify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Role': appState.currentRole,
        'X-User-Name': appState.currentUser
      },
      body: JSON.stringify({ message })
    });

    if (res.status === 403) {
      showToast('🚫 Proxy Pattern Denied: Only ADMIN can broadcast alerts!');
      return;
    }

    if (res.ok) {
      showToast('📢 Notification broadcasted to all UserObservers!');
      input.value = '';
      loadNotificationsFromBackend();
    }
  } catch (e) {
    showToast('Broadcast error');
  }
}

// 6. Protection Proxy: Add Movie (Admin Only)
async function handleAddMovieSubmit(e) {
  e.preventDefault();
  const payload = {
    title: document.getElementById('addMovieTitle').value.trim(),
    genre: document.getElementById('addMovieGenre').value.trim(),
    language: document.getElementById('addMovieLang').value.trim(),
    rating: parseFloat(document.getElementById('addMovieRating').value),
    year: parseInt(document.getElementById('addMovieYear').value),
    platform: document.getElementById('addMoviePlatform').value.trim()
  };

  try {
    const res = await fetch(`${API_BASE}/api/movies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Role': appState.currentRole,
        'X-User-Name': appState.currentUser
      },
      body: JSON.stringify(payload)
    });

    if (res.status === 403) {
      showToast('🚫 Proxy Error: 403 Forbidden. Only ADMIN role can add movies!');
      return;
    }

    if (res.ok) {
      showToast(`🎬 Added "${payload.title}" to database via MovieFactory!`);
      closeAllModals();
      loadMoviesFromBackend();
      loadNotificationsFromBackend();
    }
  } catch (err) {
    showToast('Failed to add movie');
  }
}

// 7. Chain of Responsibility: Filter Pipeline
async function runChainFilterPipeline() {
  const genre = document.getElementById('recGenreSelect').value;
  const lang = document.getElementById('recLangSelect').value;
  const minRating = document.getElementById('recMinRating').value;
  const platform = document.getElementById('recPlatformSelect').value;

  try {
    const params = new URLSearchParams();
    if (genre) params.append('genre', genre);
    if (lang) params.append('language', lang);
    if (minRating) params.append('rating', minRating);
    if (platform) params.append('platform', platform);

    const res = await fetch(`${API_BASE}/api/recommend?${params.toString()}`);
    if (!res.ok) throw new Error('Filter failed');
    const data = await res.json();

    appState.filteredMovies = data.recommendedMovies || [];
    renderCatalogGrid();
    closeAllModals();
    showToast(`Chain of Responsibility found ${appState.filteredMovies.length} matching movies!`);

    // Scroll smoothly to catalog
    document.getElementById('catalogSection').scrollIntoView({ behavior: 'smooth' });
  } catch (e) {
    showToast('Pipeline filter error');
  }
}

// ============================================================================
// UI RENDERING LOGIC
// ============================================================================

function applyClientFilters() {
  if (!appState.movies || appState.movies.length === 0) {
    loadMoviesFromBackend();
    return;
  }
  const globalInput = document.getElementById('globalSearchInput');
  const search = (appState.currentView === 'home' || appState.currentView === 'movies') && globalInput
    ? globalInput.value.toLowerCase().trim()
    : '';
  
  appState.filteredMovies = appState.movies.filter(movie => {
    // Search match
    if (search && !movie.title.toLowerCase().includes(search) && !movie.genre.toLowerCase().includes(search)) {
      return false;
    }
    // Platform pill match
    if (appState.activePlatformFilter !== 'all' && movie.platform.toLowerCase() !== appState.activePlatformFilter.toLowerCase()) {
      return false;
    }
    // Genre pill match
    if (appState.activeGenreFilter && movie.genre.toLowerCase() !== appState.activeGenreFilter.toLowerCase()) {
      return false;
    }
    return true;
  });

  renderCatalogGrid();
}

// Helper: Create Standard Movie Card Element
function createMovieCardElement(movie) {
  const assets = getMovieAssets(movie.title);
  const isSaved = appState.isLoggedIn && appState.watchlist.some(w => w.id === movie.id || w.title === movie.title);

  const card = document.createElement('div');
  card.className = 'movie-card';
  card.innerHTML = `
    <div class="movie-poster-wrap">
      <img src="${assets.poster}" alt="${movie.title}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&fit=crop'">
      <div class="movie-rating-badge">
        <span>★</span> ${movie.rating.toFixed(1)}
      </div>
      <button class="movie-fav-btn ${isSaved ? 'active' : ''}" title="${isSaved ? 'Remove from Watchlist' : 'Add to Watchlist'}">
        <svg viewBox="0 0 24 24" fill="${isSaved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>
    </div>
    <div class="movie-info-wrap">
      <div class="movie-title" title="${movie.title}">${movie.title}</div>
      <div class="movie-genre-row">
        <span>${movie.genre}</span>
        <span class="movie-year">${movie.year}</span>
      </div>
    </div>
  `;

  // Click card to open Movie Detail Modal
  card.addEventListener('click', (e) => {
    if (e.target.closest('.movie-fav-btn')) return;
    openMovieDetailModal(movie);
  });

  // Favorite bookmark button
  const favBtn = card.querySelector('.movie-fav-btn');
  favBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleWatchlistMovie(movie);
  });

  return card;
}

function renderCatalogGrid() {
  const grid = document.getElementById('catalogMoviesGrid');
  if (!grid) return;
  grid.innerHTML = '';

  if (appState.filteredMovies.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 40px; color:var(--text-muted);">
      No movies found matching current filters.
    </div>`;
    return;
  }

  appState.filteredMovies.forEach(movie => {
    grid.appendChild(createMovieCardElement(movie));
  });
}

// Render Latest Movies on Homepage
function renderLatestMovies() {
  const container = document.getElementById('latestMoviesRow');
  if (!container) return;
  container.innerHTML = '';

  const latest = [...appState.movies]
    .sort((a, b) => (b.year || 2020) - (a.year || 2020))
    .slice(0, 10);

  latest.forEach(movie => {
    container.appendChild(createMovieCardElement(movie));
  });
}

// Render Top 10 Movies Today with Metallic Ranking Numbers (1-10)
function renderTop10Movies() {
  const container = document.getElementById('top10MoviesGrid');
  if (!container) return;
  container.innerHTML = '';

  const top10 = [...appState.movies]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 10);

  top10.forEach((movie, index) => {
    const assets = getMovieAssets(movie.title);
    const card = document.createElement('div');
    card.className = 'top10-card';
    card.innerHTML = `
      <div class="top10-rank-num">${index + 1}</div>
      <div class="top10-poster-wrap">
        <img src="${assets.poster}" alt="${movie.title}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&fit=crop'">
        <div class="top10-badge">★ ${movie.rating.toFixed(1)}</div>
      </div>
    `;

    card.addEventListener('click', () => openMovieDetailModal(movie));
    container.appendChild(card);
  });
}

// Render Trending Movies Row on Movies View
function renderTrendingMovies() {
  const container = document.getElementById('moviesTrendingRow');
  if (!container) return;
  container.innerHTML = '';

  const trending = [...appState.movies]
    .filter(m => m.rating >= 8.2)
    .slice(0, 10);

  trending.forEach(movie => {
    container.appendChild(createMovieCardElement(movie));
  });
}

// Search Results Controller
function renderSearchResults() {
  const grid = document.getElementById('searchResultsGrid');
  const countLabel = document.getElementById('searchResultCount');
  const input = document.getElementById('dedicatedSearchInput');
  if (!grid) return;

  const query = (input ? input.value : '').toLowerCase().trim();

  if (!appState.movies || appState.movies.length === 0) {
    loadMoviesFromBackend();
    return;
  }

  let matches = appState.movies.filter(movie => {
    if (query) {
      const matchTitle = movie.title.toLowerCase().includes(query);
      const matchGenre = movie.genre.toLowerCase().includes(query);
      const matchLang = movie.language ? movie.language.toLowerCase().includes(query) : false;
      const matchPlatform = movie.platform.toLowerCase().includes(query);
      
      let matchSpecial = false;
      if (query.includes('nolan')) {
        const nolanTitles = ['inception', 'interstellar', 'the dark knight', 'oppenheimer'];
        matchSpecial = nolanTitles.some(t => movie.title.toLowerCase().includes(t));
      } else if (query.includes('bollywood')) {
        matchSpecial = movie.language && movie.language.toLowerCase() === 'hindi';
      } else if (query.includes('dune')) {
        matchSpecial = movie.title.toLowerCase().includes('dune');
      }

      if (!matchTitle && !matchGenre && !matchLang && !matchPlatform && !matchSpecial) return false;
    }
    if (appState.searchPlatformFilter && appState.searchPlatformFilter !== 'all') {
      if (movie.platform.toLowerCase() !== appState.searchPlatformFilter.toLowerCase()) return false;
    }
    if (appState.searchGenreFilter && appState.searchGenreFilter !== 'all') {
      if (movie.genre.toLowerCase() !== appState.searchGenreFilter.toLowerCase()) return false;
    }
    return true;
  });

  grid.innerHTML = '';
  if (countLabel) {
    countLabel.textContent = query 
      ? `Found ${matches.length} movies matching "${query}"` 
      : `Showing all ${matches.length} movies available`;
  }

  if (matches.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align:center; padding: 50px 20px; color:var(--text-muted);">
        <div style="font-size:36px;margin-bottom:8px;">🎬</div>
        <p style="font-size:16px;color:#fff;font-weight:600;margin-bottom:6px;">No movies found matching "${query}"</p>
        <p style="font-size:13px;">Try searching for "Action", "Sci-Fi", "Inception", "Dune", or "Netflix".</p>
      </div>
    `;
    return;
  }

  matches.forEach(movie => {
    grid.appendChild(createMovieCardElement(movie));
  });
}

// Web Series & Anime Renderer
function renderWebSeries(typeFilter = 'all') {
  appState.activeSeriesType = typeFilter;
  const grid = document.getElementById('webSeriesGrid');
  const countPill = document.getElementById('seriesCountPill');
  if (!grid) return;

  grid.innerHTML = '';

  const filtered = typeFilter === 'all' 
    ? WEB_SERIES_CATALOG 
    : WEB_SERIES_CATALOG.filter(s => s.type.toLowerCase().includes(typeFilter.toLowerCase()));

  if (countPill) countPill.textContent = `Showing ${filtered.length} Series`;

  filtered.forEach(series => {
    const isSaved = appState.isLoggedIn && appState.watchlist.some(w => w.title === series.title);
    const ottClass = series.platform.toLowerCase().replace(/[\s\+]/g, '');

    const card = document.createElement('div');
    card.className = 'movie-card';
    card.innerHTML = `
      <div class="movie-poster-wrap">
        <img src="${series.posterUrl}" alt="${series.title}" loading="lazy" onerror="this.src='images/elio_poster.jpg'">
        <div class="movie-rating-badge">★ ${series.rating.toFixed(1)}</div>
        <button class="movie-fav-btn ${isSaved ? 'active' : ''}" title="${isSaved ? 'Saved to Watchlist' : 'Add to Watchlist'}">
          <svg viewBox="0 0 24 24" fill="${isSaved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
      </div>
      <div class="movie-info-wrap">
        <div class="movie-title" title="${series.title}">${series.title}</div>
        <div class="movie-genre-row">
          <span>${series.type}</span>
          <span class="movie-year">${series.seasons.split('•')[0].trim()}</span>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:6px;">
          <span class="ott-badge-tag ${ottClass}">${series.platform}</span>
          <span style="font-size:11px;color:var(--text-muted);">${series.year}</span>
        </div>
      </div>
    `;

    card.addEventListener('click', (e) => {
      if (e.target.closest('.movie-fav-btn')) return;
      openMovieDetailModal({
        id: series.id,
        title: series.title,
        genre: series.type,
        rating: series.rating,
        year: series.year,
        platform: series.platform,
        language: 'Multi-Audio'
      });
    });

    const favBtn = card.querySelector('.movie-fav-btn');
    favBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleWatchlistMovie({
        id: series.id,
        title: series.title,
        genre: series.type,
        rating: series.rating,
        year: series.year,
        platform: series.platform,
        language: 'Multi-Audio'
      });
    });

    grid.appendChild(card);
  });
}

// Watchlist Dedicated Page View
function renderWatchlistPageView() {
  const guestCallout = document.getElementById('watchlistGuestCallout');
  const userView = document.getElementById('watchlistUserView');
  const grid = document.getElementById('watchlistPageViewGrid');
  const heading = document.getElementById('watchlistPageHeading');
  const sub = document.getElementById('watchlistPageSub');

  if (!appState.isLoggedIn) {
    if (guestCallout) guestCallout.style.display = 'block';
    if (userView) userView.style.display = 'none';
    return;
  }

  if (guestCallout) guestCallout.style.display = 'none';
  if (userView) userView.style.display = 'block';

  if (heading) heading.textContent = `${appState.currentUser}'s Curated Watchlist`;
  if (sub) sub.textContent = `${appState.watchlist.length} saved titles • Synced with Memento pattern Undo`;

  if (!grid) return;
  grid.innerHTML = '';

  if (appState.watchlist.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align:center; padding: 50px 20px; color:var(--text-muted);">
        <div style="font-size:36px;margin-bottom:10px;">📋</div>
        <p style="font-size:16px;color:#fff;font-weight:600;margin-bottom:6px;">Your Watchlist is empty</p>
        <p style="font-size:13px;margin-bottom:18px;">Click the bookmark icon on any movie or web series to save it to your personal watchlist.</p>
        <button class="btn-primary" onclick="switchView('movies')" style="margin:0 auto;padding:8px 20px;font-size:13px;">Explore Movies</button>
      </div>
    `;
    return;
  }

  appState.watchlist.forEach(movie => {
    grid.appendChild(createMovieCardElement(movie));
  });
}

// Account View Dashboard Updater
function updateAccountUI() {
  const guestView = document.getElementById('accountGuestView');
  const userView = document.getElementById('accountUserView');

  if (!appState.isLoggedIn || !appState.currentUser) {
    if (guestView) guestView.style.display = 'block';
    if (userView) userView.style.display = 'none';
    return;
  }

  if (guestView) guestView.style.display = 'none';
  if (userView) userView.style.display = 'block';

  const nameEl = document.getElementById('accDashboardName');
  if (nameEl) nameEl.textContent = appState.currentUser;

  const emailEl = document.getElementById('accDashboardEmail');
  if (emailEl) {
    emailEl.textContent = appState.currentRole === 'ADMIN' 
      ? 'admin@gmail.com' 
      : (localStorage.getItem('cp_timn_email') || `${appState.currentUser.toLowerCase()}@cinepattern.com`);
  }

  const roleBadge = document.getElementById('accDashboardRoleBadge');
  const permText = document.getElementById('accPermissionText');
  const permSub = document.getElementById('accPermissionSub');
  const adminPanel = document.getElementById('accAdminControlPanel');

  if (appState.currentRole === 'ADMIN') {
    if (roleBadge) {
      roleBadge.textContent = '🛡️ ADMINISTRATOR';
      roleBadge.style.background = '#8b5cf6';
      roleBadge.style.color = '#fff';
    }
    if (permText) permText.textContent = 'Administrator (Full Access)';
    if (permSub) permSub.textContent = 'MovieServiceProxy granted catalog modifications';
    if (adminPanel) adminPanel.style.display = 'block';
  } else {
    if (roleBadge) {
      roleBadge.textContent = '👤 REGULAR USER';
      roleBadge.style.background = 'rgba(56, 189, 248, 0.15)';
      roleBadge.style.color = 'var(--accent-cyan)';
    }
    if (permText) permText.textContent = 'Standard Member';
    if (permSub) permSub.textContent = 'Watchlist curation & streaming';
    if (adminPanel) adminPanel.style.display = 'none';
  }

  const countEl = document.getElementById('accWatchlistCount');
  if (countEl) countEl.textContent = appState.watchlist.length;
}

// Central View Switcher
function switchView(viewName, pushHistory = true) {
  if (!appState.movies || appState.movies.length === 0) {
    loadMoviesFromBackend();
  }
  if (pushHistory) {
    if (!appState.historyStack) appState.historyStack = ['home'];
    if (appState.historyStack[appState.historyStack.length - 1] !== viewName) {
      appState.historyStack.push(viewName);
      appState.historyIndex = appState.historyStack.length - 1;
    }
  }
  appState.currentView = viewName;

  // Update sidebar active classes
  const navMap = {
    home: 'navItemHome',
    search: 'navItemSearch',
    movies: 'navItemMovies',
    webseries: 'navItemWebSeries',
    watchlist: 'navItemWatchlist',
    account: 'navItemAccount'
  };

  document.querySelectorAll('.nav-menu .nav-item').forEach(el => el.classList.remove('active'));
  const activeNavItem = document.getElementById(navMap[viewName]);
  if (activeNavItem) activeNavItem.classList.add('active');

  // Hide all view panels and show targeted panel
  const panels = {
    home: 'viewHome',
    search: 'viewSearch',
    movies: 'viewMovies',
    webseries: 'viewWebSeries',
    watchlist: 'viewWatchlist',
    account: 'viewAccount'
  };

  Object.values(panels).forEach(panelId => {
    const el = document.getElementById(panelId);
    if (el) {
      el.style.display = 'none';
      el.classList.remove('active');
    }
  });

  const activePanel = document.getElementById(panels[viewName]);
  if (activePanel) {
    activePanel.style.display = 'block';
    activePanel.classList.add('active');
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Specific view lifecycle callbacks
  if (viewName === 'home') {
    renderLatestMovies();
    renderTop10Movies();
  } else if (viewName === 'search') {
    renderSearchResults();
    const input = document.getElementById('dedicatedSearchInput');
    if (input) setTimeout(() => input.focus(), 100);
  } else if (viewName === 'movies') {
    renderTrendingMovies();
    applyClientFilters();
  } else if (viewName === 'webseries') {
    renderWebSeries(appState.activeSeriesType || 'all');
  } else if (viewName === 'watchlist') {
    if (!appState.isLoggedIn) {
      openAuthModal('Please sign in or register to view and manage your personal Watchlist.');
    }
    renderWatchlistPageView();
  } else if (viewName === 'account') {
    updateAccountUI();
  }
}

function updateWatchlistUI() {
  document.getElementById('sidebarWatchlistBadge').textContent = appState.watchlist.length;
  
  const container = document.getElementById('watchlistItemsContainer');
  container.innerHTML = '';

  if (appState.watchlist.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:40px 10px;color:var(--text-muted);">
        <p style="font-size:14px;margin-bottom:8px;">Your Watchlist is empty.</p>
        <p style="font-size:12px;">Click the bookmark on any movie to save it here!</p>
      </div>
    `;
    return;
  }

  appState.watchlist.forEach(movie => {
    const assets = getMovieAssets(movie.title);
    const item = document.createElement('div');
    item.style.cssText = `
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px;
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      transition: var(--transition);
      cursor: pointer;
    `;
    item.innerHTML = `
      <img src="${assets.poster}" alt="${movie.title}" style="width:44px;height:58px;border-radius:6px;object-fit:cover;">
      <div style="flex:1;min-width:0;">
        <div style="font-size:13.5px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${movie.title}</div>
        <div style="font-size:11px;color:var(--text-muted);">${movie.genre} • ${movie.year} • ★ ${movie.rating}</div>
      </div>
      <button class="modal-close-btn" style="color:#ef4444;" title="Remove">&times;</button>
    `;

    item.querySelector('.modal-close-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleWatchlistMovie(movie);
    });

    item.addEventListener('click', () => {
      closeAllDrawers();
      openMovieDetailModal(movie);
    });

    container.appendChild(item);
  });

  // Re-render catalog bookmark highlights
  renderCatalogGrid();
}

function renderNotifications() {
  const container = document.getElementById('notifListContainer');
  const dot = document.getElementById('topNotifDot');
  
  dot.style.display = appState.notifications.length > 0 ? 'block' : 'none';
  container.innerHTML = '';

  if (appState.notifications.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:40px 10px;color:var(--text-muted);">
        <p style="font-size:13px;">No new notifications from ObserverService.</p>
      </div>
    `;
    return;
  }

  // Display newest first
  const reversed = [...appState.notifications].reverse();
  reversed.forEach(n => {
    const card = document.createElement('div');
    card.style.cssText = `
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border-subtle);
      border-left: 3px solid var(--primary);
      border-radius: var(--radius-sm);
      padding: 12px;
      font-size: 12.5px;
      line-height: 1.45;
      color: rgba(255,255,255,0.9);
    `;
    card.textContent = n;
    container.appendChild(card);
  });
}

// Movie Detail & Player Modal
function openMovieDetailModal(movie) {
  appState.selectedMovieForModal = movie;
  const assets = getMovieAssets(movie.title);

  document.getElementById('modalMovieTitle').textContent = movie.title;
  document.getElementById('modalMovieName').textContent = movie.title;
  document.getElementById('modalBackdrop').src = assets.backdrop || assets.poster;
  document.getElementById('modalPoster').src = assets.poster;
  document.getElementById('modalRatingBadge').textContent = `★ ${movie.rating.toFixed(1)}`;
  document.getElementById('modalLanguage').textContent = movie.language || 'English';
  document.getElementById('modalYear').textContent = movie.year || '2024';
  
  const ottTag = document.getElementById('modalOttTag');
  ottTag.textContent = movie.platform || 'Netflix';
  ottTag.className = `ott-badge-tag ${(movie.platform || '').toLowerCase().replace(/[^a-z]/g, '')}`;

  document.getElementById('modalSynopsis').textContent = assets.synopsis;

  const isSaved = appState.isLoggedIn && appState.watchlist.some(w => w.id === movie.id || w.title === movie.title);
  const toggleBtn = document.getElementById('modalWatchlistToggleBtn');
  toggleBtn.querySelector('span').textContent = isSaved ? '✓ In Watchlist' : '+ Add to Watchlist';

  document.getElementById('movieDetailModal').classList.add('active');
}

// Switch Hero Banner Movie
function switchHeroMovie(title, backdropUrl) {
  appState.featuredHeroMovie = title;
  const backdrop = document.getElementById('heroBackdropImg');
  
  backdrop.style.opacity = '0';
  setTimeout(() => {
    backdrop.src = backdropUrl;
    backdrop.style.opacity = '1';

    if (title === 'Elio') {
      document.getElementById('heroStudioText').textContent = 'Disney • PIXAR';
      document.getElementById('heroTitleText').innerHTML = 'ELI<span class="glow-o">O</span>';
      document.getElementById('heroImdbBadge').textContent = '★ 7.9';
      document.getElementById('heroLangText').textContent = '🇺🇸 English';
      document.getElementById('heroDurationGenre').textContent = '1h 45m • Sci-Fi, Adventure';
    } else if (title === 'Spider Man') {
      document.getElementById('heroStudioText').textContent = 'MARVEL STUDIOS • SONY';
      document.getElementById('heroTitleText').innerHTML = 'SPIDER-MAN';
      document.getElementById('heroImdbBadge').textContent = '★ 8.2';
      document.getElementById('heroLangText').textContent = '🇺🇸 English';
      document.getElementById('heroDurationGenre').textContent = '2h 28m • Action, Fantasy';
    } else if (title === 'Mortal Engines') {
      document.getElementById('heroStudioText').textContent = 'UNIVERSAL PICTURES';
      document.getElementById('heroTitleText').innerHTML = 'MORTAL ENGINES';
      document.getElementById('heroImdbBadge').textContent = '★ 6.1';
      document.getElementById('heroLangText').textContent = '🇺🇸 English';
      document.getElementById('heroDurationGenre').textContent = '2h 8m • Sci-Fi, Suspense';
    }
  }, 200);
}

// Toast Notifications with optional Undo button
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  
  let html = `<span>${message}</span>`;
  if (type === 'undo') {
    html += `<button class="btn-primary" style="padding:4px 10px;font-size:11px;" id="toastUndoBtn">Undo (Memento)</button>`;
  }
  toast.innerHTML = html;

  if (type === 'undo') {
    const btn = toast.querySelector('#toastUndoBtn');
    if (btn) {
      btn.addEventListener('click', () => {
        triggerMementoUndo();
        toast.remove();
      });
    }
  }

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 4500);
}

// Close Modals & Drawers
function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
}

function closeAllDrawers() {
  document.querySelectorAll('.drawer').forEach(d => d.classList.remove('open'));
}

// ============================================================================
// AUTHENTICATION & ADMIN PORTAL HANDLERS
// ============================================================================
async function handleLocalSignIn(e) {
  e.preventDefault();
  const identifier = document.getElementById('loginEmailInput').value.trim();
  const password = document.getElementById('loginPasswordInput').value.trim();

  if (!identifier || !password) {
    showToast('Please enter both Email/Username and Password.');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'login',
        name: identifier,
        email: identifier.includes('@') ? identifier : '',
        password: password
      })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      completeLoginSuccess(data);
    } else {
      showToast(data.message || 'Login failed. Please check credentials.');
    }
  } catch (err) {
    showToast(`Network error during login: ${err.message}`);
  }
}

async function handleLocalRegister(e) {
  e.preventDefault();
  const name = document.getElementById('regNameInput').value.trim();
  const email = document.getElementById('regEmailInput').value.trim();
  const password = document.getElementById('regPasswordInput').value.trim();

  if (!name || !email || !password) {
    showToast('Please fill in all registration fields.');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'register',
        name: name,
        email: email,
        password: password,
        role: 'USER' // Non-admin users are strictly role USER
      })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      completeLoginSuccess(data);
    } else {
      showToast(data.message || 'Registration failed.');
    }
  } catch (err) {
    showToast(`Network error: ${err.message}`);
  }
}

function completeLoginSuccess(data) {
  appState.currentUser = data.name;
  appState.currentRole = data.role;
  appState.isLoggedIn = true;

  localStorage.setItem('cp_timn_user', data.name);
  localStorage.setItem('cp_timn_role', data.role);
  localStorage.setItem('cp_timn_session_active', 'true');

  initUserSession();
  loadWatchlistFromBackend();
  loadNotificationsFromBackend();

  const authModal = document.getElementById('authModal');
  if (authModal) authModal.classList.remove('active');

  showToast(`✓ Welcome, ${data.name}! Logged in with ${data.role} permissions.`);

  if (appState.pendingWatchlistMovie) {
    const pending = appState.pendingWatchlistMovie;
    appState.pendingWatchlistMovie = null;
    toggleWatchlistMovie(pending);
  }
}

const handleSuccessfulLogin = completeLoginSuccess;
const triggerSupabaseReportUpload = () => {
  if (typeof uploadReportToSupabase === 'function') uploadReportToSupabase();
};

function handleLogOut() {
  appState.currentUser = null;
  appState.currentRole = null;
  appState.isLoggedIn = false;
  appState.watchlist = [];
  appState.pendingWatchlistMovie = null;

  localStorage.removeItem('cp_timn_user');
  localStorage.removeItem('cp_timn_role');
  localStorage.removeItem('cp_timn_session_active');

  initUserSession();
  updateWatchlistUI();
  closeAllModals();
  closeAllDrawers();
  switchView('home');
  showToast('Logged out. You are now exploring TiMN as a Guest.');
}

async function handleAdminCatalogFormSubmit(e) {
  e.preventDefault();
  if (appState.currentRole !== 'ADMIN') {
    showToast('🚫 Protection Proxy: Access Denied! Only ADMIN can add movies.');
    return;
  }

  const title = document.getElementById('admTitle').value.trim();
  const genre = document.getElementById('admGenre').value.trim();
  const language = document.getElementById('admLanguage').value.trim();
  const rating = parseFloat(document.getElementById('admRating').value) || 8.0;
  const year = parseInt(document.getElementById('admYear').value) || 2024;
  const platform = document.getElementById('admPlatform').value.trim();
  const poster = document.getElementById('admPoster').value.trim();
  const synopsis = document.getElementById('admSynopsis').value.trim();

  if (!title) {
    showToast('Please enter a movie title.');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/movies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Role': 'ADMIN',
        'X-User-Name': appState.currentUser || 'Admin'
      },
      body: JSON.stringify({
        title,
        genre,
        language,
        rating,
        year,
        platform
      })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      if (poster || synopsis) {
        MOVIE_IMAGE_ASSETS[title] = {
          poster: poster || 'images/rampage_poster.jpg',
          backdrop: poster || 'images/rampage_backdrop.jpg',
          synopsis: synopsis || `${title} streaming now on ${platform}.`
        };
      }
      showToast(`🎬 Admin published "${title}" to website database via MovieFactory!`);
      const modal = document.getElementById('adminAddMovieModal');
      if (modal) modal.classList.remove('active');
      const form = document.getElementById('adminCatalogForm');
      if (form) form.reset();
      loadMoviesFromBackend();
      loadNotificationsFromBackend();
    } else {
      showToast(data.message || 'Failed to add movie to catalog.');
    }
  } catch (err) {
    showToast(`Error adding movie: ${err.message}`);
  }
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================
function setupEventListeners() {
  // Brand Logo Click: Go to Home
  document.getElementById('brandHomeBtn').addEventListener('click', () => {
    switchView('home');
  });

  // 6 Primary Left Navbar Items
  const navMap = [
    { id: 'navItemHome', view: 'home' },
    { id: 'navItemSearch', view: 'search' },
    { id: 'navItemMovies', view: 'movies' },
    { id: 'navItemWebSeries', view: 'webseries' },
    { id: 'navItemWatchlist', view: 'watchlist' },
    { id: 'navItemAccount', view: 'account' }
  ];

  navMap.forEach(item => {
    const el = document.getElementById(item.id);
    if (el) {
      el.addEventListener('click', () => switchView(item.view));
    }
  });

  // Top Nav Search Input: Seamlessly transitions to Search Page
  const globalSearchInput = document.getElementById('globalSearchInput');
  if (globalSearchInput) {
    globalSearchInput.addEventListener('focus', () => {
      switchView('search');
    });
    globalSearchInput.addEventListener('input', () => {
      if (appState.currentView !== 'search') switchView('search');
      const dedicatedInput = document.getElementById('dedicatedSearchInput');
      if (dedicatedInput) dedicatedInput.value = globalSearchInput.value;
      renderSearchResults();
    });
  }

  // Explore all button on Home Page
  const seeAllLatestBtn = document.getElementById('seeAllLatestBtn');
  if (seeAllLatestBtn) {
    seeAllLatestBtn.addEventListener('click', () => switchView('movies'));
  }

  // Movie Categories Chips Bar on Movies View
  document.querySelectorAll('#movieCategoriesBar .category-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#movieCategoriesBar .category-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const cat = chip.getAttribute('data-category');
      appState.activeGenreFilter = (cat === 'all') ? null : cat;
      const globalInput = document.getElementById('globalSearchInput');
      if (globalInput) globalInput.value = '';
      applyClientFilters();
      showToast(cat === 'all' ? 'Showing All Movie Categories' : `Filtered by Category: ${cat}`);
    });
  });

  // Web Series Types Chips Bar on Web Series View
  document.querySelectorAll('#seriesTypesBar .category-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#seriesTypesBar .category-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const type = chip.getAttribute('data-type');
      renderWebSeries(type);
      showToast(type === 'all' ? 'Showing All Web Series & Anime' : `Filtered Series: ${type}`);
    });
  });

  // Dedicated Search Page Input & Clear
  const dedicatedSearchInput = document.getElementById('dedicatedSearchInput');
  if (dedicatedSearchInput) {
    dedicatedSearchInput.addEventListener('input', renderSearchResults);
  }

  const clearSearchBtn = document.getElementById('clearSearchBtn');
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      if (dedicatedSearchInput) dedicatedSearchInput.value = '';
      if (globalSearchInput) globalSearchInput.value = '';
      renderSearchResults();
    });
  }

  // Search Trending Chips
  document.querySelectorAll('.trending-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const q = chip.getAttribute('data-query');
      if (dedicatedSearchInput) dedicatedSearchInput.value = q;
      document.querySelectorAll('#searchFilterPills .filter-pill').forEach(p => p.classList.remove('active'));
      const allPill = document.querySelector('#searchFilterPills .filter-pill[data-val="all"]');
      if (allPill) allPill.classList.add('active');
      appState.searchPlatformFilter = 'all';
      appState.searchGenreFilter = 'all';
      renderSearchResults();
    });
  });

  // Search Filter Pills
  document.querySelectorAll('#searchFilterPills .filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const filterType = pill.getAttribute('data-filter');
      const val = pill.getAttribute('data-val');

      pill.parentElement.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      if (val === 'all') {
        appState.searchPlatformFilter = 'all';
        appState.searchGenreFilter = 'all';
      } else if (filterType === 'platform') {
        appState.searchPlatformFilter = val;
        appState.searchGenreFilter = 'all';
      } else if (filterType === 'genre') {
        appState.searchGenreFilter = val;
        appState.searchPlatformFilter = 'all';
      }
      renderSearchResults();
    });
  });

  // Watchlist Page Action Buttons
  const watchlistPageLoginBtn = document.getElementById('watchlistPageLoginBtn');
  if (watchlistPageLoginBtn) {
    watchlistPageLoginBtn.addEventListener('click', () => {
      openAuthModal('Sign in to manage and curate your personal Watchlist.');
    });
  }

  const pageMementoUndoBtn = document.getElementById('pageMementoUndoBtn');
  if (pageMementoUndoBtn) {
    pageMementoUndoBtn.addEventListener('click', triggerMementoUndo);
  }

  const pageExportJsonBtn = document.getElementById('pageExportJsonBtn');
  if (pageExportJsonBtn) {
    pageExportJsonBtn.addEventListener('click', () => exportWatchlistReport('json'));
  }

  const pageExportTxtBtn = document.getElementById('pageExportTxtBtn');
  if (pageExportTxtBtn) {
    pageExportTxtBtn.addEventListener('click', () => exportWatchlistReport('text'));
  }

  const pageSupabaseSyncBtn = document.getElementById('pageSupabaseSyncBtn');
  if (pageSupabaseSyncBtn) {
    pageSupabaseSyncBtn.addEventListener('click', () => {
      uploadReportToSupabase();
    });
  }

  // Account Page Action Buttons
  const accountPageSignInBtn = document.getElementById('accountPageSignInBtn');
  if (accountPageSignInBtn) {
    accountPageSignInBtn.addEventListener('click', () => {
      openAuthModal('Sign in to access your account dashboard.');
    });
  }


  const accountPageLogoutBtn = document.getElementById('accountPageLogoutBtn');
  if (accountPageLogoutBtn) {
    accountPageLogoutBtn.addEventListener('click', () => {
      handleLogOut();
      switchView('home');
    });
  }

  const accOpenAddMovieModalBtn = document.getElementById('accOpenAddMovieModalBtn');
  if (accOpenAddMovieModalBtn) {
    accOpenAddMovieModalBtn.addEventListener('click', () => {
      if (appState.currentRole !== 'ADMIN') {
        showToast('Access Denied: Only ADMIN can publish movies to catalog.');
        return;
      }
      document.getElementById('adminAddMovieModal').classList.add('active');
    });
  }

  const accBroadcastBtn = document.getElementById('accBroadcastBtn');
  if (accBroadcastBtn) {
    accBroadcastBtn.addEventListener('click', async () => {
      const input = document.getElementById('accBroadcastInput');
      const message = input.value.trim();
      if (!message) return;
      try {
        const res = await fetch(`${API_BASE}/api/notify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Role': appState.currentRole,
            'X-User-Name': appState.currentUser
          },
          body: JSON.stringify({ message })
        });
        if (res.ok) {
          showToast(`📢 Announcement broadcasted to all observers!`);
          input.value = '';
          loadNotificationsFromBackend();
        } else {
          showToast('Failed to broadcast');
        }
      } catch (e) {
        showToast('Broadcast error');
      }
    });
  }

  const accGoToWatchlistBtn = document.getElementById('accGoToWatchlistBtn');
  if (accGoToWatchlistBtn) {
    accGoToWatchlistBtn.addEventListener('click', () => switchView('watchlist'));
  }

  const accBrowseMoviesBtn = document.getElementById('accBrowseMoviesBtn');
  if (accBrowseMoviesBtn) {
    accBrowseMoviesBtn.addEventListener('click', () => switchView('movies'));
  }

  const accOpenSupabaseModalBtn = document.getElementById('accOpenSupabaseModalBtn');
  if (accOpenSupabaseModalBtn) {
    accOpenSupabaseModalBtn.addEventListener('click', () => {
      document.getElementById('supabaseCloudModal').classList.add('active');
      loadSupabaseStorageFiles();
    });
  }

  // GoF Design Patterns Section Buttons (At End of Page)
  const openFullPatternsModalBtn = document.getElementById('openFullPatternsModalBtn');
  if (openFullPatternsModalBtn) {
    openFullPatternsModalBtn.addEventListener('click', () => {
      document.getElementById('patternsModal').classList.add('active');
    });
  }

  const gofObserverBtn = document.getElementById('gofObserverBtn');
  if (gofObserverBtn) {
    gofObserverBtn.addEventListener('click', () => {
      document.getElementById('notificationsDrawer').classList.add('open');
    });
  }

  const gofProxyBtn = document.getElementById('gofProxyBtn');
  if (gofProxyBtn) {
    gofProxyBtn.addEventListener('click', () => {
      document.getElementById('userProfileModal').classList.add('active');
    });
  }

  const gofChainBtn = document.getElementById('gofChainBtn');
  if (gofChainBtn) {
    gofChainBtn.addEventListener('click', () => {
      document.getElementById('filterModal').classList.add('active');
    });
  }

  const gofStrategyBtn = document.getElementById('gofStrategyBtn');
  if (gofStrategyBtn) {
    gofStrategyBtn.addEventListener('click', () => {
      switchView('movies');
      setTimeout(() => {
        const select = document.getElementById('sortStrategySelect');
        if (select) select.focus();
      }, 300);
    });
  }

  const gofTemplateBtn = document.getElementById('gofTemplateBtn');
  if (gofTemplateBtn) {
    gofTemplateBtn.addEventListener('click', () => exportWatchlistReport('json'));
  }

  const gofMementoBtn = document.getElementById('gofMementoBtn');
  if (gofMementoBtn) {
    gofMementoBtn.addEventListener('click', triggerMementoUndo);
  }

  // Secondary Sidebar Links
  document.getElementById('navPartiesLink').addEventListener('click', () => {
    switchView('home');
    setTimeout(() => {
      document.getElementById('partiesSection').scrollIntoView({ behavior: 'smooth' });
    }, 200);
  });

  document.getElementById('navPatternsBtn').addEventListener('click', () => {
    document.getElementById('patternsModal').classList.add('active');
  });

  // Top Nav Back / Forward History Controls
  const histBackBtn = document.getElementById('histBackBtn');
  if (histBackBtn) {
    histBackBtn.addEventListener('click', () => {
      if (appState.historyIndex > 0) {
        appState.historyIndex--;
        switchView(appState.historyStack[appState.historyIndex], false);
      } else {
        switchView('home', false);
      }
    });
  }

  const histForwardBtn = document.getElementById('histForwardBtn');
  if (histForwardBtn) {
    histForwardBtn.addEventListener('click', () => {
      if (appState.historyIndex < appState.historyStack.length - 1) {
        appState.historyIndex++;
        switchView(appState.historyStack[appState.historyIndex], false);
      }
    });
  }

  // Role Badge & User profile modal
  document.getElementById('roleBadgeBtn').addEventListener('click', () => {
    document.getElementById('userProfileModal').classList.add('active');
  });

  document.getElementById('topProfileAvatarBtn').addEventListener('click', () => {
    document.getElementById('userProfileModal').classList.add('active');
  });

  // Auth & Logout Controls
  const topNavSignInBtn = document.getElementById('topNavSignInBtn');
  if (topNavSignInBtn) {
    topNavSignInBtn.addEventListener('click', () => {
      openAuthModal('Sign in to access your Watchlist and stream movies.');
    });
  }

  const sidebarAuthBtn = document.getElementById('sidebarAuthBtn');
  if (sidebarAuthBtn) {
    sidebarAuthBtn.addEventListener('click', () => {
      openAuthModal('Sign in or create an account to curate your Watchlist.');
    });
  }

  const topNavLogoutBtn = document.getElementById('topNavLogoutBtn');
  if (topNavLogoutBtn) {
    topNavLogoutBtn.addEventListener('click', handleLogOut);
  }

  const logoutSidebarBtn = document.getElementById('logoutSidebarBtn');
  if (logoutSidebarBtn) {
    logoutSidebarBtn.addEventListener('click', handleLogOut);
  }

  // Admin "+ Add Movie" button in top nav
  const topNavAddMovieBtn = document.getElementById('topNavAddMovieBtn');
  if (topNavAddMovieBtn) {
    topNavAddMovieBtn.addEventListener('click', () => {
      if (appState.currentRole !== 'ADMIN') {
        showToast('Access Denied: Only ADMIN can publish movies to catalog.');
        return;
      }
      document.getElementById('adminAddMovieModal').classList.add('active');
    });
  }

  // Auth Modal Tab Buttons
  const tabSignInBtn = document.getElementById('tabSignInBtn');
  const tabRegisterBtn = document.getElementById('tabRegisterBtn');
  const signInForm = document.getElementById('signInForm');
  const registerForm = document.getElementById('registerForm');
  const authModalTitle = document.getElementById('authModalTitle');

  if (tabSignInBtn && tabRegisterBtn) {
    tabSignInBtn.addEventListener('click', () => {
      tabSignInBtn.classList.add('active');
      tabRegisterBtn.classList.remove('active');
      if (signInForm) signInForm.style.display = 'flex';
      if (registerForm) registerForm.style.display = 'none';
      if (authModalTitle) authModalTitle.textContent = 'Login to TiMN';
    });

    tabRegisterBtn.addEventListener('click', () => {
      tabRegisterBtn.classList.add('active');
      tabSignInBtn.classList.remove('active');
      if (signInForm) signInForm.style.display = 'none';
      if (registerForm) registerForm.style.display = 'flex';
      if (authModalTitle) authModalTitle.textContent = 'Register to TiMN';
    });
  }


  // Sign In / Register Form submissions
  if (signInForm) {
    signInForm.addEventListener('submit', handleLocalSignIn);
  }
  if (registerForm) {
    registerForm.addEventListener('submit', handleLocalRegister);
  }

  // Admin Catalog Form submission
  const adminCatalogForm = document.getElementById('adminCatalogForm');
  if (adminCatalogForm) {
    adminCatalogForm.addEventListener('submit', handleAdminCatalogFormSubmit);
  }

  // Close Auth & Admin Modals
  const closeAuthModalBtn = document.getElementById('closeAuthModalBtn');
  if (closeAuthModalBtn) {
    closeAuthModalBtn.addEventListener('click', () => {
      document.getElementById('authModal').classList.remove('active');
    });
  }

  const closeAdminAddMovieModalBtn = document.getElementById('closeAdminAddMovieModalBtn');
  if (closeAdminAddMovieModalBtn) {
    closeAdminAddMovieModalBtn.addEventListener('click', () => {
      document.getElementById('adminAddMovieModal').classList.remove('active');
    });
  }

  // Switch Users in Profile Modal (Proxy Pattern test)
  document.getElementById('switchAryanBtn').addEventListener('click', () => {
    appState.currentUser = 'Aryan';
    appState.currentRole = 'USER';
    appState.isLoggedIn = true;
    localStorage.setItem('cp_timn_user', 'Aryan');
    localStorage.setItem('cp_timn_role', 'USER');
    initUserSession();
    loadWatchlistFromBackend();
    loadNotificationsFromBackend();
    showToast('Switched to Aryan (Role: USER)');
  });

  document.getElementById('switchKaranAdminBtn').addEventListener('click', () => {
    appState.currentUser = 'Admin';
    appState.currentRole = 'ADMIN';
    appState.isLoggedIn = true;
    localStorage.setItem('cp_timn_user', 'Admin');
    localStorage.setItem('cp_timn_role', 'ADMIN');
    initUserSession();
    loadWatchlistFromBackend();
    loadNotificationsFromBackend();
    showToast('Switched to Admin (Role: ADMIN - Proxy Access Unlocked)');
  });

  // Add Movie Form Submit in Profile Modal (Proxy Test)
  document.getElementById('addMovieForm').addEventListener('submit', handleAddMovieSubmit);

  // Search Bar input
  document.getElementById('globalSearchInput').addEventListener('input', applyClientFilters);

  // Filter Tune Button (Chain of Responsibility)
  document.getElementById('filterTuneBtn').addEventListener('click', () => {
    document.getElementById('filterModal').classList.add('active');
  });

  // Apply Chain Filter Button
  document.getElementById('applyChainFilterBtn').addEventListener('click', runChainFilterPipeline);

  // Range Slider in Pipeline
  document.getElementById('recMinRating').addEventListener('input', (e) => {
    document.getElementById('pipeCountRating').textContent = `Min Rating: ${parseFloat(e.target.value).toFixed(1)}`;
  });

  // Top Nav Notification Bell
  document.getElementById('topNotifBellBtn').addEventListener('click', () => {
    document.getElementById('notificationsDrawer').classList.add('open');
  });

  // Top Nav Report Export (Template Method)
  document.getElementById('exportReportBtn').addEventListener('click', () => {
    exportWatchlistReport('html');
  });

  // Watchlist Drawer buttons
  document.getElementById('mementoUndoBtn').addEventListener('click', triggerMementoUndo);
  document.getElementById('watchlistExportTriggerBtn').addEventListener('click', () => {
    exportWatchlistReport('html');
  });

  // Admin Broadcast Send
  document.getElementById('broadcastSendBtn').addEventListener('click', sendAdminBroadcast);

  // Close Buttons for Modals & Drawers
  const modalCloseBtns = [
    'closeAuthModalBtn',
    'closeAdminAddMovieModalBtn',
    'closeDetailModalBtn',
    'closeFilterModalBtn',
    'closePatternsModalBtn',
    'closeUserModalBtn',
    'closeSupabaseModalBtn',
    'closeWatchlistDrawerBtn',
    'closeNotifDrawerBtn'
  ];
  modalCloseBtns.forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const parentModal = btn.closest('.modal-overlay');
        if (parentModal) parentModal.classList.remove('active');
        const parentDrawer = btn.closest('.drawer');
        if (parentDrawer) parentDrawer.classList.remove('open');
        closeAllModals();
      });
    }
  });

  // Universal close for ANY .modal-close-btn
  document.querySelectorAll('.modal-close-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const parentModal = btn.closest('.modal-overlay');
      if (parentModal) parentModal.classList.remove('active');
      const parentDrawer = btn.closest('.drawer');
      if (parentDrawer) parentDrawer.classList.remove('open');
      closeAllModals();
    });
  });

  // Global escape key to close active modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllModals();
      closeAllDrawers();
    }
  });

  // Close on outside click
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeAllModals();
    });
  });

  // Hero Watch Button
  document.getElementById('heroWatchBtn').addEventListener('click', () => {
    const elio = appState.movies.find(m => m.title.toLowerCase().includes(appState.featuredHeroMovie.toLowerCase())) || {
      id: 29,
      title: appState.featuredHeroMovie,
      rating: 7.9,
      genre: 'Sci-Fi',
      language: 'English',
      year: 2025,
      platform: 'Disney+'
    };
    openMovieDetailModal(elio);
  });

  // Hero Mini Carousel Cards
  const miniCards = document.querySelectorAll('.mini-thumb-card');
  miniCards.forEach(card => {
    card.addEventListener('click', () => {
      miniCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const title = card.getAttribute('data-title');
      const hero = card.getAttribute('data-hero');
      switchHeroMovie(title, hero);
    });
  });

  // Hero Carousel Prev / Next
  let miniIdx = 0;
  document.getElementById('heroCarouselNext').addEventListener('click', () => {
    miniIdx = (miniIdx + 1) % miniCards.length;
    miniCards[miniIdx].click();
  });
  document.getElementById('heroCarouselPrev').addEventListener('click', () => {
    miniIdx = (miniIdx - 1 + miniCards.length) % miniCards.length;
    miniCards[miniIdx].click();
  });

  // Parties Cards Selection
  document.querySelectorAll('.party-card').forEach(pCard => {
    pCard.addEventListener('click', () => {
      document.querySelectorAll('.party-card').forEach(c => c.classList.remove('selected'));
      pCard.classList.add('selected');
      const party = pCard.getAttribute('data-party');
      appState.selectedParty = party;
      showToast(`Joined party for "${party}" with ${pCard.querySelector('.party-count-text').textContent} friends!`);
    });
  });

  // Continue Watching Cards
  document.querySelectorAll('.continue-card').forEach(cCard => {
    cCard.addEventListener('click', () => {
      const mTitle = cCard.getAttribute('data-movie');
      const movie = appState.movies.find(m => m.title === mTitle) || {
        id: 999,
        title: mTitle,
        genre: 'Action',
        language: 'English',
        rating: 8.0,
        year: 2022,
        platform: 'Disney+'
      };
      openMovieDetailModal(movie);
    });
  });

  // Platform Filter Pills
  document.querySelectorAll('#platformFilterPills .filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('#platformFilterPills .filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const fType = pill.getAttribute('data-filter');
      const val = pill.getAttribute('data-val');

      if (fType === 'platform') {
        appState.activePlatformFilter = val;
        appState.activeGenreFilter = null;
      } else if (fType === 'genre') {
        appState.activePlatformFilter = 'all';
        appState.activeGenreFilter = val;
      }
      applyClientFilters();
    });
  });

  // Strategy Sorting Dropdown
  document.getElementById('sortStrategySelect').addEventListener('change', (e) => {
    appState.activeSortStrategy = e.target.value;
    loadMoviesFromBackend();
    showToast(`Sorted by ${e.target.options[e.target.selectedIndex].text}`);
  });

  // Modal Actions
  document.getElementById('modalWatchNowBtn').addEventListener('click', () => {
    if (!appState.selectedMovieForModal) return;
    showToast(`Streaming "${appState.selectedMovieForModal.title}" in 4K HDR...`);
  });

  document.getElementById('modalWatchlistToggleBtn').addEventListener('click', () => {
    if (!appState.selectedMovieForModal) return;
    toggleWatchlistMovie(appState.selectedMovieForModal);
    const isSaved = appState.watchlist.some(w => w.id === appState.selectedMovieForModal.id);
    document.getElementById('modalWatchlistToggleBtn').querySelector('span').textContent = isSaved ? '+ Add to Watchlist' : '✓ In Watchlist';
  });

  // Supabase Cloud Management Actions
  const sbStatusBtn = document.getElementById('supabaseStatusBtn');
  if (sbStatusBtn) {
    sbStatusBtn.addEventListener('click', () => {
      document.getElementById('supabaseCloudModal').classList.add('active');
      loadSupabaseStorageFiles();
    });
  }

  const closeSbModalBtn = document.getElementById('closeSupabaseModalBtn');
  if (closeSbModalBtn) {
    closeSbModalBtn.addEventListener('click', () => {
      document.getElementById('supabaseCloudModal').classList.remove('active');
    });
  }

  const refreshSbBtn = document.getElementById('refreshSupabaseFilesBtn');
  if (refreshSbBtn) {
    refreshSbBtn.addEventListener('click', loadSupabaseStorageFiles);
  }

  const uploadSbBtn = document.getElementById('uploadWatchlistToSupabaseBtn');
  if (uploadSbBtn) {
    uploadSbBtn.addEventListener('click', uploadReportToSupabase);
  }

  const sbSignInBtn = document.getElementById('sbSignInBtn');
  if (sbSignInBtn) {
    sbSignInBtn.addEventListener('click', handleSupabaseSignIn);
  }

  const sbSignUpBtn = document.getElementById('sbSignUpBtn');
  if (sbSignUpBtn) {
    sbSignUpBtn.addEventListener('click', handleSupabaseSignUp);
  }
}

// ============================================================================
// SUPABASE STORAGE & AUTH METHODS
// ============================================================================
async function loadSupabaseStorageFiles() {
  const container = document.getElementById('supabaseFilesList');
  if (!container) return;

  container.innerHTML = '<div style="font-size:12px;color:var(--text-muted);text-align:center;padding:12px;">Connecting to Supabase Storage (/invoices)...</div>';

  try {
    const res = await fetch(`${API_BASE}/api/supabase/invoices`);
    if (!res.ok) throw new Error('Failed to load bucket files');
    const files = await res.json();

    if (!Array.isArray(files) || files.length === 0) {
      container.innerHTML = '<div style="font-size:12px;color:var(--text-muted);text-align:center;padding:12px;">No files currently in bucket: invoices. Click "Upload Report" to upload one!</div>';
      return;
    }

    container.innerHTML = '';
    files.forEach(file => {
      const isFolder = !file.metadata && !file.id;
      const sizeStr = file.metadata && file.metadata.size ? (file.metadata.size / 1024).toFixed(1) + ' KB' : (isFolder ? 'Folder' : '');
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/${file.name}`;

      const item = document.createElement('div');
      item.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 12px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-sm);
        font-size: 12px;
      `;
      item.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px;min-width:0;">
          <span style="color:#34d399;">${isFolder ? '📁' : '📄'}</span>
          <span style="color:#fff;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${file.name}</span>
          ${sizeStr ? `<span style="color:var(--text-muted);font-size:11px;">(${sizeStr})</span>` : ''}
        </div>
        <div>
          ${!isFolder ? `<a href="${publicUrl}" target="_blank" style="color:var(--primary);text-decoration:none;font-weight:600;font-size:11.5px;padding:2px 8px;border-radius:4px;background:var(--primary-subtle);">View ↗</a>` : ''}
        </div>
      `;
      container.appendChild(item);
    });
  } catch (err) {
    container.innerHTML = `<div style="font-size:12px;color:#ef4444;text-align:center;padding:12px;">Could not load files: ${err.message}</div>`;
  }
}

async function uploadReportToSupabase() {
  if (!appState.currentUser) {
    showToast('Please sign in first to back up your watchlist to cloud storage.');
    openAuthModal();
    return;
  }
  try {
    showToast('Generating report via Template Method Pattern...');
    const reportRes = await fetch(`${API_BASE}/api/watchlist/export?username=${encodeURIComponent(appState.currentUser)}&format=html`);
    if (!reportRes.ok) throw new Error('Failed to generate report from backend');
    const reportData = await reportRes.json();
    const htmlContent = reportData.content || '';

    const filename = `Watchlist_${appState.currentUser}_${Date.now()}.html`;
    const res = await fetch(`${API_BASE}/api/supabase/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: filename,
        content: htmlContent
      })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      showToast(`☁️ Successfully uploaded "${filename}" to Supabase bucket 'invoices'!`);
      loadSupabaseStorageFiles();
      loadNotificationsFromBackend();
    } else {
      showToast(data.message || 'Supabase upload failed');
    }
  } catch (err) {
    showToast(`Upload error: ${err.message}`);
  }
}

async function handleSupabaseSignIn() {
  const email = document.getElementById('sbEmailInput').value.trim();
  const password = document.getElementById('sbPasswordInput').value.trim();
  if (!email || !password) {
    showToast('Please enter both email and password for Supabase');
    return;
  }

  try {
    let userName = email.split('@')[0];
    let userRole = 'USER';

    if (supabaseClient) {
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) {
        showToast(`Supabase Auth: ${error.message}`);
        return;
      }
      if (data && data.user) {
        userName = data.user.user_metadata?.full_name || userName;
        userRole = data.user.user_metadata?.role || userRole;
      }
    }

    // Sync with backend login session
    const res = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'login',
        name: userName,
        role: userRole,
        email: email,
        provider: 'supabase'
      })
    });

    appState.currentUser = userName;
    appState.currentRole = userRole;
    localStorage.setItem('cp_timn_user', userName);
    localStorage.setItem('cp_timn_role', userRole);

    initUserSession();
    loadWatchlistFromBackend();
    loadNotificationsFromBackend();

    showToast(`✓ Signed in via Supabase as ${userName} (${userRole})!`);
    document.getElementById('supabaseCloudModal').classList.remove('active');
  } catch (err) {
    showToast(`Sign in error: ${err.message}`);
  }
}

async function handleSupabaseSignUp() {
  const email = document.getElementById('sbEmailInput').value.trim();
  const password = document.getElementById('sbPasswordInput').value.trim();
  const name = document.getElementById('sbFullNameInput').value.trim() || email.split('@')[0];
  const role = document.getElementById('sbRoleSelect').value;

  if (!email || !password) {
    showToast('Please enter email and password to register in Supabase');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/auth/supabase-signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        name,
        role
      })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      showToast(`✓ Account created in Supabase! Logged in as ${name} (${role})`);
      appState.currentUser = name;
      appState.currentRole = role;
      localStorage.setItem('cp_timn_user', name);
      localStorage.setItem('cp_timn_role', role);

      initUserSession();
      loadWatchlistFromBackend();
      loadNotificationsFromBackend();

      document.getElementById('supabaseCloudModal').classList.remove('active');
    } else {
      showToast(data.message || 'Supabase registration failed');
    }
  } catch (err) {
    showToast(`Registration error: ${err.message}`);
  }
}
