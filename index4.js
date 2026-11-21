const questionList = document.getElementById('question-list');
const emptyMessage = document.getElementById('empty-message');
const newQuestionBtn = document.getElementById('new-question-btn');
const searchInput = document.getElementById('search-input');

const questionView = document.getElementById('question-view');
const questionForm = document.getElementById('question-form');
const questionTitleInput = document.getElementById('question-title');
const questionTextInput = document.getElementById('question-text');

const detailView = document.getElementById('detail-view');
const detailTitle = document.getElementById('detail-title');
const detailQuestion = document.getElementById('detail-question');
const detailVotes = document.getElementById('detail-votes');
const resolveBtn = document.getElementById('resolve-btn');
const responseList = document.getElementById('response-list');
const noResponses = document.getElementById('no-responses');
const responseForm = document.getElementById('response-form');
const responseNameInput = document.getElementById('response-name');
const responseCommentInput = document.getElementById('response-comment');

let questions = [];
let selectedId = null;

const UP_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
  '<polyline points="6 15 12 9 18 15"></polyline>' +
  '</svg>';

const DOWN_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
  '<polyline points="6 9 12 15 18 9"></polyline>' +
  '</svg>';

function sortByVotes(list) {
  return list.slice().sort(function (a, b) {
    return b.votes - a.votes;
  });
}

function createVoteBox(item, onChange) {
  const box = document.createElement('div');
  box.className = 'vote-box';

  const up = document.createElement('button');
  up.type = 'button';
  up.className = 'vote-btn up';
  up.setAttribute('aria-label', 'Upvote');
  up.innerHTML = UP_SVG;
  up.addEventListener('click', function () {
    item.votes += 1;
    onChange();
  });

  const count = document.createElement('div');
  count.className = 'vote-count';
  count.textContent = item.votes;

  const down = document.createElement('button');
  down.type = 'button';
  down.className = 'vote-btn down';
  down.setAttribute('aria-label', 'Downvote');
  down.innerHTML = DOWN_SVG;
  down.addEventListener('click', function () {
    item.votes -= 1;
    onChange();
  });

  box.appendChild(up);
  box.appendChild(count);
  box.appendChild(down);

  return box;
}

function getVisibleQuestions() {
  const term = searchInput.value.trim().toLowerCase();

  const matches = questions.filter(function (q) {
    if (!term) {
      return true;
    }
    return (
      q.title.toLowerCase().includes(term) ||
      q.text.toLowerCase().includes(term)
    );
  });

  return sortByVotes(matches);
}

function refreshVotes() {
  renderQuestionList();

  const q = questions.find(function (item) {
    return item.id === selectedId;
  });

  if (q) {
    renderDetailVotes(q);
    renderResponses(q);
  }
}

function renderDetailVotes(q) {
  detailVotes.innerHTML = '';
  detailVotes.appendChild(createVoteBox(q, refreshVotes));
}

function renderQuestionList() {
  questionList.innerHTML = '';

  const visible = getVisibleQuestions();

  visible.forEach(function (q) {
    const li = document.createElement('li');
    li.className = 'question-item' + (q.id === selectedId ? ' active' : '');

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'question-open';

    const title = document.createElement('div');
    title.className = 'item-title';
    title.textContent = q.title;

    const text = document.createElement('div');
    text.className = 'item-text';
    text.textContent = q.text;

    btn.appendChild(title);
    btn.appendChild(text);
    btn.addEventListener('click', function () {
      showQuestion(q.id);
    });

    li.appendChild(createVoteBox(q, refreshVotes));
    li.appendChild(btn);
    questionList.appendChild(li);
  });

  if (questions.length === 0) {
    emptyMessage.textContent = 'No questions yet.';
    emptyMessage.style.display = 'block';
  } else if (visible.length === 0) {
    emptyMessage.textContent = 'No match found.';
    emptyMessage.style.display = 'block';
  } else {
    emptyMessage.style.display = 'none';
  }
}

function renderResponses(q) {
  responseList.innerHTML = '';

  sortByVotes(q.responses).forEach(function (r) {
    const li = document.createElement('li');
    li.className = 'response-item';

    const body = document.createElement('div');
    body.className = 'response-body';

    const name = document.createElement('div');
    name.className = 'response-name';
    name.textContent = r.name;

    const comment = document.createElement('div');
    comment.className = 'response-comment';
    comment.textContent = r.comment;

    body.appendChild(name);
    body.appendChild(comment);

    li.appendChild(createVoteBox(r, refreshVotes));
    li.appendChild(body);
    responseList.appendChild(li);
  });

  noResponses.style.display = q.responses.length === 0 ? 'block' : 'none';
}

function showQuestionForm() {
  selectedId = null;
  detailView.hidden = true;
  questionView.hidden = false;
  renderQuestionList();
}

function showQuestion(id) {
  const q = questions.find(function (item) {
    return item.id === id;
  });

  if (!q) {
    return;
  }

  selectedId = id;
  questionView.hidden = true;
  detailView.hidden = false;
  detailTitle.textContent = q.title;
  detailQuestion.textContent = q.text;
  renderDetailVotes(q);
  renderResponses(q);
  renderQuestionList();
}

questionForm.addEventListener('submit', function (event) {
  event.preventDefault();

  const title = questionTitleInput.value.trim();
  const text = questionTextInput.value.trim();

  if (!title || !text) {
    return;
  }

  questions.push({
    id: Date.now().toString() + Math.random().toString(36).slice(2, 7),
    title: title,
    text: text,
    votes: 0,
    responses: []
  });

  questionForm.reset();
  renderQuestionList();
});

responseForm.addEventListener('submit', function (event) {
  event.preventDefault();

  const name = responseNameInput.value.trim();
  const comment = responseCommentInput.value.trim();
  const q = questions.find(function (item) {
    return item.id === selectedId;
  });

  if (!q || !name || !comment) {
    return;
  }

  q.responses.push({ name: name, comment: comment, votes: 0 });
  responseForm.reset();
  renderResponses(q);
});

resolveBtn.addEventListener('click', function () {
  questions = questions.filter(function (item) {
    return item.id !== selectedId;
  });
  showQuestionForm();
});

newQuestionBtn.addEventListener('click', showQuestionForm);

searchInput.addEventListener('input', renderQuestionList);

renderQuestionList();
