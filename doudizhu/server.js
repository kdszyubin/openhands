const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

// HTTP 服务器，用于提供静态文件
const server = http.createServer((req, res) => {
    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './index.html';
    }

    const extname = path.extname(filePath);
    let contentType = 'text/html';
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.jpg':
            contentType = 'image/jpg';
            break;
    }

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code == 'ENOENT') {
                fs.readFile('./404.html', (error, content) => {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end(content, 'utf-8');
                });
            } else {
                res.writeHead(500);
                res.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

// WebSocket 服务器
const wss = new WebSocket.Server({ server });

let players = [];
let gameState = {
    players: [],
    deck: [],
    landlord: null,
    currentTurn: 0,
    status: 'waiting', // waiting, bidding, playing, finished
    playedCards: []
};

wss.on('connection', (ws) => {
    console.log('Client connected');

    if (players.length >= 3) {
        ws.send(JSON.stringify({ type: 'error', message: 'Room is full' }));
        ws.close();
        return;
    }

    const playerId = players.length;
    players.push({ id: playerId, ws: ws, name: `Player ${playerId + 1}`, hand: [] });

    // Send player ID and current players
    ws.send(JSON.stringify({
        type: 'init',
        playerId: playerId,
        players: players.map(p => ({ id: p.id, name: p.name }))
    }));

    // Broadcast new player join
    broadcast({
        type: 'player_join',
        player: { id: playerId, name: `Player ${playerId + 1}` }
    });

    if (players.length === 3) {
        startGame();
    }

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            handleMessage(playerId, data);
        } catch (e) {
            console.error('Invalid message:', e);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        players = players.filter(p => p.id !== playerId);
        // Reset game if a player leaves
        gameState.status = 'waiting';
        broadcast({ type: 'player_leave', playerId: playerId });
    });
});

function broadcast(data) {
    players.forEach(player => {
        if (player.ws.readyState === WebSocket.OPEN) {
            player.ws.send(JSON.stringify(data));
        }
    });
}

function startGame() {
    gameState.status = 'playing'; // For simplicity, skip bidding for now or add later
    // Initialize deck (simplified for example)
    // Real implementation should use the deck logic from deck.js but adapted for server
    // For now, just a placeholder to signal game start
    broadcast({ type: 'game_start' });
}

function handleMessage(playerId, data) {
    // Handle game logic here: play card, bid, etc.
    // Broadcast updates to all players
    console.log(`Received message from ${playerId}:`, data);
    
    // Example: Forwarding actions
    if (data.type === 'play_card' || data.type === 'bid') {
        broadcast({ ...data, playerId });
    }
}

server.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});
