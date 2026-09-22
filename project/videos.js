/* ════════════════════════════════════════════════════════════════
   LISTA CENTRAL DE VÍDEOS DO PORTFÓLIO
   --------------------------------------------------------------
   Fonte única usada por:
     • index.html — a home, monta o grid "Selected Works" (cards clicáveis)
     • video.html — exibe a página de um vídeo (?v=índice)

   Índice 0 = mais recente. Ao adicionar um trabalho novo, coloque-o
   no TOPO da lista — ele vira automaticamente o "Latest work" da hero.

   De onde vem o vídeo (ver media.js):
     streamId  = UID do Cloudflare Stream — tem prioridade
     youtubeId = ID do YouTube (youtube.com/watch?v=ESTE_AQUI)

   Preencha o streamId pra mover um vídeo do YouTube pro Cloudflare.

   ── ONDE APARECE ──
   Por padrão o vídeo entra nos dois lugares: "Trabalhos selecionados"
   (na home) e "Ver tudo" (works.html).

   featured: false  → tira só dos selecionados; continua no "Ver tudo".
   featuredTitle    → título só no grid da home (ex: 'Toguro - Click
                      Digital'); Ver tudo e página do vídeo usam title.
   hidden: true     → tira do ar de vez (some dos dois), sem apagar nada.
   vertical: true   → vídeo 9:16 (Short/Reel): o player abre em pé.

   ── COLOR (opcional) ──
   Aparece na página do vídeo, abaixo da descrição. Preencha só o que
   já tiver — o resto vira espaço reservado. Se nada estiver preenchido,
   a seção inteira não aparece.

     color: {
       before: './color/nome-antes.jpg',   // frame sem tratamento
       after:  './color/nome-depois.jpg',  // frame tratado
       nodes:  './color/nome-nodes.jpg',   // print da árvore de nodes
       // vídeo do processo — sem esta chave o bloco nem aparece
       breakdown: { streamId: '' },
       // Bases usadas — aparecem abaixo do print de nodes. Pode ter as duas.
       powergrade: { name: '', url: '' },
       lut:        { name: '', url: '' },
     },

   Look aplicado a mais de uma câmera? No lugar de before/after, use
   uma lista com rótulo — vira um comparador por câmera:
     comparisons: [
       { label: 'Sony',       before: '...', after: '...' },
       { label: 'Blackmagic', before: '...', after: '...' },
     ],

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
    title: 'Making Of da Noiva - Júlia e Ícaro',
    year: '2026',
    category: 'Making of',
    streamId: 'a73d0f00fad3bf5f9a6d5b28fb522b00',
    youtubeId: '9MD8pAtQXoU',
    // Capa própria (original em heroes/Thumb Making of.png, 3,5 MB;
    // esta é a versão leve pra web)
    poster: './capas/makingof-julia.jpg',
    color: {
      before: './color/Antes-Makingofjulia.png',
      after:  './color/Depois-Makingofjulia.png',
      nodes:  './color/Node-Makingofjulia.png',
      breakdown: { streamId: '2df617c38b8b272b27ad0b565ef72e7a' },
    },
    description: 'Trabalho freelancer de edição para Frame Company.\nDireção, direção de fotografia e operação de câmera: Frame Company.',
  },
  {
    title: 'Osteomed Hands-On',
    year: '2026',
    category: 'COBRAC',
    streamId: '',
    youtubeId: '5APIH15Dqzs',
    // Fora da lista principal (segue no projeto COBRAC). Tire esta
    // linha pra voltar ao "Ver tudo".
    hidden: true,
    // Color: preencha os caminhos quando as imagens estiverem na pasta color/
    // color: {
    //   before: './color/Antes-OsteomedHandsOn.png',
    //   after:  './color/Depois-OsteomedHandsOn.png',
    //   nodes:  './color/Node-OsteomedHandsOn.png',
    // },
    description: 'Trabalho de edição para o Congresso Brasileiro de cirurgia e traumatologia buco-maxilo facial.\n\nrepresentando a Frame Company',
  },
  {
    title: 'Osteomed Stands',
    year: '2026',
    category: 'COBRAC',
    streamId: '',
    youtubeId: 'CP-8HF5MyPw',
    // Capa própria (original em heroes/Thumb osteomed stands.png)
    poster: './capas/osteomed-stands.jpg',
    // Só no "Ver tudo", fora dos selecionados da home.
    featured: false,
    description: 'Trabalho de edição para o Congresso Brasileiro de cirurgia e traumatologia buco-maxilo facial.\n\nrepresentando a Frame Company',
  },
  {
    title: 'Aftermovie - Guará e Graziele',
    year: '2026',
    category: 'Wedding film',
    streamId: '9e9771ce9e088a4aa0f8ae636945b9eb',
    youtubeId: 'uMAAN81NUl4',
    color: {
      before: './color/Antes-CasamentoGrazi.png',
      after:  './color/Depois-CasamentoGrazi.png',
      nodes:  './color/Node-CasamentoGrazi.png',
      powergrade: {
        name: 'VCF PowerGrade V02',
        url: 'https://vincentcolorfilm.com/products/vcf-powergrade-v02',
      },
      breakdown: { streamId: 'f0a000100232ad45614997b60eafa9e8' },
    },
    description: 'Trabalho freelancer de edição para Frame Company.\nDireção, direção de fotografia e operação de câmera: Frame Company.',
  },
  {
    title: 'Toguro',
    // Só no grid da home; no resto o título fica sem o sufixo.
    featuredTitle: 'Toguro - Click Digital',
    year: '2026',
    category: 'Click Digital',
    streamId: '',
    youtubeId: 'tISm1v0PylA',
    description: 'Trabalho freelancer de edição para Frame Company.\nDireção, direção de fotografia e operação de câmera: Frame Company.',
  },
  {
    title: 'Desfile Riachuelo Contact Center',
    year: '2026',
    category: 'Desfile',
    streamId: '2f0edcdeec3d19dfdc37d62c0458d121',
    youtubeId: '4FjEpWqRnqs',
    color: {
      before: './color/Antes-DesfileCCR.png',
      after:  './color/Depois-DesfileCCR.png',
      nodes:  './color/Node-DesfileCCR.png',
      breakdown: { streamId: '8f60ffde5c574b441c8f7cfb0fa993ce' },
    },
    description: 'Trabalho freelancer de edição para Frame Company.\nDireção, direção de fotografia e operação de câmera: Frame Company.',
  },
  {
    title: 'Prof. Gilberto',
    // Só no grid da home; no resto o título fica sem o sufixo.
    featuredTitle: 'Prof. Gilberto - Click Digital',
    year: '2026',
    category: 'Click Digital',
    streamId: '',
    youtubeId: 'm5ONXDVMCxE',
    description: 'Trabalho freelancer de edição para Frame Company.\nDireção, direção de fotografia e operação de câmera: Frame Company.',
  },
  {
    title: 'Formatura da Gio',
    year: '2026',
    category: 'Graduation film',
    streamId: 'e18e064a56ced6553e0ec220def58618',
    youtubeId: 'i2zMYQGhsQU',
    // Frames verticais (9:16) — a moldura se adapta sozinha.
    color: {
      before: './color/Antes-FormaturaGio.png',
      after:  './color/Depois-FormaturaGio.png',
      nodes:  './color/Node-FormaturaGio.png',
      lut: {
        name: 'LA CREME',
        url: 'https://looks.fjr.io/',
      },
      // Sem breakdown ainda — sem a chave, o bloco nem aparece.
    },
    description: 'Trabalho freelancer de edição para Frame Company.\nDireção, direção de fotografia e operação de câmera: Frame Company.',
  },
  {
    title: 'henRICO MEIreles',
    year: '2026',
    category: 'Click Digital',
    streamId: '',
    youtubeId: 'TZWZGTslZwk',
    // Só no "Ver tudo", fora dos selecionados da home.
    featured: false,
    description: 'Trabalho freelancer de edição para Frame Company.\nDireção, direção de fotografia e operação de câmera: Frame Company.',
  },
  {
    title: 'São Julhão do Riachuelo Contact Center',
    year: '2026',
    category: 'Aftermovie',
    streamId: 'fd615f2e70246c9f3922cfcf86b58086',
    youtubeId: 'KyalhB1Udh4',
    // Fora do ar. Tire esta linha pra voltar.
    hidden: true,
    description: 'Trabalho freelancer de edição para Frame Company.\nDireção, direção de fotografia e operação de câmera: Frame Company.',
  },
  {
    title: 'Pre Wedding Thaynara e Ruan',
    year: '2026',
    category: 'Pre Wedding Session',
    streamId: '44d487d915c51a3b1dd41d3d9ee425cc',
    youtubeId: 'IzkRaAMCK7E',
    // Só no "Ver tudo": a home fica com 6.
    featured: false,
    description: 'Trabalho freelancer de edição para Frame Company.\nDireção, direção de fotografia e operação de câmera: Frame Company.',
  },
  {
    title: 'Corte Pastor Edson - Igreja ADPAZ',
    year: '2026',
    category: 'Corte',
    streamId: '91bd705f3afb67bbe3940b1c89725477',
    youtubeId: 'tXvVcFDQ8v0',
    // Fora do ar. Tire esta linha pra voltar (ao "Ver tudo").
    hidden: true,
    featured: false,
    description: 'Trabalho voluntário de edição para a igreja ADPaz - Campus Zona Sul',
  }
];
