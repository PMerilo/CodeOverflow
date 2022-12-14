const socket = io({ autoConnect: false });

$.get('/currentUser', ({ userId }) => {
    if (userId) {
        socket.auth = { id:userId }
        socket.connect()
    }
})
socket.onAny((event, ...args) => {
    console.log(event, args);
});

socket.on('connect', () => {
    $.get('/api/user/chats', (chats) => {
        for (const chat of chats) {
            socket.emit('chat:join', chat.id)
        }
    })
});