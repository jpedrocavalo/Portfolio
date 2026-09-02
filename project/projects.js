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
    subtitle: 'Frame Company',
    year: '2026',
    cover: '',
    description: 'Congresso Brasileiro de Cirurgia e Traumatologia Buco-Maxilo-Facial.',
    videos: [
      {
        title: 'Abertura - COBRAC',
        duration: '',
        streamId: '',
        youtubeId: 'Lvz-7CaKMTU',
        description: 'Trabalho de edição para o Congresso Brasileiro de cirurgia e traumatologia buco-maxilo facial.\n\nrepresentando a Frame Company',
      },
      {
        title: 'Dia 1 - COBRAC',
        duration: '',
        streamId: '',
        youtubeId: 'My95rPharFA',
        description: 'Trabalho de edição para o Congresso Brasileiro de cirurgia e traumatologia buco-maxilo facial.\n\nrepresentando a Frame Company',
      },
      {
        title: 'Dia 2 - COBRAC',
        duration: '',
        streamId: '',
        youtubeId: 'om_1w1xagQU',
        description: 'Trabalho de edição para o Congresso Brasileiro de cirurgia e traumatologia buco-maxilo facial.\n\nrepresentando a Frame Company',
      },
      {
        title: 'Dia 3 - COBRAC',
        duration: '',
        streamId: '',
        youtubeId: 'QUlrdJqv6qU',
        description: 'Trabalho de edição para o Congresso Brasileiro de cirurgia e traumatologia buco-maxilo facial.\n\nrepresentando a Frame Company',
      },
    ],
  },
];
