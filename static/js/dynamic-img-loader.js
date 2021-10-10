async function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms)
    })
}

async function loadImageGridDynamically (parentElement, prefix, numberOfImages) {
    const cols = []
    for (let i = 0; i < 3; ++i) {
        const col = document.createElement('div')
        col.className = 'col'
        cols.push(col)
        parentElement.appendChild(col)
    }
    for (let i = 1; i <= numberOfImages; ++i) {
        const imgSrc = `${prefix}/${i}.jpg`
        const img = document.createElement('img')
        img.src = imgSrc
        cols[(i-1)%3].appendChild(img)
        await sleep(100)
    }

}