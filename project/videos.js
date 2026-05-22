/* ════════════════════════════════════════════════════════════════
   LISTA CENTRAL DE VÍDEOS DO PORTFÓLIO
   --------------------------------------------------------------
   Fonte única usada por:
     • reel.html  — monta o grid "Selected Works" (cada card é clicável)
     • video.html — exibe a página de um vídeo (?v=índice)

   Índice 0 = mais recente. Ao adicionar um trabalho novo, coloque-o
   no TOPO da lista — ele vira automaticamente o "Latest work" da hero.

   streamId = UID do vídeo no Cloudflare Stream (copie do painel).
   ════════════════════════════════════════════════════════════════ */
window.VIDEOS = [
  {
    title: 'Aurora — short film',
    duration: '04:32',
    year: '2026',
    category: 'Short film',
    streamId: '',
    description: 'Descrição do projeto — contexto, papel do Jotap, o que o trabalho representa. Edite este texto livremente.',
  },
  {
    title: 'Marés — commercial',
    duration: '01:18',
    year: '2025',
    category: 'Commercial',
    streamId: '',
    description: 'Descrição do projeto. Edite livremente.',
  },
  {
    title: 'Vento Norte — clip',
    duration: '03:05',
    year: '2025',
    category: 'Music video',
    streamId: '',
    description: 'Descrição do projeto. Edite livremente.',
  },
  {
    title: 'Solstício — documentary',
    duration: '12:00',
    year: '2024',
    category: 'Documentary',
    streamId: '',
    description: 'Descrição do projeto. Edite livremente.',
  },
  {
    title: 'Eclipse — music video',
    duration: '03:48',
    year: '2024',
    category: 'Music video',
    streamId: '',
    description: 'Descrição do projeto. Edite livremente.',
  },
];
