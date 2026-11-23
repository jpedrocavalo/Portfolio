/* ════════════════════════════════════════════════════════════════
   LISTA CENTRAL DE VÍDEOS SHORT-FORM (verticais 9:16)
   --------------------------------------------------------------
   Fonte única usada por:
     • index.html (home) — seção "Short-form" com scroll horizontal
     • short-form.html — grid completo estilo Instagram

   streamId    = UID do Cloudflare Stream — tem prioridade
   youtubeId   = ID do vídeo/Short no YouTube
   subtitle    = linha curta (cliente · contexto)
   description = texto do modal. Use \n pra quebrar linha.

   ── CAPA (opcional) ──
   Padrão: vem do YouTube, mesmo tocando pelo Cloudflare.
   thumbFrom: 'stream'      → usa um frame do vídeo no Cloudflare
   thumbTime: '4s'          → com 'stream', escolhe qual frame
   poster: './capas/x.jpg'  → imagem sua, ganha de tudo

   ── COLOR (opcional) ──
   Igual ao de videos.js, aparece dentro do modal abaixo da descrição.
   Some quando nada está preenchido.

     color: {
       before: './color/nome-antes.png',
       after:  './color/nome-depois.png',
       nodes:  './color/nome-nodes.png',
       powergrade: { name: '', url: '' },
       lut:        { name: '', url: '' },
       // opcional: sem esta chave, o bloco do breakdown nem aparece
       breakdown: { streamId: '' },
     },
   ════════════════════════════════════════════════════════════════ */
window.SHORTFORM = [
  {
    title: 'Stand da Altrum',
    subtitle: 'COBRAC · Frame Company',
    year: '2026',
    streamId: '',
    youtubeId: 'BVEkWysWKMA',
    // Fora do ar enquanto o vídeo é atualizado. Tire esta linha pra voltar.
    hidden: true,
    description: 'Trabalho de edição para o Congresso Brasileiro de cirurgia e traumatologia buco-maxilo facial.\n\nrepresentando a Frame Company',
  },
  {
    title: 'Formatura da Gio',
    subtitle: 'Frame Company',
    year: '2026',
    streamId: 'e18e064a56ced6553e0ec220def58618',
    youtubeId: 'i2zMYQGhsQU',
    // Fora do ar. Tire esta linha pra voltar.
    hidden: true,
    // Mesmo trabalho que aparece em videos.js — mesma color.
    color: {
      before: './color/Antes-FormaturaGio.png',
      after:  './color/Depois-FormaturaGio.png',
      nodes:  './color/Node-FormaturaGio.png',
      lut: {
        name: 'LA CREME',
        url: 'https://looks.fjr.io/',
      },
    },
    description: 'Trabalho freelancer de edição para Frame Company.\nDireção, direção de fotografia e operação de câmera: Frame Company.',
  },
  {
    title: 'Reels Test',
    subtitle: 'Material do Lucas haither',
    year: '2026',
    streamId: 'd2d30e79ee9d8525478731dafb5c2250',
    youtubeId: 'OS2igPCMd6Y',
    color: {
      before: './color/Antes-ReelsLucas.png',
      after:  './color/Depois-ReelsLucas.png',
      nodes:  './color/Node-ReelsLucas.png',
      lut: {
        name: 'LA CREME',
        url: 'https://looks.fjr.io/',
      },
    },
    description: 'Material do Lucas haither.',
  },
  { year: '2026', streamId: 'f4bf4cb3efd3de240ce415406da19362' },
  { year: '2026', streamId: 'db0e90813f1621573992b5f2b6ccd760' },
  { year: '2026', streamId: 'fb24d8ead762f8e9cdf62884bd164763' },
  { year: '2026', streamId: '72a7083b07ac9d07dc6ccb0cdb9768ac' },
  { year: '2026', streamId: '45df435cc02dda196a162520fed581da' },
];
