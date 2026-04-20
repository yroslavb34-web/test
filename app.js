const tg = window.Telegram.WebApp;
tg.expand();

let jobs = JSON.parse(localStorage.getItem('jobs')) || [];

function render() {
  const container = document.getElementById('jobs');
  container.innerHTML = '';

  jobs.forEach((job, index) => {
    const div = document.createElement('div');
    div.className = 'job';

    div.innerHTML = `
      <h3>${job.title}</h3>
      <p class="salary">💰 ${job.salary}</p>
      <button class="apply-btn" onclick="apply(${index})">
        Откликнуться
      </button>
    `;

    container.appendChild(div);
  });
}

function addJob() {
  const title = document.getElementById('title').value;
  const salary = document.getElementById('salary').value;
  const desc = document.getElementById('desc').value;

  jobs.push({ title, salary, desc });

  localStorage.setItem('jobs', JSON.stringify(jobs));

  render();

  document.getElementById('title').value = '';
  document.getElementById('salary').value = '';
  document.getElementById('desc').value = '';
  document.getElementById('form').style.display = 'none';
}

function apply(index) {
  alert('Ты откликнулся на: ' + jobs[index].title);
}

function showForm() {
  const form = document.getElementById('form');
  if (form) {
    form.style.display = 'block';
  }
}

render();