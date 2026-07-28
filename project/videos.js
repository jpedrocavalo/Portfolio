/* ════════════════════════════════════════════════════════════════
   LISTA CENTRAL DE VÍDEOS DO PORTFÓLIO
   --------------------------------------------------------------
   Fonte única usada por:
     • reel.html  — monta o grid "Selected Works" (cada card é clicável)
     • video.html — exibe a página de um vídeo (?v=índice)

   Índice 0 = mais recente. Ao adicionar um trabalho novo, coloque-o
   no TOPO da lista — ele vira automaticamente o "Latest work" da hero.

   youtubeId = ID do vídeo no YouTube (youtube.com/watch?v=ESTE_AQUI).
   ════════════════════════════════════════════════════════════════ */
window.VIDEOS = [
  {
    title: 'Aurora — short film',
    duration: '04:32',
    year: '2026',
    category: 'Short film',
    youtubeId: '',
    description: 'Descrição do projeto — contexto, papel do Jotap, o que o trabalho representa. Edite este texto livremente.',
  },
  {
    title: 'Marés — commercial',
    duration: '01:18',
    year: '2025',
    category: 'Commercial',
    youtubeId: '',
    description: 'Descrição do projeto. Edite livremente.',
  },
  {
    title: 'Vento Norte — clip',
    duration: '03:05',
    year: '2025',
    category: 'Music video',
    youtubeId: '',
    description: 'Descrição do projeto. Edite livremente.',
  },
  {
    title: 'Solstício — documentary',
    duration: '12:00',
    year: '2024',
    category: 'Documentary',
    youtubeId: '',
    description: 'Descrição do projeto. Edite livremente.',
  },
  {
    title: 'Eclipse — music video',
    duration: '03:48',
    year: '2024',
    category: 'Music video',
    youtubeId: '',
    description: 'Descrição do projeto. Edite livremente.',
  },
];
