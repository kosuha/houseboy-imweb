const imageUrl = 'https://raw.githubusercontent.com/kosuha/houseboy-imweb/main/tree.png';

const tracks = [
  {
    title: 'In Your Living Room Glow',
    url: 'https://raw.githubusercontent.com/kosuha/houseboy-imweb/main/In%20Your%20Living%20Room%20Glow%20(2).mp3',
  },
  {
    title: 'Living Room Carol',
    url: 'https://raw.githubusercontent.com/kosuha/houseboy-imweb/main/Living%20Room%20Carol.mp3',
  },
  {
    title: 'Silent Night (Instrumental Jazz Version)',
    url: 'https://raw.githubusercontent.com/kosuha/houseboy-imweb/main/Silent%20Night%20(Instrumental%20Jazz%20Version).mp3',
  },
  {
    title: 'Snowlight Serenade',
    url: 'https://raw.githubusercontent.com/kosuha/houseboy-imweb/main/Snowlight%20Serenade.mp3',
  },
  {
    title: "The Hearth's Glow",
    url: "https://raw.githubusercontent.com/kosuha/houseboy-imweb/main/The%20Hearth's%20Glow.mp3",
  },
];

(() => {
  const init = () => {
    if (!document.body || !tracks.length) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'hb-music-wrap';

    wrapper.innerHTML = `
    <button class="hb-music-toggle" aria-label="음악 플레이어 열기">
      <img class="hb-music-toggle-img" src="${imageUrl}" alt="Music Player">
      <div class="hb-eq" aria-hidden="true">
        <div class="hb-eq-inner">
          <span></span><span></span><span></span><span></span>
        </div>
      </div>
    </button>
    <div class="hb-music-panel" aria-live="polite">
      <div class="hb-music-body">
        <div class="hb-track-info">
          <p class="hb-music-title"></p>
          <p class="hb-music-sub">Sunday Jazz Club</p>
        </div>
        <div class="hb-music-controls">
          <button class="hb-ghost-btn hb-like" aria-label="좋아요">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8Z"></path></svg>
          </button>
          <button class="hb-ghost-btn hb-play" aria-label="재생">
            <svg class="hb-icon-play" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 5v14l11-7z"></path></svg>
            <svg class="hb-icon-pause" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5v14M15 5v14"></path></svg>
          </button>
          <button class="hb-ghost-btn hb-next" aria-label="다음 곡">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 5l10 7-10 7V5zm10 0v14"></path></svg>
          </button>
        </div>
      </div>
    </div>
  `;

    document.body.appendChild(wrapper);

    const toggleBtn = wrapper.querySelector('.hb-music-toggle');
    const titleEl = wrapper.querySelector('.hb-music-title');
    const playBtn = wrapper.querySelector('.hb-play');
    const nextBtn = wrapper.querySelector('.hb-next');
    const likeBtn = wrapper.querySelector('.hb-like');

    const audio = new Audio(tracks[0].url);
    audio.preload = 'auto';
    let currentIndex = 0;

    const setTitle = (index) => {
      const track = tracks[index];
      if (!track) {
        titleEl.textContent = '';
        return;
      }
      const separator = '&nbsp;&nbsp;&nbsp;&nbsp;';
      titleEl.innerHTML =
        '<div class="hb-marquee">' +
        `<span>${track.title}${separator}</span>` +
        `<span aria-hidden="true">${track.title}${separator}</span>` +
        '</div>';
    };

    const updatePlayState = () => {
      const isPlaying = !audio.paused;
      playBtn.classList.toggle('is-playing', isPlaying);
      playBtn.setAttribute('aria-label', isPlaying ? '일시정지' : '재생');
      wrapper.classList.toggle('is-playing', isPlaying);
    };

    const loadTrack = (index, autoplay = true) => {
      currentIndex = (index + tracks.length) % tracks.length;
      const track = tracks[currentIndex];
      audio.src = track.url;
      setTitle(currentIndex);
      if (autoplay) audio.play();
    };

    const togglePlay = () => {
      if (audio.paused) {
        audio.play();
      } else {
        audio.pause();
      }
    };

    toggleBtn.addEventListener('click', () => {
      wrapper.classList.toggle('open');
      const isOpen = wrapper.classList.contains('open');
      toggleBtn.setAttribute('aria-label', isOpen ? '음악 플레이어 닫기' : '음악 플레이어 열기');
    });

    playBtn.addEventListener('click', togglePlay);
    nextBtn.addEventListener('click', () => loadTrack(currentIndex + 1));

    likeBtn.addEventListener('click', () => {
      likeBtn.classList.toggle('is-liked');
      const liked = likeBtn.classList.contains('is-liked');
      likeBtn.setAttribute('aria-pressed', liked ? 'true' : 'false');
    });

    audio.addEventListener('play', updatePlayState);
    audio.addEventListener('pause', updatePlayState);
    audio.addEventListener('ended', () => loadTrack(currentIndex + 1));

    // 초기 상태 설정
    setTitle(0);
  };

  if (document.body) {
    init();
  } else {
    window.addEventListener('load', init, { once: true });
  }
})();
