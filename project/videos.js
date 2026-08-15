/* ════════════════════════════════════════════════════════════════
   LISTA CENTRAL DE VÍDEOS DO PORTFÓLIO
   --------------------------------------------------------------
   Fonte única usada por:
     • reel.html  — monta o grid "Selected Works" (cada card é clicável)
     • video.html — exibe a página de um vídeo (?v=índice)

   Índice 0 = mais recente. Ao adicionar um trabalho novo, coloque-o
   no TOPO da lista — ele vira automaticamente o "Latest work" da hero.

   De onde vem o vídeo (ver media.js):
     streamId  = UID do Cloudflare Stream — tem prioridade
     youtubeId = ID do YouTube (youtube.com/watch?v=ESTE_AQUI)

   Preencha o streamId pra mover um vídeo do YouTube pro Cloudflare.

   ── CAPA (opcional) ──
   Por padrão a capa vem do YouTube (a que você subiu lá), mesmo com o
   vídeo tocando pelo Cloudflare. Pra mudar isso num vídeo só:

   thumbFrom: 'stream'  → usa um frame do vídeo no Cloudflare
   thumbTime: '4s'      → com thumbFrom 'stream', escolhe qual frame.
                          Aceita '4s', '90s', '1m20s'.
   poster: './capas/nome.jpg'
                        → imagem sua, ganha de tudo. Coloque em project/.
   ════════════════════════════════════════════════════════════════ */
window.VIDEOS = [
  {
    title: 'Casamento Guará & Graziele',
    duration: '',
    year: '2026',
    category: 'Wedding film',
    streamId: '9e9771ce9e088a4aa0f8ae636945b9eb',
    youtubeId: 'uMAAN81NUl4',
    description: 'Trabalho freelancer de edição para Frame Company.\nDireção, direção de fotografia e operação de câmera: Frame Company.',
  },
  {
    title: 'São Julhão do Riachuelo Contact Center',
    duration: '',
    year: '2026',
    category: 'Aftermovie',
    streamId: 'fd615f2e70246c9f3922cfcf86b58086',
    youtubeId: 'KyalhB1Udh4',
    description: 'Trabalho freelancer de edição para Frame Company.\nDireção, direção de fotografia e operação de câmera: Frame Company.',
  },
  {
    title: 'Formatura da Gio',
    duration: '',
    year: '2026',
    category: 'Graduation film',
    streamId: 'e18e064a56ced6553e0ec220def58618',
    youtubeId: 'i2zMYQGhsQU',
    description: 'Trabalho freelancer de edição para Frame Company.\nDireção, direção de fotografia e operação de câmera: Frame Company.',
  },
  {
    title: 'Pre Wedding Thaynara e Ruan',
    duration: '',
    year: '2026',
    category: 'Pre Wedding Session',
    streamId: '44d487d915c51a3b1dd41d3d9ee425cc',
    youtubeId: 'IzkRaAMCK7E',
    description: 'Trabalho freelancer de edição para Frame Company.\nDireção, direção de fotografia e operação de câmera: Frame Company.',
  }
];
