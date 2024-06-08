const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

// Crear una instancia del cliente de WhatsApp con autenticación local
const client = new Client({
    authStrategy: new LocalAuth(),
    webVersionCache: {
        type: "remote",
        remotePath: "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
    },
});

// Carga dinámicamente los comandos desde la carpeta "commands"
const commands = new Map();
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const commandName = file.slice(0, -3); // Elimina la extensión ".js"
    const command = require(path.join(__dirname, 'commands', file));
    commands.set(commandName, command);
}

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
    console.log('QR code generated, please scan.');
});

client.on('authenticated', () => {
    console.log('Authenticated');
});

client.on('auth_failure', (msg) => {
    console.error('Authentication failed', msg);
});

client.on('disconnected', (reason) => {
    console.log('Client was logged out', reason);
});

client.on('message', message => {
    console.log('Message received:', message.body);
    handleMessage(message);
});

client.on('message_create', (message) => {
    if (message.fromMe) {
        handleMessage(message);
    }
});

async function handleMessage(message) {
    console.log('Handling message:', message.body); // Log para verificar manejo del mensaje
    for (const [commandName, command] of commands.entries()) {
        if (message.body.toLowerCase().trim() === commandName.toLowerCase()) {
            console.log(`Executing command: ${commandName}`); // Log para verificar ejecución del comando
            try {
                await command.execute(message);
            } catch (error) {
                console.error(`Error executing command ${commandName}:`, error);
            }
            return; // Salir del bucle después de ejecutar el comando
        }
    }
}

client.initialize();
