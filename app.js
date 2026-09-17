'use strict';
const groups = new Map();
const dialog = document.querySelector('#comparison');
let activeGroup = null;
function pauseOthers(except) { for (const group of groups.values()) if (group !== except) group.pause(); }
function makeGroup(root) {
  const videos = [...root.querySelectorAll('video')];
  const play = root.querySelector('[data-play]');
  const scrub = root.querySelector('.scrub');
  const time = root.querySelector('.time');
  const status = root.querySelector('.play-status');
  const audio = root.querySelector('[data-audio]');
  let running = false, starting = false, epoch = 0, syncing = false;
  const length = () => Math.min(...videos.map(v => Number.isFinite(v.duration) ? v.duration : 15.04));
  function update() { const t = videos[0].currentTime || 0; scrub.max = length(); scrub.value = t; time.textContent = `${t.toFixed(2)} / ${length().toFixed(2)} s`; }
  function setAudio() { videos.forEach((v,i) => { v.muted = String(i) !== audio.value; }); }
  const group = {
    pause() { epoch++; running = false; starting = false; videos.forEach(v => v.pause()); play.disabled = false; play.textContent = '同步播放'; },
    seek(t) { videos.forEach(v => { if (v.readyState > 0) v.currentTime = Math.min(t, length()); }); update(); },
    async start() {
      pauseOthers(group); activeGroup = group;
      const ticket = ++epoch; starting = true; play.disabled = true; status.textContent = '正在加载视频…';
      const at = videos[0].currentTime >= length() - .1 ? 0 : videos[0].currentTime;
      videos.forEach(v => { v.pause(); if (v.readyState) v.currentTime = at; });
      setAudio();
      try {
        const results = await Promise.allSettled(videos.map(v => v.play()));
        if (ticket !== epoch) return;
        if (results.some(r => r.status === 'rejected')) throw new Error('playback');
        videos.forEach(v => { v.currentTime = at; });
        running = true; play.textContent = '暂停'; status.textContent = '';
      } catch (_) { group.pause(); status.textContent = '部分视频未能播放，请重试或使用单独播放器。'; }
      finally { if (ticket === epoch) { starting = false; play.disabled = false; } }
    }
  };
  play.addEventListener('click', () => running ? group.pause() : group.start());
  root.querySelector('[data-reset]').addEventListener('click', () => { group.pause(); group.seek(0); });
  scrub.addEventListener('input', () => { group.pause(); group.seek(Number(scrub.value)); });
  audio.addEventListener('change', setAudio);
  videos.forEach((v,i) => {
    v.addEventListener('loadedmetadata', update);
    v.addEventListener('ended', () => { if (running) group.pause(); });
    v.addEventListener('error', () => { status.textContent = '视频加载失败，可尝试下载原文件。'; });
    v.addEventListener('play', () => { if (!starting && !running) { pauseOthers(group); activeGroup = group; } });
    v.addEventListener('volumechange', () => { if (!v.muted) videos.forEach(other => { if (other !== v) other.muted = true; }); });
    if (i === 0) v.addEventListener('timeupdate', () => {
      update();
      if (!running || starting || syncing) return;
      syncing = true;
      videos.slice(1).forEach(other => { if (other.readyState >= 3 && !other.seeking && Math.abs(other.currentTime - v.currentTime) > .15) other.currentTime = v.currentTime; });
      syncing = false;
    });
    v.addEventListener('pause', () => { if (running && !starting && !v.ended) group.pause(); });
  });
  setAudio(); update(); return group;
}
document.querySelectorAll('.sample').forEach(root => {
  groups.set(root, makeGroup(root));
  root.querySelector('[data-compare]').addEventListener('click', () => openComparison(root));
});
const pairGroup = makeGroup(dialog); groups.set(dialog,pairGroup);
let sourceSample;
function loadPair() {
  pairGroup.pause();
  dialog.querySelectorAll('[data-choice]').forEach(select => {
    const target = dialog.querySelector(`[data-slot="${select.dataset.choice}"]`);
    const source = sourceSample.querySelector(`video[data-arm="${select.value}"]`);
    target.src = source.getAttribute('src'); target.poster = source.poster; target.load();
  });
  pairGroup.seek(0);
}
function openComparison(sample) {
  pauseOthers(null); sourceSample = sample;
  dialog.querySelector('#comparison-title').textContent = sample.dataset.title + ' · 双视频对照';
  loadPair(); dialog.showModal();
}
dialog.querySelectorAll('[data-choice]').forEach(select => select.addEventListener('change',loadPair));
dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => { pairGroup.pause(); dialog.querySelectorAll('video').forEach(v => { v.removeAttribute('src'); v.load(); }); });
document.addEventListener('visibilitychange', () => { if (document.hidden && activeGroup) activeGroup.pause(); });
