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
     cover       → imagem da capa (ex: './projects/cobrac.png').
                   Sem isso — ou se o arquivo não existir — usa a capa
                   do primeiro vídeo da lista.
     coverFit    → 'cover' (padrão) preenche o card e corta o excesso.
                   'contain' mostra a arte inteira sem cortar e sem
                   escurecer: use pra logo, cartaz, arte com texto.
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
    cover: './projects/cobrac.png',
    coverFit: 'contain',
    description: 'Cobertura de edição Real Time e pós-evento no Congresso Brasileiro de Cirurgia e Traumatologia Buco-Maxilo-Facial.',
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
