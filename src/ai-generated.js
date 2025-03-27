// Generated JS from AI instructions


document.getElementById('greetBtn').addEventListener('click', function() {
  alert('Hello! Hope you have a great day!');
});

document.getElementById('msgBtn').addEventListener('click', function() {
  const messageElement = document.createElement('p');
  messageElement.textContent = 'This is a custom message.';
  document.body.appendChild(messageElement);
});
