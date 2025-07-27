const countryNameMappings = {
    hongkong: 'Hong Kong',
    unitedstates: 'United States',
}

async function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms)
    })
}

function formatCountryName(rawCountryName) {
    return countryNameMappings[rawCountryName] ?? rawCountryName.charAt(0).toUpperCase() + rawCountryName.slice(1)
}

async function loadImageGridDynamically(parentElement, prefix, numberOfImages, imageFileNames = [], addCaption = true) {
    const cols = []
    // for (let i = 0; i < 3; ++i) {
    //   const col = document.createElement("div");
    //   col.className = "col";
    //   cols.push(col);
    //   parentElement.appendChild(col);
    // }

    for (let i = 1; i <= numberOfImages; ++i) {
        const imageFileName = imageFileNames[i - 1] ?? i
        const img = createImageElement(`${prefix}/${imageFileName}.jpg`)

        // img.onclick = () => {
        //   const modal = document.getElementById("img-popup-modal");
        //   modal.style.display = "block";
        //   const clonedImg = img.cloneNode(true)
        //   clonedImg.style['max-height'] = '80vh'
        //   clonedImg.style['width'] = 'auto'
        //   clonedImg.style['height'] = 'auto'
        //   clonedImg.style['align'] = 'center'
        //   clonedImg.style['display'] = 'block'
        //   clonedImg.style['margin'] = 'auto'

        //   const modalContent = document.getElementById('modal-content')
        //   modalContent.innerHTML = ''
        //   modalContent.appendChild(clonedImg)

        //   if (addCaption) {
        //     const [year, rawCountryName] = imageFileName.split('_')
        //     const country = formatCountryName(rawCountryName)
        //     const label = document.createElement('p')
        //     label.innerHTML = `${country}, ${year}`

        //     modalContent.appendChild(label)
        //   }

        // }
        parentElement.appendChild(img)
        // cols[(i - 1) % 3].appendChild(img);
        await sleep(50)
    }
}

function createImageElement(src) {
    const img = document.createElement('img')
    img.loading = 'lazy'
    img.src = src
    img.onclick = () => {
        openModal(img)
    }
    return img
}
