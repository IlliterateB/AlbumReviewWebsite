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
const albumId = params.get("album") || albums[0].id;
const currentAlbum = albums.find((album) => album.id === albumId) || albums[0];
const currentIndex = Math.max(0, albums.findIndex((album) => album.id === currentAlbum.id));

function formatPlays(plays) {
  return new Intl.NumberFormat("en-US").format(plays);
}

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

function extractPalette(image, count = 5) {
  const sample = document.createElement("canvas");
  const size = 48;
  sample.width = size;
  sample.height = size;
  const ctx = sample.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(image, 0, 0, size, size);
  const { data } = ctx.getImageData(0, 0, size, size);
  const buckets = new Map();

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    if (a < 180) continue;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    if (max < 28 || min > 235) continue;
    const key = `${r >> 4}-${g >> 4}-${b >> 4}`;
    const rec = buckets.get(key) || { r: 0, g: 0, b: 0, n: 0 };
    rec.r += r;
    rec.g += g;
    rec.b += b;
    rec.n += 1;
    buckets.set(key, rec);
  }

  return [...buckets.values()]
    .sort((a, b) => b.n - a.n)
    .slice(0, count)
    .map((c) => ({
      r: Math.round(c.r / c.n),
      g: Math.round(c.g / c.n),
      b: Math.round(c.b / c.n)
    }));
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

function paintSwirlsFromPalette(canvas, palette, seed) {
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  canvas.width = Math.max(1, Math.floor(width * dpr));
  canvas.height = Math.max(1, Math.floor(height * dpr));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#f6f3ef";
  ctx.fillRect(0, 0, width, height);

  const rand = seededRandom(seed);
  const strokes = 18;
  for (let i = 0; i < strokes; i += 1) {
    const color = palette[i % palette.length];
    ctx.save();
    paintSwirlPath(ctx, rand, width, height);
    ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${0.22 + rand() * 0.28})`;
    ctx.lineWidth = 64 + rand() * 150;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    ctx.restore();
  }
}

function paintSwirlsFromImage(canvas, image, seed) {
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  canvas.width = Math.max(1, Math.floor(width * dpr));
  canvas.height = Math.max(1, Math.floor(height * dpr));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#f6f3ef";
  ctx.fillRect(0, 0, width, height);

  const rand = seededRandom(seed);
  const layer = document.createElement("canvas");
  layer.width = Math.max(1, Math.floor(width * dpr));
  layer.height = Math.max(1, Math.floor(height * dpr));
  const layerCtx = layer.getContext("2d");

  for (let i = 0; i < 14; i += 1) {
    layerCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    layerCtx.clearRect(0, 0, width, height);
    layerCtx.lineCap = "round";
    layerCtx.lineJoin = "round";
    layerCtx.lineWidth = 70 + rand() * 140;
    layerCtx.strokeStyle = "#000";
    paintSwirlPath(layerCtx, rand, width, height);
    layerCtx.stroke();
    layerCtx.globalCompositeOperation = "source-in";
    const scale = 1.4 + rand();
    const dw = width * scale;
    const dh = height * scale;
    layerCtx.filter = "blur(8px) saturate(1.25)";
    layerCtx.drawImage(image, -rand() * (dw - width), -rand() * (dh - height), dw, dh);
    layerCtx.filter = "none";
    layerCtx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 0.38;
    ctx.drawImage(layer, 0, 0, width, height);
    ctx.globalAlpha = 1;
  }
}

function loadCoverImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

async function renderSwirlBackground(album) {
  const canvas = document.getElementById("swirl-canvas");
  if (!canvas) return;

  try {
    const image = await loadCoverImage(album.cover);
    let palette = null;
    try {
      palette = extractPalette(image, 5);
    } catch {
      palette = null;
    }

    if (palette && palette.length) {
      paintSwirlsFromPalette(canvas, palette, album.id);
    } else {
      paintSwirlsFromImage(canvas, image, album.id);
    }
  } catch {
    paintSwirlsFromPalette(
      canvas,
      [
        { r: 120, g: 120, b: 120 },
        { r: 90, g: 90, b: 90 },
        { r: 160, g: 160, b: 160 }
      ],
      album.id
    );
  }
}

function goToAlbum(nextAlbumId) {
  const nextUrl = new URL(window.location.href);
  nextUrl.searchParams.set("album", nextAlbumId);
  window.location.href = nextUrl.toString();
}

function renderAlbum(album) {
  document.getElementById("album-view").innerHTML = `
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
  renderSwirlBackground(album);
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
    const left = Math.min(
      wrapRect.width - 188,
      Math.max(0, clientX - wrapRect.left - 90)
    );
    preview.style.left = `${left}px`;
  };

  const selectFromEvent = (event) => {
    const index = albumIndexFromClientX(track, event.clientX);
    const next = albums[index];
    if (next && next.id !== currentAlbum.id) goToAlbum(next.id);
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
    if (dragging) selectFromEvent(event);
    dragging = false;
    preview.classList.remove("visible");
  });
  track.addEventListener("pointerleave", () => {
    if (!dragging) preview.classList.remove("visible");
  });
  track.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight" && currentIndex < albums.length - 1) {
      goToAlbum(albums[currentIndex + 1].id);
    }
    if (event.key === "ArrowLeft" && currentIndex > 0) {
      goToAlbum(albums[currentIndex - 1].id);
    }
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

renderAlbum(currentAlbum);
renderSlider();
renderAuthAndComments();

window.addEventListener("resize", () => {
  renderSwirlBackground(currentAlbum);
});
