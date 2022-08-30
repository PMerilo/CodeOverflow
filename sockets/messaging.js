module.exports = (io, socket) => {
    const privateMsg = ({ msg }) => {
        // console.log("msg sent.. sending to users in ", msg)
        io.in(`Chat ${msg.chatId}`).emit('message:receive', msg)
    }

    socket.on("message:sent", privateMsg);
}