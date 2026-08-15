/* ════════════════════════════════════════════════════════════════
   FONTE DE VÍDEO — Cloudflare Stream ou YouTube
   --------------------------------------------------------------
   Cada vídeo (em videos.js / shortform.js) pode ter:

     streamId  → UID do Cloudflare Stream  (tem prioridade)
     youtubeId → ID do vídeo no YouTube    (usado se não houver streamId)

   Basta preencher o streamId de um vídeo pra ele passar a tocar pelo
   Cloudflare. Quem ainda só tem youtubeId continua tocando pelo YouTube.
   ════════════════════════════════════════════════════════════════ */

// Customer Code do Cloudflare Stream (painel → Stream → qualquer vídeo)
window.CF_CUSTOMER_CODE = 'customer-x1j6qmqmv38ltwyr';

// Tem algum vídeo configurado?
window.hasMedia = function (item) {
  return !!(item && (item.streamId || item.youtubeId));
};

// De onde vem o vídeo: 'stream' | 'youtube' | null
window.mediaSource = function (item) {
  if (!item) return null;
  if (item.streamId) return 'stream';
  if (item.youtubeId) return 'youtube';
  return null;
};

// URL da imagem de capa
window.mediaThumb = function (item) {
  if (!item) return '';
  if (item.streamId) {
    return `https://${window.CF_CUSTOMER_CODE}.cloudflarestream.com/${item.streamId}/thumbnails/thumbnail.jpg`;
  }
  if (item.youtubeId) {
    return `https://img.youtube.com/vi/${item.youtubeId}/maxresdefault.jpg`;
  }
  return '';
};

// Capa alternativa: o maxresdefault do YouTube nem sempre existe.
// Retorna null quando não há fallback (Cloudflare sempre gera a capa).
window.mediaThumbFallback = function (item) {
  if (item && !item.streamId && item.youtubeId) {
    return `https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`;
  }
  return null;
};

// Handler pronto pro onError da <img>
window.mediaThumbOnError = function (item) {
  return function (e) {
    const alt = window.mediaThumbFallback(item);
    e.currentTarget.onerror = null;
    if (alt) e.currentTarget.src = alt;
  };
};

// URL do player. opts: { autoplay: bool }
window.mediaPlayer = function (item, opts) {
  opts = opts || {};
  if (!item) return '';

  if (item.streamId) {
    const p = new URLSearchParams({ controls: 'true' });
    if (opts.autoplay) { p.set('autoplay', 'true'); p.set('muted', 'true'); }
    return `https://${window.CF_CUSTOMER_CODE}.cloudflarestream.com/${item.streamId}/iframe?${p}`;
  }

  if (item.youtubeId) {
    const p = new URLSearchParams({ rel: '0', modestbranding: '1', playsinline: '1' });
    if (opts.autoplay) p.set('autoplay', '1');
    return `https://www.youtube.com/embed/${item.youtubeId}?${p}`;
  }

  return '';
};

// Permissões do iframe — servem pros dois players
window.MEDIA_IFRAME_ALLOW =
  'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen';
