const tabGroups = document.getElementById("tabs-group");
const first = document.getElementById("first");
const second = document.getElementById("second");
const third = document.getElementById("third");
const fourth = document.getElementById("fourth");
const tabGroup2 = document.querySelectorAll("#tabs-group > p")



console.log(tabGroup2)
tabGroups.addEventListener("click", (e) => {
  const div = e.target.id;
  const target = e.target;
  tabGroup2.forEach(value => {
    value.style.borderBottom = "none";
  });
  switch (div) {
    case "first-tab":
      first.style.display = "block";
      target.style.borderBottom = "3px solid black";
      second.style.display = "none";
      third.style.display = "none";
      fourth.style.display = "none";
      break;
    case "second-tab":
      second.style.display = "block";
      target.style.borderBottom = "3px solid black";
      first.style.display = "none";
      third.style.display = "none";
      fourth.style.display = "none";
      break;
    case "third-tab":
      second.style.display = "none";
      target.style.borderBottom = "3px solid black";
      first.style.display = "none";
      third.style.display = "block";
      fourth.style.display = "none";
      break;
    case "fourth-tab":
      second.style.display = "none";
      target.style.borderBottom = "3px solid black";
      first.style.display = "none";
      third.style.display = "none";
      fourth.style.display = "block";
      break;
  }
});
