# Imagens do bloco de color

Coloque aqui os frames e os prints de node de cada trabalho. Depois é só
apontar o caminho no `color` do vídeo, em `videos.js`.

## Nomes

Use o mesmo prefixo pros três arquivos do mesmo trabalho:

```
casamento-guara-antes.jpg
casamento-guara-depois.jpg
casamento-guara-nodes.jpg
```

## O que exportar

| Arquivo    | O que é                          | Formato sugerido        |
|------------|----------------------------------|-------------------------|
| `-antes`   | frame sem tratamento             | JPG 1920×1080           |
| `-depois`  | o mesmo frame, tratado           | JPG 1920×1080           |
| `-nodes`   | print da árvore de nodes         | PNG, largo (21:9 fica melhor) |

O **antes** e o **depois** precisam ser exatamente o mesmo frame, no
mesmo tamanho. As duas ficam sobrepostas num comparador com divisória
arrastável, então qualquer diferença de enquadramento ou de resolução
aparece como um "pulo" na imagem ao arrastar.

Com só uma das duas preenchidas, o comparador não aparece — as molduras
ficam lado a lado até a outra chegar.

O vídeo do breakdown não vem daqui: sobe pro Cloudflare Stream (ou
YouTube) e entra como `breakdown: { streamId: '...' }`.

## No videos.js

```js
color: {
  before: './color/casamento-guara-antes.jpg',
  after:  './color/casamento-guara-depois.jpg',
  nodes:  './color/casamento-guara-nodes.jpg',
  breakdown: { streamId: '', youtubeId: '' },
},
```

Pode preencher aos poucos — o que faltar aparece como espaço reservado,
e enquanto nada estiver preenchido a seção não aparece no site.
