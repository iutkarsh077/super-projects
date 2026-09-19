const STORAGE_KEY = "todo-app.todos";

const todoForm = document.getElementById("todo-form");
const todoInput = document.getElementById("todo-input");
const todoList = document.getElementById("todo-list");
const todoCount = document.getElementById("todo-count");
const clearCompletedBtn = document.getElementById("clear-completed");
const emptyState = document.getElementById("empty-state");

let todos = loadTodos();

function loadTodos() {
  try {
    const storedTodos = localStorage.getItem(STORAGE_KEY);
    return storedTodos ? JSON.parse(storedTodos) : [];
  } catch (error) {
    console.error("Failed to load todos:", error);
    return [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function renderTodos() {
  todoList.innerHTML = "";

  if (todos.length === 0) {
    emptyState.style.display = "block";
  } else {
    emptyState.style.display = "none";
  }

  todos.forEach((todo) => {
    const li = document.createElement("li");
    li.className = `todo-item${todo.completed ? " completed" : ""}`;
    li.dataset.id = todo.id;

    li.innerHTML = `
      <input class="todo-check" type="checkbox" ${todo.completed ? "checked" : ""} aria-label="Mark todo as completed" />
      <span class="todo-text"></span>
      <button class="todo-delete" type="button" aria-label="Delete todo">Delete</button>
    `;

    li.querySelector(".todo-text").textContent = todo.text;

    li.querySelector(".todo-check").addEventListener("change", () => toggleTodo(todo.id));
    li.querySelector(".todo-delete").addEventListener("click", () => deleteTodo(todo.id));

    todoList.appendChild(li);
  });

  const completedCount = todos.filter((todo) => todo.completed).length;
  todoCount.textContent = `${todos.length} todo${todos.length === 1 ? "" : "s"} • ${completedCount} completed`;
}

function addTodo(text) {
  const trimmedText = text.trim();

  if (!trimmedText) {
    todoInput.focus();
    return;
  }

  todos.unshift({
    id: Date.now().toString(),
    text: trimmedText,
    completed: false,
  });

  saveTodos();
  renderTodos();
  todoInput.value = "";
  todoInput.focus();
}

function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  saveTodos();
  renderTodos();
}

function toggleTodo(id) {
  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );
  saveTodos();
  renderTodos();
}

function clearCompletedTodos() {
  todos = todos.filter((todo) => !todo.completed);
  saveTodos();
  renderTodos();
}

todoForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addTodo(todoInput.value);
});

clearCompletedBtn.addEventListener("click", clearCompletedTodos);

document.addEventListener("DOMContentLoaded", renderTodos);
renderTodos();
