# Fotos do portfólio de color

Aqui ficam as fotos da página **jotapfilms.com/colorist**.

## Como adicionar um trabalho

1. Crie uma pasta com o nome do trabalho, sem acento e sem espaço:

   ```
   colorist/casamento-grazi/
   ```

2. Jogue as fotos dentro, numeradas na ordem que você quer que apareçam:

   ```
   colorist/casamento-grazi/01.jpg
   colorist/casamento-grazi/02.jpg
   colorist/casamento-grazi/03.jpg
   ```

3. Abra `colorist.js` (um nível acima) e adicione o trabalho na lista:

   ```js
   {
     title: 'Casamento Guará & Graziele',
     year: '2026',
     cover: './colorist/casamento-grazi/01.jpg',
     photos: [
       './colorist/casamento-grazi/01.jpg',
       './colorist/casamento-grazi/02.jpg',
       './colorist/casamento-grazi/03.jpg',
     ],
   },
   ```

A ordem dos trabalhos no arquivo é a ordem do feed.

## Tamanho das fotos

JPG de **1600px no lado maior** já é bastante para a tela, e mantém a
página leve. PNG de export do Resolve costuma ter 3 MB ou mais — se
mandar o arquivo pesado, me peça para converter.

## Tirar um trabalho do ar

Adicione `hidden: true` no item em `colorist.js`. Ele some do feed sem
apagar nada.
