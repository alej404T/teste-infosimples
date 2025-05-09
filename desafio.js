const axios = require('axios');  
const cheerio = require('cheerio'); 
const fs = require('fs'); 
const urlProd = 'https://infosimples.github.io/ecommerce-example/products/00147';

let produtoInfo = {
    nome: "",
    marca: "",
    cats: [], 
    desc: "", 
    variantes: [], 
    especificação: [], 
    avaliação: [], 
    nota: 0, 
    url: urlProd 
};

async function scrapeProduto() {
    try {
        console.log('Iniciando scrape...');
        const response = await axios.get(urlProd);
        const pageHTML = response.data;
        const $ = cheerio.load(pageHTML);
        produtoInfo.nome = $('#product_title').text().trim();
        if (produtoInfo.nome === '') { 
            produtoInfo.nome = "Produto sem nome";
        }
        const brandElement = $('.b.mrand');
        produtoInfoarca = brandElement.text().trim() || "Sem marca";
        $('.current-category a').each(function(i, el) {
            if (i === 0) return; 
            produtoInfo.cats.push($(el).text().trim()); 
        });      
        const descSection = $('.product-details');
        let descText = '';
        descSection.contents().each((idx, node) => {
            if (node.nodeType === 3) { 
                descText += $(node).text().trim() + ' ';
            }});
        produtoInfo.desc = descText.trim();
        $('.card').each(function(i, card) {
            const cardEl = $(card);
            let variant = {};
            try {
                variant.nome = cardEl.find('.sku-name').text().trim() || "Sem nome";
                const precoAtual = cardEl.find('.sku-current-price').text();
                variant.preco = parseFloat(precoAtual.replace(/\D/g, '')) || 0;
                const precoAntigoText = cardEl.find('.sku-old-price').text();
                if (precoAntigoText) {
                    variant.precoAntigo = parseFloat(precoAntigoText.replace(/[^\d,]/g, '').replace(',', '.'));
                }variant.emEstoque = cardEl.find('meta[itemprop="availability"]').attr('content').includes('InStock');        
                produtoInfo.variantes.push(variant);
            } catch (err) {
                console.error('Erro no item', i, err); 
            }
        });fs.writeFile('produto_data.json', JSON.stringify(produtoInfo, null, 4), (err) => {
            if (err) throw err; 
            console.log('Dados salvos!'); 
        });}
        catch (error) {
        console.log('Deu ruim:', error.message);
        console.log('Na linha:', error.stack.split('\n')[1]);
    }
}
scrapeProduto().then(() => console.log('Finalizado!')).catch(e => console.log(e));
