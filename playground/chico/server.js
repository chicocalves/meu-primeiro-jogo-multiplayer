import express from 'express'
import http from 'http'
import createGame from './public/game.js'
//import { Server } from 'socket.io';
import socketio from 'socket.io'

const app = express()
const server = http.createServer(app)
const sockets = socketio(server)
//const sockets = new Server(server);

app.use(express.static('public'))

const game = createGame()
game.start()

game.subscribe((command) => {
    //console.log(`> Emitind ${command.type}`)
    sockets.emit(command.type, command)
})

sockets.on('connection', (socket) => {
    const playerId = socket.id
    console.log(`> Player connected on Server with id: ${playerId}`)

    game.addPlayer({ playerId: playerId})
        
    socket.emit('setup', game.state)

    socket.on('disconnect', () => {
        game.removePlayer({ playerId: playerId})
        console.log(`> Player disconnected on Server with id: ${playerId}`)
    })

    socket.on('move-player', (command) => {
        command.playerId = playerId
        command.type = 'move-player'

        game.movePlayer(command)

        //console.log(`> Player moving on Server with id: ${playerId}`)
    })
})


server.listen(3000, () => {
    console.log(`> Server rodando na porta 3000`)    
})
