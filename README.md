# Puppeteer as a Service (PPTaaS)
A simple Express server designed to return a PDF either via an URL or an HTML Body using Puppeteer.

## Install and run

Build and run the Docker via :

```bash
docker build -t pptaas .
docker run --name pptaas -p 8080:8080 pptaas 
```

## Precautions regarding Puppeteer

Puppeteer is running on **noSandbox** mode, so it assumes the URL or any content in your HTML is **SAFE**. As it is said on [Puppeteer's README](https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#setting-up-chrome-linux-sandbox) :

> If you absolutely trust the content you open in Chrome, you can launch Chrome with the --no-sandbox argument:

## Usage

The service is listening on port 8080, and waiting for a POST request.
You have two options : 

### Public URL

If the page you want to print is publicly accessible, use its URL :

```bash
http://localhost:8080?url=<The URL you want to print as a PDF>
```

### HTML Body

If your HTML is not public, you may want to upload your HTML content directly in the request body. Don't forget to mention the header `Content-Type: text/html[ charset=utf-8]` or else it won't work.
