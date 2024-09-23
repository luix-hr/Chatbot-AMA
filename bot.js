const { Client, LocalAuth, sendMessage, Buttons } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const cors = require('cors');
const app = express();
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const http = require('http');
const server = http.createServer(app);
app.use(express.json());

let isConnected = false;


const io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const upload = multer({ storage: multer.memoryStorage() });

const client = new Client(
    {
        puppeteer: {
            args: ['--no-sandbox'],
            headless: true,
            executablePath: 'C://Program Files//Google//Chrome//Application//chrome.exe',
        },
        authStrategy: new LocalAuth({ dataPath: "." }),
        /* pairWithPhoneNumber: {
            phoneNumber: "SEU NUMERO",
            showNotification: true,
            intervalMs: 180000
        }, */
    }
);

client.on('qr', (qr) => {
    isConnected = false;
    qrcode.generate(qr, { small: true });
    io.emit('qr', qr);
});


/* client.on('code', (code) => {
    console.log("Linking code:",code);
}); */

client.on('ready', () => {
    console.log('Client is ready!');
    isConnected = true;
    io.emit('ready');
});

client.initialize();

app.use(cors());

app.get('/status', (req, res) => {
    res.json({ isConnected: isConnected });
});

app.get('/', (req, res) => {
    res.sendFile('index.html', { root: __dirname });
});

app.get('/socket.io/socket.io.js', (req, res) => {
    res.sendFile(require.resolve('socket.io-client/dist/socket.io.js'));
});


client.on('disconnected', (reason) => {
    console.log('Cliente desconectado');
    isConnected = false;
    io.emit('disconnected');

    client.on('qr', (qr) => {
        isConnected = false;
        qrcode.generate(qr, { small: true });
        io.emit('qr', qr);
    });

    client.initialize();
});


// METODO PARA ESCUTAR TODAS AS MENSAGENS RECEBIDAS
// MAS NAO ESCUTA AS MENSAGENS ENVIADAS POR VOCE
client.on('message', async (message) => {
    console.log('Mensagem recebida:', message);

    client.sendMessage(message.from, "Olá! 👋 Seja bem-vindo(a) ao canal oficial da AMA/PI - Associação de Amigos dos Autistas do Piauí. \nNós estamos aqui para ajudar você com informações sobre nossos serviços, atividades e apoio para pessoas com autismo e suas famílias. 💙");
});


server.listen(3333, () => {
    console.log('Servidor rodando na porta 3333');
});