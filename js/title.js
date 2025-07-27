function updateTitle() {
    var titleElement = document.getElementById('site-title')
    if (window.innerWidth <= 768) {
        titleElement.textContent = 'Yakko M.'
    } else {
        titleElement.textContent = 'Yakko Majuri'
    }
}

// Update the title when the page loads
updateTitle()

// Update the title when the window is resized
window.addEventListener('resize', updateTitle)
