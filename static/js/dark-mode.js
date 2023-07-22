if (localStorage.getItem('dark-mode') === 'true') {
    document.body.classList.add('dark-mode')
    window.onload = () => {
        document.getElementById('darkModeToggle').textContent = '🌙'
    }
}

function toggleDarkMode() {
    var body = document.body
    var button = document.getElementById('darkModeToggle')
    body.classList.toggle('dark-mode')
    button.textContent = body.classList.contains('dark-mode') ? '🌙' : '☀️'

    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('dark-mode', 'true')
    } else {
        localStorage.setItem('dark-mode', 'false')
    }
}
