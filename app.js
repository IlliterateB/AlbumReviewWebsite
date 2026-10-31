const albums = [
  {
    id: "random-access-memories",
    rank: 1,
    title: "Random Access Memories",
    artist: "Daft Punk",
    cover: "https://i.scdn.co/image/ab67616d0000b273fdbf8b4d7c9ec0f5b7a2d5f6",
    albumUrl: "https://open.spotify.com/album/4m2880jivSbbyEGAKfITCa",
    songs: [
      { title: "Give Life Back to Music", plays: 189004232, url: "https://open.spotify.com/track/2yLju4E4k2P4bG7rV7G7N1" },
      { title: "Get Lucky", plays: 1456720011, url: "https://open.spotify.com/track/69kOkLUCkxIZYexIgSG8rq" },
      { title: "Instant Crush", plays: 801330204, url: "https://open.spotify.com/track/2cGxRwrMyEAp8dEbuZaVv6" }
    ],
    bestSong: { title: "Instant Crush", plays: 801330204, url: "https://open.spotify.com/track/2cGxRwrMyEAp8dEbuZaVv6" },
    worstSong: { title: "Motherboard", plays: 144240771, url: "https://open.spotify.com/track/2I6AozfVJ8rC0vV4u6Qa6v" },
    review:
      "The production detail is unreal, the sequencing feels cinematic, and the grooves keep pulling me back."
  },
  {
    id: "blonde",
    rank: 2,
    title: "Blonde",
    artist: "Frank Ocean",
    cover: "https://i.scdn.co/image/ab67616d0000b273e99f1f3a7c6f42f7f372f04f",
    albumUrl: "https://open.spotify.com/album/3mH6qwIy9crq0I9YQbOuDf",
    songs: [
      { title: "Nikes", plays: 535113882, url: "https://open.spotify.com/track/0HxaP5b0T6P3ABP3JEC6tr" },
      { title: "Ivy", plays: 837201774, url: "https://open.spotify.com/track/4QhWbupniDd44EDtnh2bFJ" },
      { title: "Nights", plays: 1013042208, url: "https://open.spotify.com/track/7eqoqGkKwgOaWNNHx90uEZ" }
    ],
    bestSong: { title: "Nights", plays: 1013042208, url: "https://open.spotify.com/track/7eqoqGkKwgOaWNNHx90uEZ" },
    review:
      "A deeply emotional record with incredible transitions and subtle vocal layering that reveals more every listen."
  },
  {
    id: "the-new-abnormal",
    rank: 3,
    title: "The New Abnormal",
    artist: "The Strokes",
    cover: "https://i.scdn.co/image/ab67616d0000b2732f6f5dbf786ddf5f4a5e5d4f",
    albumUrl: "https://open.spotify.com/album/2xkZV2Hl1Omi8rk2D7t5lN",
    songs: [
      { title: "The Adults Are Talking", plays: 623551909, url: "https://open.spotify.com/track/5ruzrDWcT0vuJIOMW7gMnW" },
      { title: "Bad Decisions", plays: 294410384, url: "https://open.spotify.com/track/55N8cxpE1QDoeaaNqUnoZ2" },
      { title: "Ode to the Mets", plays: 144630804, url: "https://open.spotify.com/track/0OMM8hM8I7fA2JYI4fJx5h" }
    ],
    bestSong: { title: "The Adults Are Talking", plays: 623551909, url: "https://open.spotify.com/track/5ruzrDWcT0vuJIOMW7gMnW" },
    worstSong: { title: "Bad Decisions", plays: 294410384, url: "https://open.spotify.com/track/55N8cxpE1QDoeaaNqUnoZ2" },
    review:
      "This one blends sharp guitars and moody synth textures perfectly while still feeling like classic Strokes."
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

function formatPlays(plays) {
  return new Intl.NumberFormat("en-US").format(plays);
}

function renderAlbum(album) {
  document.getElementById("album-background").style.backgroundImage = `url('${album.cover}')`;
  document.getElementById("album-view").innerHTML = `
    <a class="album-cover-link" href="${album.albumUrl}" target="_blank" rel="noreferrer">
      <img src="${album.cover}" alt="${album.title} album cover" />
    </a>
    <div class="meta-sections">
      <article class="section-card"><h2>${album.rank}. ${album.title}</h2></article>
      <article class="section-card"><h3>Artist</h3><p>${album.artist}</p></article>
      <article class="section-card">
        <h3>Total Plays by Song</h3>
        <table class="song-table">
          <tbody>
            ${album.songs
              .map(
                (song) =>
                  `<tr><td><a href="${song.url}" target="_blank" rel="noreferrer">${song.title}</a></td><td>${formatPlays(song.plays)}</td></tr>`
              )
              .join("")}
          </tbody>
        </table>
      </article>
      <article class="section-card">
        <h3>Best Song</h3>
        <p><a href="${album.bestSong.url}" target="_blank" rel="noreferrer">${album.bestSong.title}</a> — ${formatPlays(
          album.bestSong.plays
        )}</p>
      </article>
      ${
        album.worstSong
          ? `<article class="section-card"><h3>Worst Song</h3><p><a href="${album.worstSong.url}" target="_blank" rel="noreferrer">${album.worstSong.title}</a> — ${formatPlays(album.worstSong.plays)}</p></article>`
          : ""
      }
      <article class="section-card"><h3>Review</h3><p>${album.review}</p></article>
    </div>
  `;
}

function renderSlider() {
  const slider = document.getElementById("album-slider");
  slider.innerHTML = albums
    .map(
      (album) => `
      <button class="slider-segment ${album.id === currentAlbum.id ? "active" : ""}" data-album-id="${album.id}">
        #${album.rank}
        <span class="hover-preview">
          <img src="${album.cover}" alt="" />
          <strong>${album.title}</strong><br />
          <span>${album.artist}</span><br />
          <span>Rank ${album.rank}</span>
        </span>
      </button>
    `
    )
    .join("");

  slider.querySelectorAll(".slider-segment").forEach((button) => {
    button.addEventListener("click", () => {
      const nextAlbumId = button.dataset.albumId;
      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.set("album", nextAlbumId);
      window.location.href = nextUrl.toString();
    });
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
      document.getElementById("auth-note").textContent =
        "Sign-in code sent. Demo code: " + code;
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
    <h3>Comments on ${currentAlbum.title}</h3>
    <textarea id="comment-input" rows="4" placeholder="Write your comment"></textarea>
    <button id="comment-submit" class="primary">Submit</button>
    <div id="comment-list">
      ${comments
        .map(
          (comment) =>
            `<article class="section-card"><strong>${comment.user}</strong><p>${comment.text}</p></article>`
        )
        .join("")}
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
    const duplicate = nextComments.some((comment) => comment.user === currentUser.username && comment.text.toLowerCase() === normalized);
    if (!duplicate) {
      nextComments.unshift({ user: currentUser.username, text, createdAt: Date.now() });
      storage.set(commentsKey, nextComments);
    }
    renderAuthAndComments();
    isSubmitting = false;
  });
}

function wirePanel() {
  const panel = document.getElementById("message-panel");
  document.getElementById("message-toggle").addEventListener("click", () => {
    panel.classList.toggle("hidden");
  });
  document.getElementById("panel-close").addEventListener("click", () => {
    panel.classList.add("hidden");
  });
}

renderAlbum(currentAlbum);
renderSlider();
wirePanel();
renderAuthAndComments();
