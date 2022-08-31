const socket = io({ autoConnect: false });

if (id) {
  socket.auth = { id }
  socket.connect()
}


socket.onAny((event, ...args) => {
  console.log(event, args);
});

socket.on('test', (data) => {
  console.log(data)
})

socket.on('connect', () => {
  if (false) {
    let event = "server:ping"
    console.log(socket.id)
    socket.emit(event, (answer) => {
      console.log(`Tried to ping server using "${event}" event. Status: ${answer.status}`)
    })
  }
  console.log(`User ${socket.auth.id} has connected to server with socket id of ${socket.id}`)
  if (socket.auth.id) {
    $.get(`/api/getroles/${socket.auth.id}`, (data) => {
      // console.log(data)
      socket.emit('rooms', data)
    })
  }
  getNotifs()
  if (window.location.pathname.startsWith('/admin')) {
    socket.emit('livechat:get', { adminId: socket.id })
  }
})

socket.on('notification', (data) => {
  if (data) {
    if ($('#notifications').find('li').length == 0) {
      $('#notifications').text('')
    }
    const x = ['<li>',
      `<a class="position-relative py-2 dropdown-item notification-link" href="${data.url}" onclick="notifSeen(${data.id})">`,
      `<p class="m-0 text-wrap">${data.title}</p>`,
      `<p class="m-0 text-wrap notification-body">${data.body}</p>`,
      `<span class="position-absolute end-0 top-50 translate-middle p-1 bg-danger border border-light rounded-circle"></span>`,
      `</a>`,
      `</li>`,
      `<hr class="m-0">`
    ]
    $('#notifications').prepend(x.join(''))
  }
  updateNotificationCount("#notificationdropdown")
})

function updateNotificationCount(notificationtype, operation = '+') {
  console.log('UPDATE')
  if ($(notificationtype).find('span').length == 0 && operation == '+') {
    const x = [
      `<span class="position-absolute translate-middle badge rounded-pill bg-danger" style="font-size: 9px; top:25%;">`,
      `1 `,
      `<span class="visually-hidden">unread messages</span>`,
      `</span>`
    ]
    $(notificationtype).append(x.join(''))
  } else {
    var t = $(notificationtype).find(".badge").text()
    var num = parseInt(t)
    if (operation == "+") {
      num++
    } else if (operation == '-') {
      num--
    }
    if (num == 0) {
      $(notificationtype).find(".badge").remove()
    } else {
      $(notificationtype).find(".badge").text(num)
    }
  }
}



// socket.on('notification', (data) => {
//   console.log("notification received")
//   const x = `<li>
//     <a class="position-relative py-2 dropdown-item notification-link" href="">
//       <p class="m-0 text-wrap">${data.title}</p>
//       <p class="m-0 text-wrap notification-body">${data.body}</p>

//       <span
//         class="position-absolute end-0 top-50 translate-middle p-1 bg-danger border border-light rounded-circle">
//       </span>
//     </a>
//   </li>

//   <hr class="m-0">`
//   $('#notifications').empty()
//   $('#notifications').append(x)

// })

function sendNotif(event, title, body, url, sender, recipient) {
  let data = {
    title: title,
    body: body,
    url: url,
    sender: sender,
    recipient: recipient,
  }
  console.log(data);
  $.post('/createNotification', data, function ({ id }) {
    data.id = id
    socket.emit(event, data)
  })
}


