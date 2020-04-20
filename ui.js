var modalListener = null
function modal(title, btnText, btnAction) {
  var modal = document.getElementById('myModal')
  document.getElementById('modalLabel').innerHTML = title
  var modalBtn = document.getElementById('modalBtn')
  modalBtn.innerHTML = btnText
  modalBtn.removeEventListener("click", modalListener)
  modalListener = modalBtn.addEventListener("click", btnAction)
  modal.className = "modal show"
}

function hideModal() {
  document.getElementById('myModal').className = "modal"
}

function updateUIScore(score) {
  document.getElementById('score').innerHTML = score
}

function updateUILevel(level) {
  document.getElementById('level').innerHTML = level
}