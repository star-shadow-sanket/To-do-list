/**
 * DevCraft — script.js
 * Handles: Loader · Navbar · Smooth scroll · Counter animation
 *          Contact form validation · To-Do List (LocalStorage)
 *          Scroll reveals · Back-to-top
 */

'use strict';

/* =============================================
   UTILITY HELPERS
   ============================================= */

/** Shorthand for querySelector */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/** Format today's date as "Mar 24" */
function todayLabel() {
  return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/* =============================================
   1. LOADING SCREEN
   ============================================= */
window.addEventListener('load', () => {
  const loader = $('#loader');
  // Give a slight artificial delay so the animation is visible
  setTimeout(() => {
    loader.classList.add('hidden');
    // Start reveal animations after loader hides
    triggerReveal();
  }, 900);
});

/* =============================================
   2. NAVBAR — scroll state + hamburger
   ============================================= */
const navbar    = $('#navbar');
const hamburger = $('#hamburger');
const navLinks  = $('#navLinks');
const allLinks  = $$('.nav-link');

// Scrolled class
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 30);
  updateActiveLink();
  toggleBackToTop();
});

// Hamburger toggle
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

// Close menu on link click
allLinks.forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

// Highlight active nav link based on scroll position
function updateActiveLink() {
  const sections = $$('section[id]');
  let current = '';
  sections.forEach(sec => {
    const top = sec.getBoundingClientRect().top;
    if (top <= 120) current = sec.id;
  });
  allLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
}

/* =============================================
   3. BACK-TO-TOP BUTTON
   ============================================= */
const backToTop = $('#backToTop');

function toggleBackToTop() {
  backToTop.classList.toggle('show', window.scrollY > 500);
}

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* =============================================
   4. SCROLL REVEAL ANIMATION
   ============================================= */
function triggerReveal() {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger delay for sibling elements
        entry.target.style.transitionDelay = `${i * 60}ms`;
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  $$('.reveal').forEach(el => revealObserver.observe(el));
}

/* =============================================
   5. COUNTER ANIMATION (hero stats)
   ============================================= */
function animateCounters() {
  $$('.stat-num[data-target]').forEach(counter => {
    const target = +counter.dataset.target;
    const duration = 1400;
    const step = target / (duration / 16);
    let current = 0;

    const tick = () => {
      current = Math.min(current + step, target);
      counter.textContent = Math.floor(current);
      if (current < target) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

// Trigger counters when hero is visible
const heroObs = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    animateCounters();
    heroObs.disconnect();
  }
}, { threshold: 0.3 });
heroObs.observe($('.hero-stats'));

/* =============================================
   6. CONTACT FORM VALIDATION
   ============================================= */
const form      = $('#contactForm');
const nameInput = $('#name');
const emailInput= $('#email');
const msgInput  = $('#message');
const submitBtn = $('#submitBtn');
const toast     = $('#formToast');

/** Show field error */
function showError(input, errEl, msg) {
  input.classList.remove('valid');
  input.classList.add('invalid');
  errEl.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${msg}`;
}

/** Show field success */
function showValid(input, errEl) {
  input.classList.remove('invalid');
  input.classList.add('valid');
  errEl.textContent = '';
}

/** Clear field state */
function clearState(input, errEl) {
  input.classList.remove('valid', 'invalid');
  errEl.textContent = '';
}

/** Validate email with regex */
function isValidEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
}

/** Validate all fields, return true if form is valid */
function validateForm() {
  let valid = true;

  // Name
  const nameVal = nameInput.value.trim();
  if (!nameVal) {
    showError(nameInput, $('#nameError'), 'Name is required.');
    valid = false;
  } else if (nameVal.length < 2) {
    showError(nameInput, $('#nameError'), 'Name must be at least 2 characters.');
    valid = false;
  } else {
    showValid(nameInput, $('#nameError'));
  }

  // Email
  const emailVal = emailInput.value.trim();
  if (!emailVal) {
    showError(emailInput, $('#emailError'), 'Email address is required.');
    valid = false;
  } else if (!isValidEmail(emailVal)) {
    showError(emailInput, $('#emailError'), 'Please enter a valid email address.');
    valid = false;
  } else {
    showValid(emailInput, $('#emailError'));
  }

  // Message
  const msgVal = msgInput.value.trim();
  if (!msgVal) {
    showError(msgInput, $('#messageError'), 'Message cannot be empty.');
    valid = false;
  } else if (msgVal.length < 10) {
    showError(msgInput, $('#messageError'), 'Message must be at least 10 characters.');
    valid = false;
  } else {
    showValid(msgInput, $('#messageError'));
  }

  return valid;
}

/** Inline (live) validation on blur */
[nameInput, emailInput, msgInput].forEach(input => {
  input.addEventListener('blur', () => validateForm());
  input.addEventListener('input', () => {
    // Clear error as user types
    if (input.classList.contains('invalid')) validateForm();
  });
});

/** Show toast message */
function showToast(msg, type) {
  toast.className = `form-toast show ${type}`;
  toast.innerHTML = `<i class="fa-solid fa-${type === 'success' ? 'circle-check' : 'triangle-exclamation'}"></i> ${msg}`;
  setTimeout(() => {
    toast.classList.remove('show');
  }, 5000);
}

/** Form submit */
form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  // Loading state
  submitBtn.classList.add('loading');
  submitBtn.disabled = true;

  // Simulate async submission (replace with real fetch in production)
  setTimeout(() => {
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;

    // Reset form
    form.reset();
    [nameInput, emailInput, msgInput].forEach(inp => clearState(inp, $(`#${inp.id}Error`)));

    showToast('Message sent! I\'ll get back to you within 24 hours.', 'success');
  }, 1800);
});

/* =============================================
   7. TO-DO LIST
   ============================================= */
const taskList     = $('#taskList');
const taskInput    = $('#taskInput');
const addTaskBtn   = $('#addTaskBtn');
const taskCountEl  = $('#taskCount');
const emptyState   = $('#emptyState');
const clearCompBtn = $('#clearCompleted');
const filterBtns   = $$('.filter-btn');

/** Current active filter */
let currentFilter = 'all';

/* --- LocalStorage helpers --- */

function getTasks() {
  return JSON.parse(localStorage.getItem('devcraft_tasks') || '[]');
}

function saveTasks(tasks) {
  localStorage.setItem('devcraft_tasks', JSON.stringify(tasks));
}

/* --- Core task operations --- */

/** Add a new task */
function addTask(text) {
  const tasks = getTasks();
  const task = {
    id: Date.now(),
    text: text.trim(),
    completed: false,
    date: todayLabel()
  };
  tasks.unshift(task); // newest first
  saveTasks(tasks);
  renderTasks();
  updateFooter();
}

/** Toggle task completed state */
function toggleTask(id) {
  const tasks = getTasks().map(t =>
    t.id === id ? { ...t, completed: !t.completed } : t
  );
  saveTasks(tasks);
  renderTasks();
  updateFooter();
}

/** Delete a task (with exit animation) */
function deleteTask(id) {
  const item = taskList.querySelector(`[data-id="${id}"]`);
  if (item) {
    item.classList.add('removing');
    item.addEventListener('animationend', () => {
      const tasks = getTasks().filter(t => t.id !== id);
      saveTasks(tasks);
      renderTasks();
      updateFooter();
    }, { once: true });
  }
}

/** Clear all completed tasks */
clearCompBtn.addEventListener('click', () => {
  const tasks = getTasks().filter(t => !t.completed);
  saveTasks(tasks);
  renderTasks();
  updateFooter();
});

/* --- Rendering --- */

/** Build a single task <li> element */
function buildTaskEl(task) {
  const li = document.createElement('li');
  li.className = `task-item${task.completed ? ' completed' : ''}`;
  li.setAttribute('data-id', task.id);

  li.innerHTML = `
    <button class="task-check" aria-label="Toggle complete">
      <i class="fa-solid fa-check"></i>
    </button>
    <span class="task-text">${escapeHTML(task.text)}</span>
    <span class="task-date">${task.date}</span>
    <button class="task-delete" aria-label="Delete task">
      <i class="fa-solid fa-trash-can"></i>
    </button>
  `;

  // Toggle
  li.querySelector('.task-check').addEventListener('click', () => toggleTask(task.id));
  // Delete
  li.querySelector('.task-delete').addEventListener('click', () => deleteTask(task.id));

  return li;
}

/** Render filtered task list */
function renderTasks() {
  const tasks = getTasks();
  const filtered = tasks.filter(t => {
    if (currentFilter === 'active')    return !t.completed;
    if (currentFilter === 'completed') return t.completed;
    return true;
  });

  // Preserve removing items during animation
  const removingIds = new Set(
    $$('.task-item.removing', taskList).map(el => +el.dataset.id)
  );

  taskList.innerHTML = '';
  filtered.forEach(task => {
    if (!removingIds.has(task.id)) {
      taskList.appendChild(buildTaskEl(task));
    }
  });

  // Empty state
  const all = getTasks();
  const hasItems = currentFilter === 'all' ? all.length > 0 : filtered.length > 0;
  emptyState.classList.toggle('show', !hasItems);
}

/** Update footer count label */
function updateFooter() {
  const active = getTasks().filter(t => !t.completed).length;
  taskCountEl.textContent = `${active} task${active !== 1 ? 's' : ''} left`;
}

/* --- Input handling --- */

function handleAddTask() {
  const text = taskInput.value.trim();
  if (!text) {
    taskInput.focus();
    taskInput.classList.add('invalid');
    setTimeout(() => taskInput.classList.remove('invalid'), 1200);
    return;
  }
  addTask(text);
  taskInput.value = '';
  taskInput.focus();
}

addTaskBtn.addEventListener('click', handleAddTask);

taskInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleAddTask();
});

/* --- Filter tabs --- */
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

/* --- XSS protection --- */
function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* --- Seed default tasks if storage is empty --- */
(function seedTasks() {
  if (getTasks().length === 0) {
    const defaults = [
      'Create a contact form with CSS ✨',
      'Add JavaScript form validation 🛡️',
      'Build responsive layout with Flexbox + Grid 📐',
      'Implement To-Do List with LocalStorage 💾',
    ];
    const tasks = defaults.map((text, i) => ({
      id: Date.now() + i,
      text,
      completed: i < 2,  // first two pre-completed
      date: todayLabel()
    }));
    saveTasks(tasks);
  }
})();

/* --- Initial render --- */
renderTasks();
updateFooter();

/* =============================================
   8. FOOTER YEAR
   ============================================= */
$('#year').textContent = new Date().getFullYear();