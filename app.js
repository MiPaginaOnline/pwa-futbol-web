// Datos mejorados de la aplicación de fútbol
const POSTS = Array.from({length: 12}).map((_, i) => {
  const users = [
    {name: 'cr7', fullName: 'Cristiano Ronaldo', verified: true},
    {name: 'messi', fullName: 'Lionel Messi', verified: true},
    {name: 'mbappe', fullName: 'Kylian Mbappé', verified: true},
    {name: 'haaland', fullName: 'Erling Haaland', verified: true},
    {name: 'futbol_total', fullName: 'Fútbol Total', verified: false},
    {name: 'goles_epicos', fullName: 'Goles Épicos', verified: false}
  ];
  
  const user = users[i % users.length];
  
  return {
    id: i + 1,
    user: user.name,
    fullName: user.fullName,
    verified: user.verified,
    caption: [
      '¡Qué golazo en el último minuto! ⚽🔥',
      'Asistencia perfecta para la victoria del equipo 🎯',
      'Entrenamiento duro para el próximo partido 💪',
      'Highlights del partido de ayer, ¡qué noche! 🌟',
      'Remate desde fuera del área que entró por la escuadra 🚀',
      'Celebrando la victoria con la afición 🙌',
      'Falta directa que se convirtió en gol 🎯',
      'Regate imposible que dejó a todos boquiabiertos 🤯',
      'Chilena que rozó el larguero, ¡casi es gol del año! 🌪️',
      'Penalti decisivo en los últimos minutos 😅',
      'Pase milimétrico que desequilibró el partido 🧠',
      'Celebración épica con los compañeros 🥳'
    ][i],
    img: `https://picsum.photos/seed/futbol${i+100}/640/480`,
    likes: Math.floor(Math.random() * 5000) + 1000,
    comments: Math.floor(Math.random() * 200) + 20,
    time: `${Math.floor(Math.random() * 23) + 1}h`,
    league: ['LaLiga', 'Premier League', 'Serie A', 'Bundesliga', 'Ligue 1', 'Champions'][i % 6],
    isVideo: i % 4 === 0
  };
});

// Estado de la aplicación
let appState = {
  currentTab: 'feed',
  likedPosts: new Set(),
  bookmarkedPosts: new Set(),
  comments: {}
};

// Elementos DOM
const app = document.getElementById('app');
const template = document.getElementById('post-template');
const installBtn = document.getElementById('installBtn');
const notification = document.getElementById('notification');
const navButtons = document.querySelectorAll('.nav-btn');

// Renderizar la aplicación
function render() {
  app.innerHTML = '';
  
  // Mostrar solo los posts en la pestaña de feed
  if (appState.currentTab === 'feed') {
    POSTS.forEach(post => {
      const node = template.content.cloneNode(true);
      const article = node.querySelector('.post');
      
      // Configurar datos del post
      article.querySelector('.avatar').src = `https://picsum.photos/40?random=${post.id}`;
      article.querySelector('.username').innerHTML = `
        @${post.user} 
        ${post.verified ? '<span class="verified" style="color: #3b82f6; margin-left: 2px;">✓</span>' : ''}
      `;
      article.querySelector('.meta').textContent = `${post.time} · ${post.league}`;
      article.querySelector('.media-img').src = post.img;
      article.querySelector('.post-caption').textContent = post.caption;
      article.querySelector('.like-btn .count').textContent = formatNumber(post.likes);
      article.querySelector('.comment-btn .count').textContent = formatNumber(post.comments);
      article.querySelector('.post-stats .stat:first-child strong').textContent = formatNumber(post.likes);
      article.querySelector('.post-stats .stat:last-child strong').textContent = formatNumber(post.comments);
      
      // Mostrar botón de play si es video
      if (post.isVideo) {
        article.querySelector('.play-btn').style.display = 'flex';
      }
      
      // Estado de like y bookmark
      if (appState.likedPosts.has(post.id)) {
        article.querySelector('.like-btn').classList.add('liked');
      }
      
      if (appState.bookmarkedPosts.has(post.id)) {
        article.querySelector('.bookmark-btn').classList.add('bookmarked');
      }
      
      // Eventos de interacción
      setupPostInteractions(article, post);
      
      app.appendChild(node);
    });
  } else {
    // Mostrar contenido para otras pestañas
    showTabContent();
  }
}

// Configurar interacciones del post
function setupPostInteractions(article, post) {
  // Like button
  const likeBtn = article.querySelector('.like-btn');
  likeBtn.addEventListener('click', () => {
    if (appState.likedPosts.has(post.id)) {
      post.likes -= 1;
      appState.likedPosts.delete(post.id);
      likeBtn.classList.remove('liked');
    } else {
      post.likes += 1;
      appState.likedPosts.add(post.id);
      likeBtn.classList.add('liked');
      
      // Animación
      likeBtn.animate([
        { transform: 'scale(1)' },
        { transform: 'scale(1.3)' },
        { transform: 'scale(1)' }
      ], { duration: 300 });
    }
    
    likeBtn.querySelector('.count').textContent = formatNumber(post.likes);
    article.querySelector('.post-stats .stat:first-child strong').textContent = formatNumber(post.likes);
  });
  
  // Comment button
  const commentBtn = article.querySelector('.comment-btn');
  commentBtn.addEventListener('click', () => openComments(post));
  
  // Share button
  const shareBtn = article.querySelector('.share-btn');
  shareBtn.addEventListener('click', () => sharePost(post));
  
  // Bookmark button
  const bookmarkBtn = article.querySelector('.bookmark-btn');
  bookmarkBtn.addEventListener('click', () => {
    if (appState.bookmarkedPosts.has(post.id)) {
      appState.bookmarkedPosts.delete(post.id);
      bookmarkBtn.classList.remove('bookmarked');
      showNotification('Post eliminado de guardados');
    } else {
      appState.bookmarkedPosts.add(post.id);
      bookmarkBtn.classList.add('bookmarked');
      showNotification('Post guardado');
    }
  });
  
  // Follow button
  const followBtn = article.querySelector('.follow-btn');
  followBtn.addEventListener('click', function() {
    if (this.textContent === 'Seguir') {
      this.textContent = 'Siguiendo';
      this.style.background = 'var(--primary)';
      this.style.color = 'white';
      showNotification(`Ahora sigues a @${post.user}`);
    } else {
      this.textContent = 'Seguir';
      this.style.background = 'transparent';
      this.style.color = 'var(--primary)';
      showNotification(`Dejaste de seguir a @${post.user}`);
    }
  });
}

// Abrir modal de comentarios
function openComments(post) {
  const modal = document.createElement('div');
  modal.className = 'comment-modal';
  
  // Obtener comentarios existentes o inicializar array vacío
  if (!appState.comments[post.id]) {
    appState.comments[post.id] = [];
  }
  
  modal.innerHTML = `
    <div class="comment-panel">
      <div class="comment-header">
        <strong>Comentarios — ${post.comments}</strong>
        <button class="close-btn">✕</button>
      </div>
      <div class="comments-list">
        ${appState.comments[post.id].length > 0 
          ? appState.comments[post.id].map(comment => `
            <div class="comment">
              <div class="comment-user">@${comment.user}</div>
              <div class="comment-text">${comment.text}</div>
            </div>
          `).join('')
          : '<div style="color: var(--muted); text-align: center; padding: 20px;">No hay comentarios aún</div>'
        }
      </div>
      <div class="comment-input">
        <input placeholder="Escribe un comentario..." />
        <button class="send-btn">Enviar</button>
      </div>
    </div>
  `;
  
  // Cerrar modal
  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.classList.contains('close-btn')) {
      modal.remove();
    }
  });
  
  // Enviar comentario
  const sendBtn = modal.querySelector('.send-btn');
  const input = modal.querySelector('input');
  
  sendBtn.addEventListener('click', () => {
    const text = input.value.trim();
    if (text) {
      // Añadir comentario
      appState.comments[post.id].push({
        user: 'tu_usuario',
        text: text
      });
      
      // Actualizar contador
      post.comments += 1;
      
      // Cerrar modal y recargar
      modal.remove();
      render();
      showNotification('Comentario publicado');
    }
  });
  
  // Enviar con Enter
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendBtn.click();
    }
  });
  
  document.body.appendChild(modal);
  input.focus();
}

// Compartir post
function sharePost(post) {
  if (navigator.share) {
    navigator.share({
      title: `Post de @${post.user} en Fútbol Feed`,
      text: post.caption,
      url: window.location.href
    }).then(() => {
      showNotification('Post compartido');
    }).catch(() => {
      showNotification('Error al compartir');
    });
  } else {
    // Fallback para navegadores sin soporte para share
    navigator.clipboard.writeText(`${post.caption} - Fútbol Feed`).then(() => {
      showNotification('Enlace copiado al portapapeles');
    });
  }
}

// Mostrar contenido de pestañas
function showTabContent() {
  let content = '';
  
  switch (appState.currentTab) {
    case 'explore':
      content = `
        <div class="tab-content">
          <h2 style="text-align: center; margin: 20px 0;">Explorar</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            ${Array.from({length: 6}).map((_, i) => `
              <div style="background: var(--card); border-radius: 12px; overflow: hidden;">
                <img src="https://picsum.photos/seed/explore${i}/300/200" style="width: 100%; height: 120px; object-fit: cover;">
                <div style="padding: 10px; font-size: 13px; font-weight: 600;">Tendencia #${i+1}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
      break;
      
    case 'upload':
      content = `
        <div class="tab-content" style="text-align: center; padding: 40px 20px;">
          <h2>Subir Contenido</h2>
          <p style="color: var(--muted); margin-bottom: 20px;">Comparte tus momentos futboleros</p>
          <button class="install-btn" style="margin: 0 auto;">
            <span class="btn-icon">📤</span>
            <span class="btn-text">Seleccionar Archivo</span>
          </button>
        </div>
      `;
      break;
      
    case 'profile':
      content = `
        <div class="tab-content">
          <div style="text-align: center; padding: 20px;">
            <img src="https://picsum.photos/100?random=profile" style="width: 80px; height: 80px; border-radius: 50%; border: 3px solid var(--accent);">
            <h2 style="margin: 10px 0 5px;">Tu Perfil</h2>
            <p style="color: var(--muted); margin: 0 0 20px;">@tu_usuario</p>
            <div style="display: flex; justify-content: center; gap: 20px; margin-bottom: 20px;">
              <div style="text-align: center;">
                <div style="font-weight: 700;">${POSTS.length}</div>
                <div style="font-size: 13px; color: var(--muted);">Posts</div>
              </div>
              <div style="text-align: center;">
                <div style="font-weight: 700;">${appState.likedPosts.size}</div>
                <div style="font-size: 13px; color: var(--muted);">Likes</div>
              </div>
              <div style="text-align: center;">
                <div style="font-weight: 700;">${appState.bookmarkedPosts.size}</div>
                <div style="font-size: 13px; color: var(--muted);">Guardados</div>
              </div>
            </div>
          </div>
        </div>
      `;
      break;
  }
  
  app.innerHTML = content;
}

// Formatear números (1.5K, 2.3M, etc.)
function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

// Mostrar notificación
function showNotification(message) {
  notification.textContent = message;
  notification.classList.add('show');
  
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

// Navegación entre pestañas
navButtons.forEach(button => {
  button.addEventListener('click', function() {
    // Remover clase activa de todos los botones
    navButtons.forEach(btn => btn.classList.remove('active'));
    
    // Añadir clase activa al botón clickeado
    this.classList.add('active');
    
    // Cambiar pestaña
    appState.currentTab = this.dataset.tab;
    
    // Renderizar contenido
    render();
  });
});

// Instalación de PWA
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  
  // Mostrar el botón de instalación
  installBtn.style.display = 'flex';
  
  // Mostrar notificación sobre la instalación
  setTimeout(() => {
    showNotification('¡Instala Fútbol Feed en tu dispositivo!');
  }, 2000);
});

installBtn.addEventListener('click', async () => {
  if (!deferredPrompt) {
    showNotification('La aplicación ya está instalada o no se puede instalar');
    return;
  }
  
  // Mostrar el prompt de instalación
  deferredPrompt.prompt();
  
  // Esperar a que el usuario responda
  const { outcome } = await deferredPrompt.userChoice;
  
  if (outcome === 'accepted') {
    showNotification('¡Fútbol Feed se está instalando!');
    installBtn.style.display = 'none';
  } else {
    showNotification('Instalación cancelada');
  }
  
  deferredPrompt = null;
});

// Verificar si la app ya está instalada
window.addEventListener('appinstalled', () => {
  installBtn.style.display = 'none';
  showNotification('¡Fútbol Feed instalado correctamente!');
});

// Registrar Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('SW registrado: ', registration);
      })
      .catch(registrationError => {
        console.log('Error en el SW: ', registrationError);
      });
  });
}

// Inicializar la aplicación
render();
