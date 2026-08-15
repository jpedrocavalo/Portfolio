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
   ════════════════════════════════════════════════════════════════ */
window.VIDEOS = [
  {
    title: 'Casamento Guará & Graziele',
    duration: '',
    year: '2026',
    category: 'Wedding film',
    streamId: '',
    youtubeId: 'uMAAN81NUl4',
    description: 'Trabalho freelancer de edição para Frame Company.\nDireção, direção de fotografia e operação de câmera: Frame Company.',
  },
  {
    title: 'São Julhão do Riachuelo Contact Center',
    duration: '',
    year: '2026',
    category: 'Aftermovie',
    streamId: '',
    youtubeId: 'KyalhB1Udh4',
    description: 'Trabalho freelancer de edição para Frame Company.\nDireção, direção de fotografia e operação de câmera: Frame Company.',
  },
  {
    title: 'Formatura da Gio',
    duration: '',
    year: '2026',
    category: 'Graduation film',
    streamId: '',
    youtubeId: 'i2zMYQGhsQU',
    description: 'Trabalho freelancer de edição para Frame Company.\nDireção, direção de fotografia e operação de câmera: Frame Company.',
  },
  {
    title: 'Pre Wedding Thaynara e Ruan',
    duration: '',
    year: '2026',
    category: 'Pre Wedding Session',
    streamId: '',
    youtubeId: 'IzkRaAMCK7E',
    description: 'Trabalho freelancer de edição para Frame Company.\nDireção, direção de fotografia e operação de câmera: Frame Company.',
  }
];
