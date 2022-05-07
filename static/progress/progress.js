const progressBar = document.querySelector('.progress-bar')
const blogContentSection = document.getElementById('page-content')

const documentHeight = document.documentElement.clientHeight

const scrollProgressBar = () => {
    const sectionClientRect = blogContentSection.getBoundingClientRect()
	const progressPercentage = window.scrollY === 0 ? 0 : 100 * (window.outerHeight - sectionClientRect.top) / sectionClientRect.height 
	progressBar.style.width = Math.floor(progressPercentage) + '%'
}

window.addEventListener('scroll', scrollProgressBar)