const albumCatalog = [
  {
    id: "care-for-me",
    title: "Care For Me",
    artist: "Saba",
    cover: "./covers/care-for-me.jpg"
  },
  {
    id: "marshall-mathers-lp",
    title: "The Marshall Mathers LP",
    artist: "Eminem",
    cover: "./covers/marshall-mathers-lp.jpg"
  },
  {
    id: "atliens",
    title: "ATLiens",
    artist: "OutKast",
    cover: "./covers/atliens.jpg"
  },
  {
    id: "to-pimp-a-butterfly",
    title: "To Pimp a Butterfly",
    artist: "Kendrick Lamar",
    cover: "https://cdn-images.dzcdn.net/images/cover/a2b4e981e761aed778fbd2db34bd4d64/500x500-000000-80-0-0.jpg"
  },
  {
    id: "in-rainbows",
    title: "In Rainbows",
    artist: "Radiohead",
    cover: "https://cdn-images.dzcdn.net/images/cover/5105486d2cd73b48695dd3cfc1dc56d4/500x500-000000-80-0-0.jpg"
  }
];

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

const votesKey = "albumRecommendations";
const user = storage.get("currentUser", null);
let selectedAlbum = null;

function votesFor(albumId) {
  const votes = storage.get(votesKey, {});
  return votes[albumId] || [];
}

function castVote(albumId, username) {
  const votes = storage.get(votesKey, {});
  const existing = votes[albumId] || [];
  if (existing.includes(username)) return false;
  votes[albumId] = [username, ...existing];
  storage.set(votesKey, votes);
  return true;
}

function renderRecommendList() {
  const listEl = document.getElementById("recommend-list");
  const withVotes = albumCatalog
    .map((album) => ({ album, votes: votesFor(album.id).length }))
    .sort((a, b) => b.votes - a.votes || a.album.title.localeCompare(b.album.title));
  const maxVotes = Math.max(1, ...withVotes.map((item) => item.votes));

  listEl.innerHTML = withVotes
    .map(({ album, votes }) => {
      const widthPct = Math.round((votes / maxVotes) * 100);
      const green = Math.max(90, Math.min(220, 80 + votes * 15));
      return `
        <article class="recommend-entry">
          <img src="${album.cover}" alt="" />
          <div>
            <strong>${album.title}</strong><br />
            <span>${album.artist}</span><br />
            <span>${votes} recommendation${votes === 1 ? "" : "s"}</span>
          </div>
          <div class="recommend-bar-wrap">
            <div class="recommend-bar" style="width:${widthPct}%;background:rgb(60,${green},60)"></div>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderSearchResults() {
  const resultsEl = document.getElementById("recommend-search-results");
  const query = document.getElementById("recommend-search-input").value.trim().toLowerCase();
  if (!query) {
    resultsEl.innerHTML = "";
    return;
  }

  const matches = albumCatalog.filter((album) => `${album.title} ${album.artist}`.toLowerCase().includes(query));
  resultsEl.innerHTML = matches
    .map(
      (album) => `
      <button class="recommend-result" data-album-id="${album.id}">
        <img src="${album.cover}" alt="" />
        <span>${album.title}<br /><small>${album.artist}</small></span>
        <span>Select</span>
      </button>`
    )
    .join("");

  resultsEl.querySelectorAll(".recommend-result").forEach((button) => {
    button.addEventListener("click", () => openConfirm(button.dataset.albumId));
  });
}

function openConfirm(albumId) {
  if (!user) {
    alert("Please sign in from the review page first.");
    return;
  }

  selectedAlbum = albumCatalog.find((album) => album.id === albumId);
  if (!selectedAlbum) return;

  document.getElementById("recommend-dialog-album").innerHTML = `
    <img src="${selectedAlbum.cover}" alt="" style="width:100px;border-radius:8px" />
    <p><strong>${selectedAlbum.title}</strong><br />${selectedAlbum.artist}</p>
  `;
  document.getElementById("recommend-dialog").showModal();
}

document.getElementById("recommend-search-input").addEventListener("input", renderSearchResults);

document.getElementById("recommend-confirm").addEventListener("click", (event) => {
  event.preventDefault();
  if (!selectedAlbum || !user) return;
  const success = castVote(selectedAlbum.id, user.username);
  if (!success) {
    alert("You have already recommended this album.");
  }
  document.getElementById("recommend-dialog").close();
  selectedAlbum = null;
  renderRecommendList();
});

renderRecommendList();
