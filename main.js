//The function uses the document.location.hash property to obtain the hash part of the current URL.
//The replace() is then called on this value to replace any occurrences of /#/ at the beginning of the string with an empty string ('')
const getURLHash = () => document.location.hash.replace(/^#\//, '');

//When the event is triggered, the callback function checks whether the target element
//If the target element matches the selector, the handler function is called with the target element as its argument
//This pattern is useful when we have many child elements that need to respond to the same event in a similar way
function delegate(el, selector, event, handler) {
  el.addEventListener(event, (e) => {
    if (e.target.matches(selector)) handler(e, el);
  });
}

//returns an array of todos that are not completed.
const filterNotCompletedTodos = (todos) => todos.filter((todo) => !todo.completed);

//Create a new list items
function createTodoItemEl({ value, id, completed }) {
  const li = document.createElement('li');
  li.dataset.id = id;
  li.className = 'py-[16px] group px-[20px] border-solid border-b-2 border-gray-300 flex items-center justify-between';
  li.insertAdjacentHTML(
    //'afterbegin' means that the new HTML code will be inserted as the first child of the element
    //The i element has a data-todo attribute with a value of "toggle".
    //if the property is true, the bx-check-square class is applied; otherwise, the bx-square class is applied.
    'afterbegin',
    ` 
      <div class="flex items-center w-full">
        <i data-todo="toggle" class='bx ${completed ? 'bx-check-square' : 'bx-square'} text-[30px] cursor-pointer'></i>
        <div contenteditable="true" data-todo="value" class="pl-[10px] w-full ${completed ? 'line-through' : ''}"></div>
      </div>
      <i data-todo="remove" class='bx bx-trash text-[30px] cursor-pointer invisible group-hover:visible'></i>
    `
    // i element is used as a delete button.
  );
  // Sets the text content of that element to the value of the value parameter.
  li.querySelector('[data-todo="value"]').textContent = value;
  return li;
}

function App() {
  // Key for the data stored in the browser's local storage
  const LOCAL_STORAGE_KEY = 'todos';
  let todos = [];
  const inputEl = document.getElementById('input');
  const listEl = document.getElementById('list');
  const countEl = document.getElementById('count');
  const eventTarget = new EventTarget();

  // Saving the todos array to the browser's local storage
  function saveTodos() {
    //serializes the todos array into a stringified JSON format and stores it in the local storage under the key LOCAL_STORAGE_KEY.
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(todos));
  }

  function renderTodos() {
    //filter may contain a string such as "all", "active", or "completed"
    const filter = getURLHash();
    
    // Creating a copy of the todos array, any changes made to the filteredTodos array will not affect the original todos array.
    let filterTodos = [...todos];
    
    if (filter === 'active') filterTodos = todos.filter((todo) => !todo.completed);
    else if (filter === 'completed') filterTodos = todos.filter((todo) => todo.completed);
    
    //count items is not completed in todos array
    countEl.innerHTML = `${filterNotCompletedTodos(todos).length} items left`;

    //updates the list of to-do items displayed on the page based on the current filter
    listEl.replaceChildren(...filterTodos.map((todo) => createTodoItemEl(todo)));

    //adds checked CSS classes to list element
    //If it matches, it adds the checked CSS class to it using classList.add method
    //If it matches, it adds the checked CSS class to it using classList.add method, filter being selected
    //If it doesn't match, it removes the checked CSS class using classList.remove method, filter being unselected
    document.querySelectorAll(`[data-todo="filters"] a`).forEach((el) => {
      if (el.matches(`[href="#/${filter}"]`)) {
        el.classList.add('checked');
      } else {
        el.classList.remove('checked');
      }
    });
  }

  //Reading the todos data from the local storage of the browser.
  //return null if the key doesn't exist to default to an empty array [] instead.
  function readTodosInStorage() {
    todos = JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
  }
  
  //enter to create a new todo list
  inputEl.addEventListener('keyup', (event) => {
    if ((event.key === 'Enter' || event.keyCode === 13) && inputEl.value.trim() !== '') {
      const newTodo = { value: inputEl.value, id: crypto.randomUUID(), completed: false };
      todos.push(newTodo);
      const todoEl = createTodoItemEl(newTodo);
      eventTarget.dispatchEvent(new CustomEvent('save'));
    }
  });

  //When click square If a match is found, the code creates a new object that is a copy of the matched todo item,
  //but with its completed property toggled to the opposite of its current value using the ! operator
  //If no match is found, the code returns the original todo item unchanged.
  //Check items of to do list is completed
  delegate(listEl, '[data-todo="toggle"]', 'click', (e) => {
    const el = e.target.closest('[data-id]');
    todos = todos.map((todo) => (todo.id === el.dataset.id ? { ...todo, completed: !todo.completed } : todo));
    eventTarget.dispatchEvent(new CustomEvent('save'));
  });

  //Removes the todo item from the list
  delegate(listEl, '[data-todo="remove"]', 'click', (e) => {
    const el = e.target.closest('[data-id]');
    todos = todos.filter((todo) => todo.id !== el.dataset.id);
    eventTarget.dispatchEvent(new CustomEvent('save'));
  });

  //edit the value of a todo item by clicking on its input field, typing a new value, and pressing the "Enter" key
  delegate(listEl, '[data-todo="value"]', 'keydown', (e) => {
    const el = e.target.closest('[data-id]');
    if (event.keyCode === 13) {
      e.preventDefault();
      const content = el.querySelector('[data-todo="value"]').textContent;
      todos = todos.map((todo) => (todo.id === el.dataset.id ? { ...todo, value: content } : todo));
      eventTarget.dispatchEvent(new CustomEvent('save'));
    }
  });

  eventTarget.addEventListener('save', () => {
    saveTodos();
    renderTodos();
  });

  window.addEventListener('hashchange', () => {
    renderTodos();
  });

  readTodosInStorage();
  renderTodos();
}

App();