document.onkeydown = function(event) {
  if (event.keyCode === 68) // d
    socket.emit('keyPress', {inputId: 'right', state: true});
  else if (event.keyCode === 83) // s
    socket.emit('keyPress', {inputId: 'down', state: true});
  else if (event.keyCode === 65) // a
    socket.emit('keyPress', {inputId: 'left', state: true});
  else if (event.keyCode === 87) // w
    socket.emit('keyPress', {inputId: 'up', state: true});
}
document.onkeyup = function(event) {
  if (event.keyCode === 68) // d
    socket.emit('keyPress', {inputId: 'right', state: false});
  else if (event.keyCode === 83) // s
    socket.emit('keyPress', {inputId: 'down', state: false});
  else if (event.keyCode === 65) // a
    socket.emit('keyPress', {inputId: 'left', state: false});
  else if (event.keyCode === 87) // w
    socket.emit('keyPress', {inputId: 'up', state: false});
}
