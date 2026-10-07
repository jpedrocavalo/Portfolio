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
   ════════════════════════════════════════════════════════════════ */
window.COLORIST = [
  {
    title: 'Making Of da Noiva - Júlia e Ícaro',
    year: '2026',
    cover: './colorist/makingof-julia/capa.jpg',
    photos: [
      './colorist/makingof-julia/01.jpg',
      './colorist/makingof-julia/02.jpg',
      './colorist/makingof-julia/03.jpg',
      './colorist/makingof-julia/04.jpg',
      './colorist/makingof-julia/05.jpg',
      './colorist/makingof-julia/06.jpg',
      './colorist/makingof-julia/07.jpg',
      './colorist/makingof-julia/08.jpg',
      './colorist/makingof-julia/09.jpg',
      './colorist/makingof-julia/10.jpg',
      './colorist/makingof-julia/11.jpg',
      './colorist/makingof-julia/12.jpg',
      './colorist/makingof-julia/13.jpg',
      './colorist/makingof-julia/14.jpg',
      './colorist/makingof-julia/15.jpg',
    ],
  },
];
