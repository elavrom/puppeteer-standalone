'use strict';

const bodyParser = require('body-parser'),
    express = require('express'),
    fs = require('fs'),
    puppeteer = require('puppeteer'),
    temp = require('temp').track(true);

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();

const bodyParserOptions = {
    inflate: true,
    limit: '20mb',
    type: '*/*'
};

app.use(bodyParser.raw(bodyParserOptions))

app.get('/', (req, res) => {
    handleNoData(res);
});

app.post('/', (req, res) => {
    let url, body;
    url = req.query.url;
    body = req.body;

    if (undefined !== url) {
        return getPdf(url).then(pdfPath => sendFile(res, pdfPath));
    }

    try {
        if (Buffer.byteLength(body) <= 0) {
            body = null;
        }
    } catch (e) {
        body = null;
    }

    if (null !== body) {
        return getPdf(body, true).then(pdfPath => sendFile(res, pdfPath));
    }

    handleNoData(res);
})

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

function handleNoData(res) {
    res.status(400);
    res.send('You should send some data. Either pass an URL in the ?url query param, or send an HTML body in your request.');
}

function sendFile(res, pdfPath) {
    fs.readFile(pdfPath, null, (err, data) => {
        if (!err) {
            res.set('Content-Type', 'application/pdf');
            res.send(data);
            fs.unlink(pdfPath, () => {
            });
            return;
        }
        console.log(err);
    });
}

async function getPdf(urlOrBody, fromBody = false) {
    let id, tempBodyFile = null;
    if (fromBody) {
        await temp.open('ptr-', (err, info) => {
            if (!err) {
                fs.write(info.fd, urlOrBody, (err) => {
                    console.log(err);
                });
                tempBodyFile = info.path + '.html';
                fs.renameSync(info.path, tempBodyFile);
                urlOrBody = 'file://' + tempBodyFile;
            } else {
                urlOrBody = null;
            }
        });
        id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    } else {
        id = urlOrBody.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gim);
    }
    const pdfPath = '/tmp/ptr-' + id + '.pdf';

    const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
    const page = await browser.newPage();
    await page.goto(urlOrBody, {waitUntil: 'networkidle2'});
    await page.pdf({viewport: {width: 800, height: 600}, format: 'a4', printBackground: true, path: pdfPath});

    await browser.close();

    if (null !== tempBodyFile) {
        fs.unlinkSync(tempBodyFile);
    }

    (() => {
        fs.readdir('/tmp', function(err, filenames) {
            if (err) {
                onError(err);
                return;
            }
            filenames.forEach(function(filename) {
                fs.readFile(dirname + filename, 'utf-8', function(err, content) {
                    if (err) {
                        onError(err);
                        return;
                    }
                    onFileContent(filename, content);
                });
            });
        });
    })();

    return pdfPath;
}
