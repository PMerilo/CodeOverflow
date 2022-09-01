module.exports = (io, socket) => {
    const privateMsg = (msg) => {
        console.log(`msg "${msg.content}" sent .. sending to users in ${msg.chatId}`)
        io.to(`Chat ${msg.chatId}`).emit('message:receive', msg)
        if (msg.new) {
            io.to(`User ${msg.chat.product.OwnerID}`).emit('message:receive', msg)
        }
    }

    const joinroom = (chatId) => {
        socket.join(`Chat ${chatId}`)
        console.log(`${socket.id} has join room "Chat ${chatId}"`);
    }

    const seen = (chatId) => {
        socket.to(`Chat ${chatId}`).emit('message:seen', chatId)
    }

    socket.on("message:sent", privateMsg);
    socket.on("message:seen", seen);
    socket.on('chat:join', joinroom)
}