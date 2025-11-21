const parentCard = document.querySelector(".parentcard")
const cookieAcceptBtn = document.querySelector(".cookie-btn");
const CutButton = document.querySelector(".child-card");

CutButton.addEventListener("click", ()=>{
    parentCard.style.display = "none";
})

cookieAcceptBtn.addEventListener("click", () => {
    parentCard.style.display = "none";
    let div = document.createElement("div");
    div.style.position = "fixed"; 
    div.style.width = "300px";
    div.style.height = "40px";
    div.style.backgroundColor = "black";
    div.style.color = "white";
    div.style.right = "20px";
    div.style.borderRadius = "10px";
    div.style.padding = "5px";
    div.style.bottom = "20px";
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.style.justifyContent = "center";
    div.innerText = "Thanks for accepting!";
    document.body.appendChild(div);

    setTimeout(() => div.remove(), 2000);

});
