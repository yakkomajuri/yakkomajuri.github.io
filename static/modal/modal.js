function openModal(imgElement) {
    var modal = document.getElementById('modal')
    var modalImg = document.getElementById('modalImage')
    modal.style.display = 'block'
    modalImg.src = imgElement.src

    const label = document.createElement('p')
    label.innerHTML = imgElement.alt
    label.className = 'modal-label'
    label.id = 'modal-label'
    modal.appendChild(label)

    window.onclick = function (event) {
        var modal = document.getElementById('modal')
        if (event.target == modal) {
            closeModal()
        }
    }
}

function closeModal() {
    var modal = document.getElementById('modal')
    document.getElementById('modal-label').remove()

    modal.style.display = 'none'
}
