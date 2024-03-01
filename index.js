const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const beautify = require('js-beautify').html; 

const url = 'https://mrxcaoteste.my.canva.site/teste3'
const outDir = '/download/'


const extractFontUrlsFromCSS = (cssContent) => {
    const fontUrls = [];
    const fontFaceRegex = /@font-face\s*\{[^\}]*?\burl\(([^)]+)\)[^\}]*?\}/gi;
    let match;  
    while ((match = fontFaceRegex.exec(cssContent)) !== null) {
      fontUrls.push(match[1].replace(/["']/g, "")); 
    }  
    return fontUrls;
};

const downloadResource = async (url, localPath) => {
  const response = await axios({
    method: 'GET',
    url: url,
    responseType: 'stream',
  });
  response.data.pipe(fs.createWriteStream(localPath));
  return new Promise((resolve, reject) => {
    response.data.on('end', () => resolve());
    response.data.on('error', reject);
  });
};

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  const content = await page.content();

  // imagens
  const images = await page.evaluate(() => Array.from(document.images, e => e.src));
  for (const imageUrl of images) {
    const imageName = path.basename(new URL(imageUrl).pathname);
    await downloadResource(imageUrl, path.join(__dirname+outDir, imageName));
  }
 
  
  
  // Fontes dentro do HTML
  const inlineStyles = await page.evaluate(() => {
    const styles = Array.from(document.querySelectorAll('style')).map(style => style.textContent);
    const inlineStyles = Array.from(document.querySelectorAll('[style]')).map(element => element.getAttribute('style'));
    return styles.concat(inlineStyles);
  });
  const allCssContent = inlineStyles.join(' ');
  const fontUrlsS = extractFontUrlsFromCSS(allCssContent);
  for (const fontUrl of fontUrlsS) {
    console.log('fontUrl',url +'/'+ fontUrl);
    const fontName = path.basename(new URL(url+'/'+fontUrl).pathname);
    console.log('fontName',fontName);
    await downloadResource(url+'/'+fontUrl, path.join(__dirname+outDir, fontName));
    // Aqui você faria a substituição da URL da fonte no conteúdo CSS por uma referência local
  }


  
  

  // CSSs
  const cssFiles = await page.evaluate(() => Array.from(document.querySelectorAll('link[rel="stylesheet"]'), e => e.href));
  // Buscar fontes dentro do css
  for (const cssFile of cssFiles) {
    const cssContent = await page.evaluate(async (url) => {
      const response = await fetch(url);
      return await response.text();
    }, cssFile);
    const fontUrls = extractFontUrlsFromCSS(cssContent);
    // Download de cada fonte
    for (const fontUrl of fontUrls) {
      const fontName = path.basename(new URL(fontUrl).pathname);
      await downloadResource(fontUrl, path.join(__dirname+outDir, fontName));
    }
  }




  // Salva o HTML modificado (após substituir URLs de recursos)
  const beautifulContent = beautify(content, { 
    indent_size: 2, 
    space_in_empty_paren: true });  
  fs.writeFileSync(path.join(__dirname+outDir, 'page.html'), beautifulContent);

  console.log('Página e recursos copiados com sucesso.');

  await browser.close();
})();
