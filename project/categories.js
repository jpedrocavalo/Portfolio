/* ════════════════════════════════════════════════════════════════
   CATEGORIAS DA ABA COLOR
   --------------------------------------------------------------
   Fonte única usada por:
     • color.html    — monta as 6 seções clicáveis abaixo da hero
     • category.html — exibe a página de uma categoria (?cat=índice)

   cover  = imagem de fundo da seção (na color.html)
   works  = trabalhos dentro da categoria. Formato de cada item:
            { title: 'Nome', meta: '2026 · Cliente', streamId: '' }
            (streamId = UID do Cloudflare Stream; deixe '' por enquanto)
   ════════════════════════════════════════════════════════════════ */
window.CATEGORIES = [
  {
    number: '01',
    title: 'Commercials',
    subtitle: 'Brand films',
    cover: './Captura de tela 2026-03-14 101310.jpg',
    intro: 'Filmes publicitários para marcas que querem mais do que um filme bonito — querem o filme certo.',
    works: [],
  },
  {
    number: '02',
    title: 'Music Videos',
    subtitle: 'Visual scores',
    cover: './Captura de tela 2026-03-30 113939.jpg',
    intro: 'Videoclipes onde a imagem responde à música — cor, ritmo e atmosfera a serviço da faixa.',
    works: [],
  },
  {
    number: '03',
    title: 'Short Films',
    subtitle: 'Narrative work',
    cover: './Captura de tela 2026-04-25 092041.jpg',
    intro: 'Curtas narrativos — histórias inteiras contadas no espaço de poucos minutos.',
    works: [],
  },
  {
    number: '04',
    title: 'Documentaries',
    subtitle: 'Real stories',
    cover: './Captura de tela 2026-04-15 102933.jpg',
    intro: 'Documentário: o real observado com o mesmo cuidado de imagem do ficcional.',
    works: [],
  },
  {
    number: '05',
    title: 'Selected Stills',
    subtitle: 'Photography archive',
    cover: './Captura de tela 2026-03-14 085100.jpg',
    intro: 'Frames e fotografias selecionadas — o olhar parado, entre um corte e outro.',
    works: [],
  },
  {
    number: '06',
    title: 'IDK YET',
    subtitle: 'Will find out tho',
    cover: './Captura de tela 2026-03-14 101853.jpg',
    intro: 'Categoria em construção.',
    works: [],
  },
];
