const tg = window.Telegram.WebApp;
tg.expand();

let jobs = JSON.parse(localStorage.getItem('jobs')) || [];
let currentJob = null;

/* переключение экранов */
function openScreen(screenId) {
  document.querySelectorAll('body > div').forEach(div => {
    div.classList.add('hidden');
    div.classList.remove('screen');
  });

  const screen = document.getElementById(screenId);
  screen.classList.remove('hidden');

  setTimeout(() => {
    screen.classList.add('screen');
  }, 10);

  if (screenId === 'jobsScreen') renderJobs();
}

/* отрисовка вакансий */
function renderJobs() {
  const container = document.getElementById('jobs');
  container.innerHTML = '';

  jobs.forEach((job, index) => {
    const div = document.createElement('div');
    div.className = 'job';

    div.innerHTML = `
      <h3>${job.title}</h3>
      <p>💰 ${job.salary}</p>
    `;

    div.onclick = () => openJob(index);

    container.appendChild(div);
  });
}

/* открыть вакансию */
function openJob(index) {
  currentJob = jobs[index];

  document.getElementById('jobTitle').innerText = currentJob.title;
  document.getElementById('jobSalary').innerText = "💰 " + currentJob.salary;
  document.getElementById('jobDesc').innerText = currentJob.desc;
  document.getElementById('jobContacts').innerText = "📞 " + currentJob.contacts;

  const img = document.getElementById('jobImage');

  if (currentJob.image) {
    img.src = currentJob.image;
    img.style.display = "block";
  } else {
    img.style.display = "none";
  }

  openScreen('jobScreen');
}

/* добавить вакансию */
function addJob() {
  const title = document.getElementById('title').value;
  const salary = document.getElementById('salary').value;
  const desc = document.getElementById('desc').value;
  const contacts = document.getElementById('contacts').value;

  const file = document.getElementById('image').files[0];

  if (file) {
    const reader = new FileReader();

    reader.onload = function(e) {
      saveJob(title, salary, desc, contacts, e.target.result);
    };

    reader.readAsDataURL(file);
  } else {
    saveJob(title, salary, desc, contacts, '');
  }
}

function saveJob(title, salary, desc, contacts, image) {
  jobs.push({ title, salary, desc, contacts, image });

  localStorage.setItem('jobs', JSON.stringify(jobs));

  openScreen('jobsScreen');
}

/* отклик */
function apply() {
  alert("Свяжитесь: " + currentJob.contacts);
}