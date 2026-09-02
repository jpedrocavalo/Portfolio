/* ════════════════════════════════════════════════════════════════
   PROJETOS — trabalhos com vários vídeos sob o mesmo guarda-chuva
   --------------------------------------------------------------
   Fonte única usada por:
     • index.html   — a home, seção "Projetos" com as capas
     • project.html — abre um projeto (?p=índice) e lista seus vídeos
     • video.html   — um vídeo de dentro de um projeto (?p=índice&v=índice)

   Cada projeto:
     title       → nome do evento/projeto (aparece na capa)
     subtitle    → cliente ou contexto, uma linha
     year        → ano
     cover       → imagem da capa (ex: './projects/cobrac.jpg').
                   Sem isso, usa a capa do primeiro vídeo da lista.
     description → texto da página do projeto
     videos      → lista de vídeos, mesmo formato de videos.js:
                   { title, duration, streamId, youtubeId, description }
                   e opcionalmente o bloco `color`.
   ════════════════════════════════════════════════════════════════ */
window.PROJECTS = [
  {
    title: 'COBRAC',
    subtitle: '',
    year: '2026',
    cover: '',
    description: '',
    videos: [
      // Cada vídeo entra aqui, por exemplo:
      // {
      //   title: 'Abertura',
      //   duration: '',
      //   streamId: '',
      //   youtubeId: '',
      //   description: '',
      // },
    ],
  },
];
