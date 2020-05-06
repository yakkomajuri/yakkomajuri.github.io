const dvision = "Founded DVision Tech to provide services in Software Development, Technical Architecture Design, and Prototyping of Innovative Solutions. I have since been hired both by SMEs and multinationals for fullstack and blockchain development projects.";
const sanofi = "Hired by Sanofi Pasteur, the world's largest producer of vaccines, to design and develop a prototype for a new project. The team and I presented the project at an internal Sanofi hackathon in Paris and it was voted 4th best solution out of hundreds of participating teams, gaining a green light to be developed further.";
const justpoint = "Built and launched an app for iOS and Android aimed at helping travelers communicate while abroad. The app reached 1000 downloads within 4 days of the launch and as of today has been installed in over 2500 devices. As a result of the travel restrictions imposed due to the COVID-19 pandemic, I have currently placed this project on hold.";
const blockchainbh = "BlockchainBH is a project co-founded by me with the goal of expanding the reach of blockchain technology in Brazil. It is the largest open initiative for fostering blockchain education in Brazil and around 2000 people have participated in our various open education programs. As a result of being abroad, I have now stepped down from administrative duties and help the team as a technical advisor.";
const igti = "Integrated the core group responsible for designing the course 'MBA in Blockchain Applications', the first of its kind in Brazil. Additionally, I was responsible for monitoring the program, providing support for students and occasionally hosting lectures.";
const lbl = "Led a team of six developers within London Blockchain Labs during the development of two internal projects regarding decentralized governance and notorization. Additionally, I was also responsible for blockchain development and managing relationships with clients.";
const military = "Integrated a team responsible for securing a Finnish Navy base.";
const hautomo = "Hautomo is a non-profit organization providing entrepreneurship-based education to high school students in Finland and the US. I was responsible for coordinating Hautomo operations in Finland";

let roles = {
    "dvision": [dvision, false],
    "sanofi": [sanofi, false],
    "justpoint": [justpoint, false],
    "blockchainbh": [blockchainbh, false],
    "igti": [igti, false],
    "lbl": [lbl, false],
    "military": [military, false],
    "hautomo": [hautomo, false]
}

const readMore = (btnId, sectionId) => {
    let section = document.getElementById(sectionId);
    let btn = document.getElementById(btnId);
    if (roles[sectionId][1]) {
        section.innerHTML = "";
        btn.innerHTML = "[+]";
    } else {
        section.innerHTML = roles[sectionId][0];
        btn.innerHTML = "[-]";
    }
    roles[sectionId][1] = !roles[sectionId][1];
}



