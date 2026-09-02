/* ════════════════════════════════════════════════════════════════
   FONTE DE VÍDEO — Cloudflare Stream ou YouTube
   --------------------------------------------------------------
   Cada vídeo (em videos.js / shortform.js) pode ter:

     streamId  → UID do Cloudflare Stream  (tem prioridade)
     youtubeId → ID do vídeo no YouTube    (usado se não houver streamId)

   Basta preencher o streamId de um vídeo pra ele passar a tocar pelo
   Cloudflare. Quem ainda só tem youtubeId continua tocando pelo YouTube.

   A CAPA é independente de onde o vídeo toca — ver THUMB_SOURCE abaixo.
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

// ── CAPA ────────────────────────────────────────────────────────
// De onde vem a imagem de capa quando o vídeo tem as duas fontes.
// A capa NÃO precisa vir de onde o vídeo toca: dá pra usar a capa que
// você subiu no YouTube com o vídeo tocando pelo Cloudflare.
//   'youtube' → a capa que você definiu no YouTube
//   'stream'  → um frame do vídeo no Cloudflare
// Cada vídeo pode sobrescrever com thumbFrom: 'stream'.
window.THUMB_SOURCE = 'youtube';

// Largura pedida pra capa do Cloudflare (o padrão dele é 640px, meio mole
// em tela retina). Cada vídeo pode sobrescrever com thumbWidth.
window.CF_THUMB_WIDTH = 1280;

function ytThumb(id, size) {
  return `https://img.youtube.com/vi/${id}/${size}.jpg`;
}

function cfThumb(item) {
  const p = new URLSearchParams();
  if (item.thumbTime) p.set('time', item.thumbTime);
  p.set('width', item.thumbWidth || window.CF_THUMB_WIDTH);
  return `https://${window.CF_CUSTOMER_CODE}.cloudflarestream.com/${item.streamId}/thumbnails/thumbnail.jpg?${p}`;
}

// Capas em ordem de preferência. A <img> começa na primeira e desce a
// lista conforme uma falha — o maxresdefault do YouTube, por exemplo,
// só existe pra vídeo enviado em 720p+.
//
//   1. item.poster → imagem sua (ex: './capas/casamento.jpg'), ganha de tudo
//   2. a fonte escolhida em thumbFrom / THUMB_SOURCE
//   3. o que sobrar, como rede de segurança
window.mediaThumbChain = function (item) {
  if (!item) return [];
  const urls = [];

  if (item.poster) urls.push(item.poster);

  const from = item.thumbFrom || window.THUMB_SOURCE;
  if (from === 'youtube' && item.youtubeId) urls.push(ytThumb(item.youtubeId, 'maxresdefault'));

  if (item.streamId) urls.push(cfThumb(item));

  // Da melhor pra pior. Num vídeo recém-enviado o YouTube ainda não gerou
  // todos os tamanhos e devolve o placeholder cinza nos que faltam — daí
  // valer a pena listar os quatro em vez de só maxres e hq.
  if (item.youtubeId) {
    urls.push(ytThumb(item.youtubeId, 'maxresdefault')); // 1280x720
    urls.push(ytThumb(item.youtubeId, 'sddefault'));     // 640x480
    urls.push(ytThumb(item.youtubeId, 'hqdefault'));     // 480x360
    urls.push(ytThumb(item.youtubeId, 'mqdefault'));     // 320x180
  }

  return [...new Set(urls)];
};

// URL da capa
window.mediaThumb = function (item) {
  return window.mediaThumbChain(item)[0] || '';
};

// Pula pra próxima capa da lista. Retorna false quando acabou.
function nextThumb(item, el) {
  const chain = window.mediaThumbChain(item);
  const i = chain.indexOf(el.getAttribute('src'));
  const next = i >= 0 ? chain[i + 1] : null;
  if (next) { el.src = next; return true; }
  return false;
}

// Props prontas pra <img> da capa: {...window.mediaThumbProps(video)}
window.mediaThumbProps = function (item) {
  return {
    src: window.mediaThumb(item),

    onError: function (e) { nextThumb(item, e.currentTarget); },

    // Quando não existe capa, o YouTube às vezes devolve um placeholder
    // cinza de 120x90 com status 200 em vez de 404 — aí o onError não
    // dispara. Detecta pelo tamanho e segue pra próxima da lista.
    onLoad: function (e) {
      const el = e.currentTarget;
      if (el.naturalWidth <= 120 && el.naturalHeight <= 90) nextThumb(item, el);
    },
  };
};

// URL do player. opts: { autoplay: bool }
window.mediaPlayer = function (item, opts) {
  opts = opts || {};
  if (!item) return '';

  if (item.streamId) {
    const p = new URLSearchParams({ controls: 'true' });
    if (opts.autoplay) { p.set('autoplay', 'true'); p.set('muted', 'true'); }
    // Mesma capa do card, pra não trocar de imagem antes do play.
    // O player precisa de URL absoluta.
    const thumb = window.mediaThumb(item);
    if (thumb) p.set('poster', new URL(thumb, location.href).href);
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
