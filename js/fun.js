let juiceLoaded = false;
const introNoJuice = "I am a London-based Solutions Architect and Software Developer with international experience as a consultant and public speaker. I have hosted lectures in six different countries, as well as provided technical consultancy and development services for various clients both in Europe and Latin America. My most recent research project has been published and presented at the European Central Bank, and my current areas of focus are privacy-preserving protocols, Distributed Ledger Technology, and social impact-oriented tools.";
const introWithJuice = "Testing ";
const loaderNoJuice = "<a id='juice-loader' href='javascript:loadJuice()'> Is this intro too boring? Click here for the juice 🧃</a>";
const loaderWithJuice = "<a id='juice-loader' href='javascript:loadJuice()' >Enough of the juice, take me back ↺</a>"

const loadJuice = () => {
    let content = document.getElementById('juice');
    let loader = document.getElementById('juice-loader');
    if (juiceLoaded) {
        content.innerHTML = introNoJuice;
        loader.innerHTML = loaderNoJuice;
    } else {
        content.innerHTML = introWithJuice;
        loader.innerHTML = loaderWithJuice;
    }
    juiceLoaded = !juiceLoaded;
}



