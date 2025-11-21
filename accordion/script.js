import { faq } from "./constant.js";

const hero = document.getElementById("hero");

faq.forEach((item) => {
  const wrapper = document.createElement("div");
  const divQuestion = document.createElement("div");
  const divQuestionLeft = document.createElement("div");
  const divQuestionRight = document.createElement("div");
  const divAnswer = document.createElement("div");

  divQuestionLeft.innerText = item.question;
  divQuestionRight.innerText = "^"
  divQuestion.style.width = "30%";
  divQuestion.style.backgroundColor = "black";
  divQuestion.style.color = "white";
  divQuestion.style.cursor = "pointer";
  divQuestion.style.fontWeight = "bold";
  divQuestion.style.fontSize = "20px";
  divQuestion.style.borderRadius = "10px"
  divQuestion.style.padding = "20px";
  divQuestion.style.display = "flex";
  divQuestion.style.justifyContent = "space-between"
  divQuestion.appendChild(divQuestionLeft);
  divQuestion.appendChild(divQuestionRight)
  

  divAnswer.innerText = item.answer;
  divAnswer.style.display = "none";
  divAnswer.style.marginLeft = "10px";
   divAnswer.style.marginTop = "10px";
  divAnswer.style.border = "solid";
  divAnswer.style.height = "50px";
  divAnswer.style.borderColor = "black";
  divAnswer.style.borderRadius = "10px";
  divAnswer.style.fontSize = "15px";
  divAnswer.style.padding = "10px";
  divAnswer.style.width = "30%"

  wrapper.style.margin = "10px"


  divQuestion.addEventListener("click", () => {
    divAnswer.style.display =
      divAnswer.style.display === "none" ? "block" : "none";
      divQuestionRight.style.transform = divQuestionRight.style.transform === "rotate(180deg)" ? "rotate(360deg)" : "rotate(180deg)"
  });

  wrapper.appendChild(divQuestion);
  wrapper.appendChild(divAnswer);
  hero.appendChild(wrapper);
});
