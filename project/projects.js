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
     color       → look desenvolvido pro projeto inteiro. Aparece na
                   página do projeto abaixo dos vídeos, com o mesmo
                   comparador, nodes e créditos do bloco de um vídeo.
                   Mesmo formato: { before, after, nodes, powergrade,
                   lut, breakdown }. Some enquanto estiver vazio.
     videos      → lista de vídeos, mesmo formato de videos.js:
                   { title, duration, streamId, youtubeId, description }
                   e opcionalmente o bloco `color` próprio do vídeo.

   Em qualquer vídeo, `hidden: true` tira ele do ar sem apagar nada —
   útil enquanto o vídeo está sendo atualizado.
   ════════════════════════════════════════════════════════════════ */
window.PROJECTS = [
  {
    title: 'COBRAC',
    subtitle: 'Frame Company',
    year: '2026',
    // Vazio = usa a capa do primeiro vídeo. O logo segue em
    // ./projects/cobrac.png se quiser voltar (com coverFit: 'contain').
    cover: '',
    description: 'Cobertura de edição Real Time e pós-evento no Congresso Brasileiro de Cirurgia e Traumatologia Buco-Maxilo-Facial.',
    videos: [
      {
        title: 'Abertura',
        duration: '',
        streamId: '',
        youtubeId: 'Lvz-7CaKMTU',
        description: 'Trabalho de edição para o Congresso Brasileiro de cirurgia e traumatologia buco-maxilo facial.\n\nrepresentando a Frame Company',
      },
      {
        title: 'Dia 1',
        duration: '',
        streamId: '',
        youtubeId: 'My95rPharFA',
        description: 'Trabalho de edição Real Time para o Congresso Brasileiro de cirurgia e traumatologia buco-maxilo facial.\n\nrepresentando a Frame Company',
      },
      {
        title: 'Dia 2',
        duration: '',
        streamId: '',
        youtubeId: 'om_1w1xagQU',
        description: 'Trabalho de edição Real Time para o Congresso Brasileiro de cirurgia e traumatologia buco-maxilo facial.\n\nrepresentando a Frame Company',
      },
      {
        title: 'Dia 3',
        duration: '',
        streamId: '',
        youtubeId: 'QUlrdJqv6qU',
        description: 'Trabalho de edição Real Time para o Congresso Brasileiro de cirurgia e traumatologia buco-maxilo facial.\n\nrepresentando a Frame Company',
      },
      {
        title: 'Stand da Altrum',
        duration: '',
        streamId: '',
        youtubeId: 'BVEkWysWKMA',
        // Short vertical: o player abre em 9:16 em vez de 16:9
        vertical: true,
        // Fora do ar enquanto o vídeo é atualizado. Tire esta linha pra voltar.
        hidden: true,
        description: 'Trabalho de edição para o Congresso Brasileiro de cirurgia e traumatologia buco-maxilo facial.\n\nrepresentando a Frame Company',
      },
      {
        title: 'Palestra Dr. Alexandre Jácome',
        duration: '',
        streamId: '',
        youtubeId: 'hEzpZxtrGU8',
        description: 'Trabalho de edição para o Congresso Brasileiro de cirurgia e traumatologia buco-maxilo facial.\n\nrepresentando a Frame Company',
      },
    ],
  },
  {
    title: 'Click Digital',
    subtitle: 'Frame Company',
    year: '2026',
    cover: '',
    description: '',
    // Look do projeto — aparece abaixo dos vídeos. Preencha quando tiver
    // os frames (./color/...) e o print de nodes.
    color: {
      before: '',
      after: '',
      nodes: '',
      lut: {
        name: 'LA CREME',
        url: 'https://looks.fjr.io/',
      },
    },
    videos: [
      {
        title: 'Alan Nicolas',
        duration: '',
        streamId: '',
        youtubeId: 'gvQKwn_Rv9w',
        description: 'Trabalho freelancer de edição para Frame Company.\nDireção, direção de fotografia e operação de câmera: Frame Company.',
      },
      {
        title: 'André e Wanderley',
        duration: '',
        streamId: '',
        youtubeId: 'H3Fqsdyv2Dk',
        description: 'Trabalho freelancer de edição para Frame Company.\nDireção, direção de fotografia e operação de câmera: Frame Company.',
      },
      {
        title: 'Cadu Neiva',
        duration: '',
        streamId: '',
        youtubeId: 'IUSMUQKj4g8',
        description: 'Trabalho freelancer de edição para Frame Company.\nDireção, direção de fotografia e operação de câmera: Frame Company.',
      },
      {
        title: 'Diandra',
        duration: '',
        streamId: '',
        youtubeId: 'VCW5sNH4iPg',
        description: 'Trabalho freelancer de edição para Frame Company.\nDireção, direção de fotografia e operação de câmera: Frame Company.',
      },
      {
        title: 'Prof. Gilberto',
        duration: '',
        streamId: '',
        youtubeId: 'm5ONXDVMCxE',
        description: 'Trabalho freelancer de edição para Frame Company.\nDireção, direção de fotografia e operação de câmera: Frame Company.',
      },
      {
        title: 'henRICO MEIreles',
        duration: '',
        streamId: '',
        youtubeId: 'TZWZGTslZwk',
        description: 'Trabalho freelancer de edição para Frame Company.\nDireção, direção de fotografia e operação de câmera: Frame Company.',
      },
      {
        title: 'João Adolfo',
        duration: '',
        streamId: '',
        youtubeId: 'UrfXK3sruO8',
        description: 'Trabalho freelancer de edição para Frame Company.\nDireção, direção de fotografia e operação de câmera: Frame Company.',
      },
      {
        title: 'Mônica Salgado',
        duration: '',
        streamId: '',
        youtubeId: 'K0iL6tGXSIs',
        description: 'Trabalho freelancer de edição para Frame Company.\nDireção, direção de fotografia e operação de câmera: Frame Company.',
      },
      {
        title: 'Renan',
        duration: '',
        streamId: '',
        youtubeId: 'QuUDm62NN9E',
        description: 'Trabalho freelancer de edição para Frame Company.\nDireção, direção de fotografia e operação de câmera: Frame Company.',
      },
      {
        title: 'Thiago Veras',
        duration: '',
        streamId: '',
        youtubeId: 'qDoQuoG4Ea8',
        description: 'Trabalho freelancer de edição para Frame Company.\nDireção, direção de fotografia e operação de câmera: Frame Company.',
      },
      {
        title: 'Toguro',
        duration: '',
        streamId: '',
        youtubeId: 'tISm1v0PylA',
        description: 'Trabalho freelancer de edição para Frame Company.\nDireção, direção de fotografia e operação de câmera: Frame Company.',
      },
      {
        title: 'Wanderley',
        duration: '',
        streamId: '',
        youtubeId: 'QKY_EhwZVz8',
        description: 'Trabalho freelancer de edição para Frame Company.\nDireção, direção de fotografia e operação de câmera: Frame Company.',
      },
    ],
  },
];
