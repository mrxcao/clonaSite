# clonaSite
Simples copiador de site, pega o HTML, CSS, IMAGENS e deixa o HTML legível (roda beautify nos arquivos que foram uglifyAdos)

## O que ele faz?
Copia os arquivos para a pasta /download 

## O que ele não faz?
- Não organiza em pastas
- Não recupera os nomes originais

## Como usar:

Na pasta, Instale as dependências:
`npm i`


No arquivo index.js, informe o endereço do site:
 `const url = ''`

Salve o arquivo e em seguida rode o script:
 `node index` ou `npm run start`

Ao terminar, os arquivos estarão na pasta `download`

## Dependências:
"axios": "^1.6.7",
"js-beautify": "^1.15.1",
"puppeteer": "^22.3.0"