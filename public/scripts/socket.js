const socket = io({ autoConnect: false });

$.get('/currentUser', ({userId}) => {
    if (userId) {
        socket.auth = { userId }
        socket.connect()
    }
})
socket.onAny((event, ...args) => {
    console.log(event, args);
});

