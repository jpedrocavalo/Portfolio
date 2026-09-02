# Capas dos projetos

Coloque aqui a imagem de capa de cada projeto e aponte o caminho no
`cover` do projeto, em `projects.js`.

```js
cover: './projects/cobrac.png',
coverFit: 'contain',   // logo/arte: mostra inteiro, sem cortar
```

## cover vs coverFit

| coverFit    | quando usar                        | o que faz                          |
|-------------|------------------------------------|------------------------------------|
| `'cover'`   | foto, frame de vídeo (padrão)      | preenche o card, corta o que sobra |
| `'contain'` | logo, arte com texto, cartaz       | mostra a arte inteira, sem cortar  |

Com `contain` a imagem não é escurecida, pra o logo continuar legível.

## Sem capa

Deixe `cover: ''` que o card usa a thumbnail do primeiro vídeo do
projeto. Se o caminho apontar pra um arquivo que não existe, o card
também cai nessa thumbnail em vez de mostrar imagem quebrada.
