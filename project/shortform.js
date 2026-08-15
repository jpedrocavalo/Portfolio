/* ════════════════════════════════════════════════════════════════
   LISTA CENTRAL DE VÍDEOS SHORT-FORM (verticais 9:16)
   --------------------------------------------------------------
   Fonte única usada por:
     • reel.html       — seção "Short-form" com scroll horizontal
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
   ════════════════════════════════════════════════════════════════ */
window.SHORTFORM = [
  {
    title: 'Formatura da Gio',
    subtitle: 'Frame Company',
    year: '2026',
    streamId: 'e18e064a56ced6553e0ec220def58618',
    youtubeId: 'i2zMYQGhsQU',
    description: 'Trabalho freelancer de edição para Frame Company.\nDireção, direção de fotografia e operação de câmera: Frame Company.',
  },
  {
    title: 'Reels Test',
    subtitle: 'Material do Lucas haither',
    year: '2026',
    streamId: 'd2d30e79ee9d8525478731dafb5c2250',
    youtubeId: 'OS2igPCMd6Y',
    description: 'Material do Lucas haither.',
  },
];
