const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const beautify = require('js-beautify').html; // Importa a função de beautify para HTML

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto('https://mrxcaoteste.my.canva.site/teste3');
  const content = await page.content();
  const beautifulContent = beautify(content, { 
    indent_size: 2, 
    space_in_empty_paren: true });

  fs.writeFileSync(path.join(__dirname, 'page.html'), beautifulContent);

  console.log('Página copiada e formatada com sucesso.');

  // Fecha o navegador
  await browser.close();
})();