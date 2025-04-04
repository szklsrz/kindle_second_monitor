import { createServer } from "node:http";
import screenshot from 'screenshot-desktop';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const port = 4981;

createServer(function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    const { url } = req;

    if (url === '/screenshot') {
        serveScreenshot(res);
    } else if ('/') {
        serveFile(res, 'index.html', 'text/html');
    }
}).listen(port, '0.0.0.0', () => {
  console.log('Running http://localhost:' + port);
});  


function serveScreenshot(res) {
    screenshot({format: 'png'}).then((bin) => {
        sharp(bin).rotate(270).toBuffer().then(bin => {
            const b64 = 'data:image/png;base64,' + bin.toString('base64');
            res.write(b64);
            res.end(); 
        });
    }).catch((err) => {
        console.error('Erro ao capturar a tela:', err);
    });
}

function serveFile(response, filePath, contentType) {
    const fullPath = path.join(filePath.split('/').at(-1));
    try {
        const content = fs.readFileSync(fullPath);
        response.writeHead(200, { 'Content-Type': contentType });
        response.end(content);
    } catch (error) {
        log(error);
        serveJson(response, 500, { message: 'Internal Server Error' });
    }
}
