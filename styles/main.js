const user = {};
const form = document.querySelector(".todolist");
const authForm = document.querySelector("form.auth");
const taskList = form.querySelector(".task_list");
const apiRootEndPoint = "https://api.learnjavascript.today";

const toggleErrorMessage = (status) => {
  const errorMessages = {
    400: "An account with the same username password pair already exists",
    404: "Username or password is wrong",
    403: "Something went wrong. It's not your fault.",
  };

  const message = errorMessages[status]
    ? errorMessages[status]
    : "Can't Connect to Server. Check your internet and try again";

  const messageContainer = document.querySelector(".message-container");
  messageContainer.classList.add("display");
  messageContainer.querySelector(".message").textContent = message;
};

const generateAuthForm = () => {
  const { authType } = authForm.dataset;
  const authButton = authForm.querySelector("button");
  const switchTrigger = authForm.querySelector("span.switch");
  authForm.dataset.authType = authType === "ver" ? "new" : "ver";
  switch (authForm.dataset.authType) {
    case "new":
      authButton.textContent = "Sign Up";
      switchTrigger.textContent = "Already have an account? Sign In";
      break;
    case "ver":
      authButton.textContent = "Sign In";
      switchTrigger.textContent = "Don't Have an account Sign Up";
      break;
    default:
      break;
  }
};

const createTask = (taskname, taskId, done) => {
  const task = document.createElement("li");
  task.setAttribute("id", taskId);
  const taskState = done ? "checked" : "";
  task.className = "task";
  task.innerHTML = `<span class="task-left">
            <input type="checkbox" ${taskState} name="task" id="${taskId}">
            <label for="${taskId}">
              <svg viewBox="0 0 20 15">
                <path d="M0 8l2-2 5 5L18 0l2 2L7 15z" fill="#fff" />
              </svg>
            </label>
    <input class="task-name" value="${taskname}">
          </span>
          <button type="button" class="task__delete-button">
            <svg viewBox="0 0 20 20">
              <path
                d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z" />
            </svg>
          </button>
`;
  return task;
};
const todoUtilities = {
  fetchTasks(username, password) {
    const encoded = btoa(`${username}:${password}`);
    fetch(`${apiRootEndPoint}/tasks`, {
      method: "get",
      headers: {
        Authorization: `Basic ${encoded}`,
      },
    })
      .then((response) =>
        response.json().then((body) => {
          return response.ok ? body : Promise.reject(response.status);
        })
      )
      .then((body) => {
        const frag = document.createDocumentFragment();
        body.forEach((taskObj) => {
          const { id, name, done } = taskObj;
          const task = createTask(name, id, done);
          frag.appendChild(task);
        });
        console.log(body);
        taskList.appendChild(frag);
        taskList.nextElementSibling.textContent =
          "Your todo list is empty. Excelsior. To the moon! 🎉";
      })
      .catch((statusCode) => toggleErrorMessage(statusCode));
  },
  createUpdateTasks(
    username,
    password,
    taskName,
    taskStatus = false,
    taskId = "",
    method = "post",
    parameter = ""
  ) {
    const encoded = btoa(`${username}:${password}`);
    fetch(`${apiRootEndPoint}/tasks${parameter}`, {
      method,
      headers: {
        Authorization: `Basic ${encoded}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: taskId,
        name: taskName,
        done: taskStatus,
      }),
    })
      .then((response) =>
        response.json().then((body) => {
          if (response.ok && method === "post") {
            const { id, name, done } = body;
            const task = createTask(name, id, done);
            taskList.appendChild(task);
          } else if (method === "put") {
            console.log(body);
          } else {
            return Promise.reject(response.status);
          }
        })
      )
      .catch((statusCode) => toggleErrorMessage(statusCode));
  },
  deleteTask(username, password, task, taskId) {
    const encoded = btoa(`${username}:${password}`);
    fetch(`${apiRootEndPoint}/tasks/${taskId}`, {
      method: "delete",
      headers: {
        Authorization: `Basic ${encoded}`,
      },
    })
      .then((response) =>
        response.json().then(() => {
          if (response.ok) {
            taskList.removeChild(task);
          } else {
            return Promise.reject(response.status);
          }
        })
      )
      .catch((statusCode) => toggleErrorMessage(statusCode));
  },
};
const authenticate = {
  getUser(username, password) {
    fetch(`${apiRootEndPoint}/users/${username}`, {
      method: "get",
      headers: {
        Authorization: `Basic ${btoa(`${username}:${password}`)}`,
      },
    })
      .then((response) =>
        response.json().then((body) => {
          return response.ok ? body : Promise.reject(response.status);
        })
      )
      .then(() => {
        authForm.classList.add("success");
        authForm.parentElement.style.display = "none";
        todoUtilities.fetchTasks(user.username, user.password);
      })
      .catch((statusCode) => {
        authForm.classList.add("failed");
        toggleErrorMessage(statusCode);
      });
  },
  signUp(username, password) {
    fetch(`${apiRootEndPoint}/users`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    })
      .then((response) =>
        response.json().then((body) => {
          return response.ok ? body : Promise.reject(response.ok);
        })
      )
      .then(() => {
        authForm.classList.add("success");
        authForm.parentElement.style.display = "none";
        todoUtilities.fetchTasks(user.username, user.password);
      })
      .catch((statusCode) => {
        authForm.classList.add("failed");
        toggleErrorMessage(statusCode);
      });
  },
};
document.addEventListener("click", (e) => {
  const messageContainer = document.querySelector(".message-container.display");
  if (messageContainer) {
    if (e.target.closest(".message-container button")) {
      messageContainer.classList.remove("display");
    } else if (!e.target.closest(".message-container"))
      messageContainer.classList.remove("display");
  }
});
authForm.addEventListener("submit", (e) => {
  e.preventDefault();
  authForm.className = "auth";
  const username = authForm.querySelector("input[type='text']").value.trim();
  const password = authForm
    .querySelector("input[type='password']")
    .value.trim();

  user.name = username;
  user.username = `${username}${password}`;
  user.password = password;

  const { authType } = e.currentTarget.dataset;

  if (authType === "ver") authenticate.getUser(user.username, user.password);
  else authenticate.signUp(user.username, user.password);
});

authForm.addEventListener("click", (e) => {
  if (e.target.closest("span.switch")) {
    generateAuthForm();
  }
});
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const newTaskContainer = form.querySelector("#new-task");
  const taskName = newTaskContainer.value.trim();
  newTaskContainer.value = "";
  newTaskContainer.focus();
  if (!taskName) return;
  todoUtilities.createUpdateTasks(user.username, user.password, taskName);
});

form.addEventListener("click", (e) => {
  if (!e.target.closest(".task")) return;
  const targetTask = e.target.closest(".task");
  const taskId = targetTask.getAttribute("id");

  if (e.target.closest(".task__delete-button")) {
    todoUtilities.deleteTask(user.username, user.password, targetTask, taskId);
  }
});
taskList.addEventListener("input", (e) => {
  const targetTask = e.target.closest("li");
  const checkbox = targetTask.querySelector("input[type='checkbox']");
  const taskStatus = checkbox.checked;
  const taskId = checkbox.id;
  const taskName = targetTask.querySelector("input.task-name").value.trim();

  todoUtilities.createUpdateTasks(
    user.username,
    user.password,
    taskName,
    taskStatus,
    taskId,
    "put",
    `/${taskId}`
  );
});
