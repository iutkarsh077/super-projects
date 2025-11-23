const inputBox = document.getElementById("input-box");
const tasks = document.getElementById("tasks");

let allTasks = [];

function renderTask() {
  tasks.innerHTML = "";

  allTasks.forEach((newTask) => {
    const p = document.createElement("p");
    const spanText = document.createElement("span");
    const spanDelete = document.createElement("span");
    const spanEdit = document.createElement("span");

    spanText.innerText = newTask.text;

    spanDelete.innerText = "D";
    spanDelete.style.cursor = "pointer";
    spanDelete.dataset.id = newTask.id;

    spanEdit.innerText = "E";
    spanEdit.dataset.id = newTask.id;
    spanEdit.style.cursor = "pointer";

    p.style.display = "flex";
    p.style.alignItems = "center";
    p.style.justifyContent = "space-between";
    p.style.gap = "15px";
    p.style.padding = "10px 15px";
    p.style.margin = "8px auto";
    p.style.width = "80%";
    p.style.maxWidth = "400px";
    p.style.background = "#f0f0f0";
    p.style.borderRadius = "10px";
    p.style.boxShadow = "0 2px 5px rgba(0,0,0,0.1)";
    p.style.fontSize = "16px";

    spanText.style.flex = "1";

    p.appendChild(spanText);
    p.appendChild(spanEdit);
    p.appendChild(spanDelete);

    tasks.appendChild(p);
  });
}

document.addEventListener("click", (e) => {
  if (e.target.innerText === "D") {
    let id = Number(e.target.dataset.id);

    allTasks = allTasks.filter((task) => task.id !== id);

    renderTask();
  }
});

document.addEventListener("click", (e) => {
  if (e.target.innerText === "E") {
    let id = Number(e.target.dataset.id);
    inputBox.innerText = e.target.value;
    let task2 = allTasks.find((t) => t.id === id);
    console.log(task2);
    inputBox.value = task2.text;
    allTasks = allTasks.filter((task) => task.id !== id);
    renderTask();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;

  const newTask = {
    text: inputBox.value,
    id: Date.now(),
    completed: false,
  };

  allTasks.push(newTask);

  inputBox.value = "";
  renderTask();
});
