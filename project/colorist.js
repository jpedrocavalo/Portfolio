/* ════════════════════════════════════════════════════════════════
   PORTFÓLIO DE COLOR — o feed da página jotapfilms.com/colorist
   --------------------------------------------------------------
   Cada item é um trabalho. Na primeira tela ele vira uma capa no
   feed; ao clicar, abre uma galeria só com as fotos dele.

     title  → nome que aparece ao passar o mouse na capa
     year   → ano, logo abaixo do nome
     cover  → a foto da capa no feed
     photos → as fotos da galeria, na ordem em que aparecem.
              A capa não entra sozinha: repita ela aqui se quiser
              que seja a primeira da galeria.

   Onde colocar as fotos: na pasta `colorist/`, uma subpasta por
   trabalho. Exemplo:

     colorist/casamento-grazi/01.jpg
     colorist/casamento-grazi/02.jpg

   e aqui:

     {
       title: 'Casamento Guará & Graziele',
       year: '2026',
       cover: './colorist/casamento-grazi/01.jpg',
       photos: [
         './colorist/casamento-grazi/01.jpg',
         './colorist/casamento-grazi/02.jpg',
       ],
     },

   hidden: true tira o trabalho do feed sem apagar nada.

   ── POR ENQUANTO ──
   Está semeado com os frames tratados que já existiam na pasta
   `color/`, só pra página não nascer vazia. Troque por suas fotos
   de color quando tiver.
   ════════════════════════════════════════════════════════════════ */
window.COLORIST = [
  {
    title: 'Making Of da Noiva - Júlia e Ícaro',
    year: '2026',
    cover: './color/Depois-Makingofjulia.png',
    photos: [
      './color/Depois-Makingofjulia.png',
    ],
  },
  {
    title: 'Aftermovie - Guará e Graziele',
    year: '2026',
    cover: './color/Depois-CasamentoGrazi.png',
    photos: [
      './color/Depois-CasamentoGrazi.png',
    ],
  },
  {
    title: 'Click Digital',
    year: '2026',
    cover: './color/Click digital/Depois-Blackmagic1.png',
    photos: [
      './color/Click digital/Depois-Blackmagic1.png',
      './color/Click digital/Depois-Sony.png',
    ],
  },
  {
    title: 'Formatura da Gio',
    year: '2026',
    cover: './color/Depois-FormaturaGio.png',
    photos: [
      './color/Depois-FormaturaGio.png',
    ],
  },
];
