// script.js

document.addEventListener('DOMContentLoaded', () => {
  // ===== 1. ДИНАМИЧЕСКИЙ ФОН: параллакс + смена слоёв =====
  const light = document.getElementById('bg-light');
  const dark  = document.getElementById('bg-dark');
  
  if (light && dark) {
    const pClouds   = document.getElementById('parallax-clouds');
    const pTrees    = document.getElementById('parallax-trees');
    const pTendrils = document.getElementById('parallax-tendrils');

    let currentOpacity = 0, targetOpacity = 0;
    let currentScrollY = 0, targetScrollY = 0;

    function smoothUpdate() {
      targetScrollY = window.scrollY;
      currentScrollY += (targetScrollY - currentScrollY) * 0.08;

      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(1, Math.max(0, targetScrollY / docHeight)) : 0;
      
      // Переход начинается с 20% скролла, заканчивается к 65%
      let targetDark = 0;
      if (progress > 0.20) {
        targetDark = (progress - 0.20) / 0.45;
      }
      targetOpacity = Math.min(1, Math.max(0, targetDark));
      currentOpacity += (targetOpacity - currentOpacity) * 0.05;

      light.style.opacity = (1 - currentOpacity).toFixed(3);
      dark.style.opacity  = currentOpacity.toFixed(3);

      // Параллакс слоёв
      if (pClouds)   pClouds.style.transform   = `translateY(${currentScrollY * 0.15}px)`;
      if (pTrees)    pTrees.style.transform    = `translateY(${currentScrollY * 0.25}px)`;
      if (pTendrils) pTendrils.style.transform = `translateY(${currentScrollY * -0.10}px)`;

      requestAnimationFrame(smoothUpdate);
    }
    smoothUpdate();
  }

  // ===== 2. АККОРДЕОН ПЕРСОНАЖЕЙ =====
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      const isOpen = target.classList.contains('open');
      
      // Закрываем все открытые детали
      document.querySelectorAll('.char-details.open').forEach(el => {
        el.classList.remove('open');
        const b = el.parentElement.querySelector('.toggle-btn');
        if (b) b.textContent = 'Подробнее';
      });

      // Если был закрыт, открываем текущий
      if (!isOpen) {
        target.classList.add('open');
        btn.textContent = 'Свернуть';
      }
    });
  });

  // ===== 3. ЛОГИКА КОММЕНТАРИЕВ (ОБСУЖДЕНИЕ) =====
  const discussionForm = document.getElementById('discussion-form');
  const discussionList = document.getElementById('discussion-list');
  const STORAGE_KEY = 'wiege_discussion_comments';

  // Функция безопасного экранирования HTML (защита от XSS)
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Получение комментариев из памяти браузера
  function getComments() {
    const comments = localStorage.getItem(STORAGE_KEY);
    return comments ? JSON.parse(comments) : [];
  }

  // Сохранение комментариев в память браузера
  function saveComments(comments) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
  }

  // Отрисовка комментариев на странице
  function renderComments() {
    const comments = getComments();
    discussionList.innerHTML = ''; // Очищаем список перед отрисовкой

    if (comments.length === 0) {
      discussionList.innerHTML = '<p class="no-comments" style="color: #888; font-style: italic;">Пока нет комментариев. Будьте первым!</p>';
      return;
    }

    comments.forEach(comment => {
      const commentEl = document.createElement('div');
      commentEl.className = 'comment-item';
      const date = new Date(comment.timestamp).toLocaleString('ru-RU', {
        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
      
      commentEl.innerHTML = `
        <div class="comment-header">
          <strong>${escapeHtml(comment.author)}</strong>
          <span class="comment-date">${date}</span>
        </div>
        <div class="comment-body">
          ${escapeHtml(comment.message).replace(/\n/g, '<br>')}
        </div>
      `;
      discussionList.appendChild(commentEl);
    });
  }

  // Обработчик отправки формы
  if (discussionForm) {
    discussionForm.addEventListener('submit', (e) => {
      e.preventDefault(); // Предотвращаем перезагрузку страницы

      const authorInput = document.getElementById('author');
      const messageInput = document.getElementById('message');

      const author = authorInput.value.trim();
      const message = messageInput.value.trim();

      if (author && message) {
        const comments = getComments();
        const newComment = {
          author: author,
          message: message,
          timestamp: Date.now()
        };

        comments.unshift(newComment); // Добавляем новый комментарий в начало списка
        saveComments(comments);
        
        renderComments(); // Обновляем список на странице
        
        // Очищаем форму
        authorInput.value = '';
        messageInput.value = '';
      }
    });
  }

  // Запускаем отрисовку комментариев при загрузке страницы
  renderComments();
});

// Если у вас есть функция AutoScale, убедитесь, что она объявлена где-то в коде
// window.addEventListener("resize", AutoScale);
// AutoScale(); 