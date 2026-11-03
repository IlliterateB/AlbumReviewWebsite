const albums = [
  {
    id: "care-for-me",
    rank: 1,
    title: "Care For Me",
    artist: "Saba",
    cover: "./covers/care-for-me.jpg",
    albumUrl: "https://www.deezer.com/album/614334032",
    songs: [
      { title: "BUSY/SIRENS", plays: 37303000, url: "https://www.deezer.com/track/2887227422" },
      { title: "LIFE", plays: 34808100, url: "https://www.deezer.com/track/2887227442" },
      { title: "PROM/KING", plays: 18784300, url: "https://www.deezer.com/track/2887227502" }
    ],
    bestSong: { title: "BUSY/SIRENS", plays: 37303000, url: "https://www.deezer.com/track/2887227422" },
    worstSong: { title: "GREY", plays: 14113200, url: "https://www.deezer.com/track/2887227492" },
    review:
      "Grief, Chicago, and melody sit side by side here — it is personal without ever losing its sense of rhythm, which is why it sits at number one."
  },
  {
    id: "marshall-mathers-lp",
    rank: 2,
    title: "The Marshall Mathers LP",
    artist: "Eminem",
    cover: "./covers/marshall-mathers-lp.jpg",
    albumUrl: "https://www.deezer.com/album/125748",
    songs: [
      { title: "The Real Slim Shady", plays: 64060100, url: "https://www.deezer.com/track/1176202" },
      { title: "Stan", plays: 53520800, url: "https://www.deezer.com/track/1176197" },
      { title: "The Way I Am", plays: 44149400, url: "https://www.deezer.com/track/1176201" }
    ],
    bestSong: { title: "The Real Slim Shady", plays: 64060100, url: "https://www.deezer.com/track/1176202" },
    worstSong: { title: "Ken Kaniff (Skit)", plays: 29360900, url: "https://www.deezer.com/track/1176206" },
    review:
      "The writing is still shocking, funny, and precise, and the sequencing keeps the whole record feeling like a character study rather than a pile of singles."
  },
  {
    id: "atliens",
    rank: 3,
    title: "ATLiens",
    artist: "OutKast",
    cover: "./covers/atliens.jpg",
    albumUrl: "https://www.deezer.com/album/113990",
    songs: [
      { title: "ATLiens", plays: 56319200, url: "https://www.deezer.com/track/1047823" },
      { title: "Elevators (Me & You)", plays: 39041500, url: "https://www.deezer.com/track/1043992" },
      { title: "Jazzy Belle", plays: 36965700, url: "https://www.deezer.com/track/1047827" }
    ],
    bestSong: { title: "ATLiens", plays: 56319200, url: "https://www.deezer.com/track/1047823" },
    worstSong: { title: "E.T. (Extraterrestrial)", plays: 23598600, url: "https://www.deezer.com/track/1044002" },
    review:
      "Spacey drums, Atlanta slang, and two voices that never sound the same twice — it still feels like a world you can step into."
  }
].sort((a, b) => a.rank - b.rank);

const storage = {
  get(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

const params = new URLSearchParams(window.location.search);
let currentIndex = Math.max(
  0,
  albums.findIndex((album) => album.id === (params.get("album") || albums[0].id))
);
if (currentIndex < 0) currentIndex = 0;

let currentAlbum = albums[currentIndex];
let isTransitioning = false;
let activeCanvas = "a";
let wheelLockUntil = 0;
let wheelAccumulator = 0;
const imageCache = new Map();

function seededRandom(seed) {
  let state = 0;
  for (let i = 0; i < seed.length; i += 1) {
    state = (state * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function averageLuminance(image) {
  const sample = document.createElement("canvas");
  const size = 32;
  sample.width = size;
  sample.height = size;
  const ctx = sample.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(image, 0, 0, size, size);
  const { data } = ctx.getImageData(0, 0, size, size);
  let total = 0;
  let count = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 180) continue;
    total += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    count += 1;
  }
  return count ? total / count : 140;
}

function applyReadableTheme(luminance) {
  document.body.classList.toggle("is-light-text", luminance < 118);
  document.body.classList.toggle("is-dark-text", luminance >= 118);
}

function paintBlobPath(ctx, rand, width, height) {
  const cx = rand() * width;
  const cy = rand() * height;
  const rx = width * (0.18 + rand() * 0.34);
  const ry = height * (0.16 + rand() * 0.3);
  const rotation = rand() * Math.PI * 2;
  ctx.beginPath();
  const steps = 7;
  for (let i = 0; i <= steps; i += 1) {
    const t = (i / steps) * Math.PI * 2;
    const wobble = 0.72 + rand() * 0.55;
    const x = cx + Math.cos(t + rotation) * rx * wobble;
    const y = cy + Math.sin(t + rotation) * ry * wobble;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function paintSwirlPath(ctx, rand, width, height) {
  const startX = rand() * width;
  const startY = rand() * height;
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  const loops = 2 + Math.floor(rand() * 3);
  for (let i = 0; i < loops; i += 1) {
    ctx.bezierCurveTo(
      rand() * width,
      rand() * height,
      rand() * width,
      rand() * height,
      rand() * width,
      rand() * height
    );
  }
}

function paintCoverShapes(canvas, image, seed) {
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth || window.innerWidth;
  const height = canvas.clientHeight || window.innerHeight;
  canvas.width = Math.max(1, Math.floor(width * dpr));
  canvas.height = Math.max(1, Math.floor(height * dpr));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const rand = seededRandom(seed);
  ctx.filter = "blur(36px) saturate(1.15)";
  ctx.globalAlpha = 0.9;
  ctx.drawImage(image, -width * 0.12, -height * 0.12, width * 1.24, height * 1.24);
  ctx.filter = "none";
  ctx.globalAlpha = 1;

  const layer = document.createElement("canvas");
  layer.width = canvas.width;
  layer.height = canvas.height;
  const layerCtx = layer.getContext("2d");

  for (let i = 0; i < 16; i += 1) {
    layerCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    layerCtx.clearRect(0, 0, width, height);

    if (i % 2 === 0) {
      paintBlobPath(layerCtx, rand, width, height);
      layerCtx.fillStyle = "#000";
      layerCtx.fill();
    } else {
      layerCtx.lineCap = "round";
      layerCtx.lineJoin = "round";
      layerCtx.lineWidth = 90 + rand() * 160;
      layerCtx.strokeStyle = "#000";
      paintSwirlPath(layerCtx, rand, width, height);
      layerCtx.stroke();
    }

    layerCtx.globalCompositeOperation = "source-in";
    const scale = 1.2 + rand() * 1.1;
    const dw = width * scale;
    const dh = height * scale;
    layerCtx.filter = "blur(14px) saturate(1.2)";
    layerCtx.drawImage(image, -rand() * (dw - width), -rand() * (dh - height), dw, dh);
    layerCtx.filter = "none";
    layerCtx.globalCompositeOperation = "source-over";

    ctx.globalAlpha = 0.42 + rand() * 0.28;
    ctx.drawImage(layer, 0, 0, width, height);
    ctx.globalAlpha = 1;
  }
}

function paintFallbackShapes(canvas, seed) {
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth || window.innerWidth;
  const height = canvas.clientHeight || window.innerHeight;
  canvas.width = Math.max(1, Math.floor(width * dpr));
  canvas.height = Math.max(1, Math.floor(height * dpr));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = "#d7d3cd";
  ctx.fillRect(0, 0, width, height);
  const rand = seededRandom(seed);
  for (let i = 0; i < 12; i += 1) {
    const shade = 110 + Math.floor(rand() * 90);
    paintBlobPath(ctx, rand, width, height);
    ctx.fillStyle = `rgba(${shade}, ${shade}, ${shade}, 0.35)`;
    ctx.filter = "blur(18px)";
    ctx.fill();
    ctx.filter = "none";
  }
}

function loadCoverImage(src) {
  if (imageCache.has(src)) return imageCache.get(src);
  const promise = new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
  imageCache.set(src, promise);
  return promise;
}

function getCanvases() {
  return {
    a: document.getElementById("swirl-canvas-a"),
    b: document.getElementById("swirl-canvas-b")
  };
}

async function paintBackground(canvas, album) {
  try {
    const image = await loadCoverImage(album.cover);
    paintCoverShapes(canvas, image, album.id);
    return averageLuminance(image);
  } catch {
    paintFallbackShapes(canvas, album.id);
    return 150;
  }
}

async function showBackground(album, { instant = false } = {}) {
  const canvases = getCanvases();
  const nextKey = activeCanvas === "a" ? "b" : "a";
  const nextCanvas = canvases[nextKey];
  const currentCanvas = canvases[activeCanvas];
  const luminance = await paintBackground(nextCanvas, album);

  if (instant) {
    nextCanvas.classList.add("is-active");
    currentCanvas.classList.remove("is-active");
  } else {
    nextCanvas.classList.add("is-active");
    currentCanvas.classList.remove("is-active");
  }

  activeCanvas = nextKey;
  applyReadableTheme(luminance);
}

function albumMarkup(album) {
  return `
    <a class="album-cover-link" href="${album.albumUrl}" target="_blank" rel="noreferrer">
      <img src="${album.cover}" alt="${album.title} album cover" />
    </a>
    <div class="album-copy">
      <p>Album: <a href="${album.albumUrl}" target="_blank" rel="noreferrer">${album.title}</a></p>
      <p>Artist: ${album.artist}</p>
      <p>Best Song: <a href="${album.bestSong.url}" target="_blank" rel="noreferrer">${album.bestSong.title}</a></p>
      <p class="album-review">${album.review}</p>
    </div>
  `;
}

function updateUrl(album) {
  const nextUrl = new URL(window.location.href);
  nextUrl.searchParams.set("album", album.id);
  history.replaceState({ albumId: album.id }, "", nextUrl);
}

function trackProgress(index) {
  if (albums.length === 1) return 1;
  return index / (albums.length - 1);
}

function albumIndexFromClientX(track, clientX) {
  const rect = track.getBoundingClientRect();
  const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  return Math.round(ratio * (albums.length - 1));
}

function renderSlider() {
  const slider = document.getElementById("album-slider");
  const progress = trackProgress(currentIndex);
  const fillWidth = `calc(12px + (100% - 24px) * ${progress})`;
  const knobLeft = `calc(12px + (100% - 24px) * ${progress})`;

  slider.innerHTML = `
    <div class="player-now">
      <img src="${currentAlbum.cover}" alt="" />
      <p>${currentAlbum.rank}. ${currentAlbum.title}</p>
    </div>
    <div class="player-track-wrap">
      <div id="player-preview" class="player-preview"></div>
      <div id="player-track" class="player-track" role="slider" tabindex="0"
        aria-valuemin="1" aria-valuemax="${albums.length}" aria-valuenow="${currentAlbum.rank}"
        aria-label="Select album by rank">
        <div class="player-fill" style="width:${fillWidth}"></div>
        <div class="player-knob" style="left:${knobLeft}"></div>
      </div>
    </div>
  `;

  const track = document.getElementById("player-track");
  const preview = document.getElementById("player-preview");
  let dragging = false;

  const showPreview = (index, clientX) => {
    const album = albums[index];
    if (!album) return;
    const wrapRect = track.parentElement.getBoundingClientRect();
    preview.classList.add("visible");
    preview.innerHTML = `
      <img src="${album.cover}" alt="" />
      <strong>${album.rank}. ${album.title}</strong>
      <span>${album.artist}</span>
    `;
    const left = Math.min(wrapRect.width - 188, Math.max(0, clientX - wrapRect.left - 90));
    preview.style.left = `${left}px`;
  };

  track.addEventListener("pointerdown", (event) => {
    dragging = true;
    track.setPointerCapture(event.pointerId);
    showPreview(albumIndexFromClientX(track, event.clientX), event.clientX);
  });
  track.addEventListener("pointermove", (event) => {
    const index = albumIndexFromClientX(track, event.clientX);
    showPreview(index, event.clientX);
  });
  track.addEventListener("pointerup", (event) => {
    if (dragging) {
      const index = albumIndexFromClientX(track, event.clientX);
      goToIndex(index);
    }
    dragging = false;
    preview.classList.remove("visible");
  });
  track.addEventListener("pointerleave", () => {
    if (!dragging) preview.classList.remove("visible");
  });
  track.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") goToIndex(currentIndex + 1);
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") goToIndex(currentIndex - 1);
  });
}

function renderAuthAndComments() {
  const authArea = document.getElementById("auth-area");
  const commentsArea = document.getElementById("comments-area");
  const currentUser = storage.get("currentUser", null);

  if (!currentUser) {
    authArea.innerHTML = `
      <h3>Sign In</h3>
      <input id="username-input" placeholder="Username" />
      <input id="email-input" type="email" placeholder="Email" />
      <button id="send-code" class="primary">Send Code</button>
      <p id="auth-note"></p>
      <input id="code-input" placeholder="Enter code" />
      <button id="verify-code" class="primary">Verify Code</button>
    `;
    commentsArea.innerHTML = "<p>Please sign in to comment.</p>";

    document.getElementById("send-code").addEventListener("click", () => {
      const username = document.getElementById("username-input").value.trim();
      const email = document.getElementById("email-input").value.trim();
      if (!username || !email) return;
      const code = String(Math.floor(100000 + Math.random() * 900000));
      storage.set("pendingAuth", { username, email, code });
      document.getElementById("auth-note").textContent = "Sign-in code sent. Demo code: " + code;
    });

    document.getElementById("verify-code").addEventListener("click", () => {
      const enteredCode = document.getElementById("code-input").value.trim();
      const pendingAuth = storage.get("pendingAuth", null);
      if (!pendingAuth || pendingAuth.code !== enteredCode) return;
      storage.set("currentUser", { username: pendingAuth.username, email: pendingAuth.email });
      localStorage.removeItem("pendingAuth");
      renderAuthAndComments();
    });
    return;
  }

  authArea.innerHTML = `
    <p>Signed in as <strong>${currentUser.username}</strong></p>
    <button id="sign-out">Sign Out</button>
  `;
  document.getElementById("sign-out").addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    renderAuthAndComments();
  });

  const commentsKey = `comments:${currentAlbum.id}`;
  const comments = storage.get(commentsKey, []);
  commentsArea.innerHTML = `
    <textarea id="comment-input" rows="3" placeholder="Write your comment"></textarea>
    <button id="comment-submit" class="primary">Submit</button>
    <div id="comment-list">
      ${
        comments.length
          ? comments
              .map(
                (comment) =>
                  `<article class="comment-item"><strong>${comment.user}</strong><p>${comment.text}</p></article>`
              )
              .join("")
          : `<article class="comment-item"><strong>User 1</strong><p></p></article>
             <article class="comment-item"><strong>User 2</strong><p></p></article>
             <article class="comment-item"><strong>User 3</strong><p></p></article>`
      }
    </div>
  `;

  let isSubmitting = false;
  document.getElementById("comment-submit").addEventListener("click", () => {
    if (isSubmitting) return;
    isSubmitting = true;
    const text = document.getElementById("comment-input").value.trim();
    if (!text) {
      isSubmitting = false;
      return;
    }

    const nextComments = storage.get(commentsKey, []);
    const normalized = text.toLowerCase();
    const duplicate = nextComments.some(
      (comment) => comment.user === currentUser.username && comment.text.toLowerCase() === normalized
    );
    if (!duplicate) {
      nextComments.unshift({ user: currentUser.username, text, createdAt: Date.now() });
      storage.set(commentsKey, nextComments);
    }
    renderAuthAndComments();
    isSubmitting = false;
  });
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function goToIndex(nextIndex, { animate = true } = {}) {
  if (nextIndex < 0 || nextIndex >= albums.length || nextIndex === currentIndex || isTransitioning) {
    return;
  }

  const direction = nextIndex > currentIndex ? "next" : "prev";
  const nextAlbum = albums[nextIndex];
  const view = document.getElementById("album-view");
  isTransitioning = true;

  if (animate) {
    view.classList.remove("is-entering-next", "is-entering-prev", "is-leaving-next", "is-leaving-prev");
    view.classList.add(direction === "next" ? "is-leaving-next" : "is-leaving-prev");
    await Promise.all([showBackground(nextAlbum), wait(280)]);
    currentIndex = nextIndex;
    currentAlbum = nextAlbum;
    updateUrl(currentAlbum);
    view.innerHTML = albumMarkup(currentAlbum);
    view.classList.remove("is-leaving-next", "is-leaving-prev");
    view.classList.add(direction === "next" ? "is-entering-next" : "is-entering-prev");
    renderSlider();
    renderAuthAndComments();
    await wait(560);
    view.classList.remove("is-entering-next", "is-entering-prev");
  } else {
    currentIndex = nextIndex;
    currentAlbum = nextAlbum;
    updateUrl(currentAlbum);
    view.innerHTML = albumMarkup(currentAlbum);
    await showBackground(currentAlbum, { instant: true });
    renderSlider();
    renderAuthAndComments();
  }

  isTransitioning = false;
  wheelAccumulator = 0;
  wheelLockUntil = Date.now() + 450;
}

function wireScrollNavigation() {
  window.addEventListener(
    "wheel",
    (event) => {
      if (Date.now() < wheelLockUntil || isTransitioning) {
        event.preventDefault();
        return;
      }

      const dominant =
        Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      if (Math.abs(dominant) < 8) return;

      event.preventDefault();
      wheelAccumulator += dominant;
      if (Math.abs(wheelAccumulator) < 70) return;

      const goingNext = wheelAccumulator > 0;
      wheelAccumulator = 0;
      goToIndex(currentIndex + (goingNext ? 1 : -1));
    },
    { passive: false }
  );

  let touchStartX = 0;
  let touchStartY = 0;
  window.addEventListener(
    "touchstart",
    (event) => {
      if (!event.touches[0]) return;
      touchStartX = event.touches[0].clientX;
      touchStartY = event.touches[0].clientY;
    },
    { passive: true }
  );
  window.addEventListener(
    "touchend",
    (event) => {
      const touch = event.changedTouches[0];
      if (!touch || isTransitioning) return;
      const dx = touch.clientX - touchStartX;
      const dy = touch.clientY - touchStartY;
      if (Math.abs(dx) < 48 && Math.abs(dy) < 48) return;
      if (Math.abs(dx) >= Math.abs(dy)) {
        goToIndex(currentIndex + (dx < 0 ? 1 : -1));
      } else {
        goToIndex(currentIndex + (dy < 0 ? 1 : -1));
      }
    },
    { passive: true }
  );

  window.addEventListener("keydown", (event) => {
    if (event.repeat) return;
    if (event.key === "ArrowDown" || event.key === "ArrowRight" || event.key === "PageDown") {
      event.preventDefault();
      goToIndex(currentIndex + 1);
    }
    if (event.key === "ArrowUp" || event.key === "ArrowLeft" || event.key === "PageUp") {
      event.preventDefault();
      goToIndex(currentIndex - 1);
    }
  });
}

async function init() {
  const view = document.getElementById("album-view");
  view.innerHTML = albumMarkup(currentAlbum);
  await showBackground(currentAlbum, { instant: true });
  renderSlider();
  renderAuthAndComments();
  wireScrollNavigation();
  albums.forEach((album) => {
    loadCoverImage(album.cover).catch(() => {});
  });
}

window.addEventListener("resize", () => {
  showBackground(currentAlbum, { instant: true });
});

init();
