// App JS: feed estático + likes + modal comments + PWA install prompt
})
}


function openComments(post){
const modal = document.createElement('div')
modal.className = 'comment-modal'
modal.innerHTML = `
<div class="comment-panel">
<strong>Comentarios — @${post.user}</strong>
<div class="comments-list" style="margin-top:8px;color:var(--muted)">No hay comentarios (demo)</div>
<div class="comment-input">
<input placeholder="Escribe un comentario..." />
<button class="send">Enviar</button>
</div>
</div>
`
modal.addEventListener('click', (e)=>{ if(e.target === modal) modal.remove() })
modal.querySelector('.send').addEventListener('click', ()=>{
const input = modal.querySelector('input')
const list = modal.querySelector('.comments-list')
if(input.value.trim()){ const p = document.createElement('div'); p.textContent = `Tú: ${input.value}`; p.style.marginTop='8px'; list.appendChild(p); input.value=''}
})
document.body.appendChild(modal)
}


render()


// PWA install prompt handling
let deferredPrompt
const installBtn = document.getElementById('installBtn')
window.addEventListener('beforeinstallprompt', (e)=>{
e.preventDefault()
deferredPrompt = e
installBtn.style.display = 'inline-block'
})
installBtn.addEventListener('click', async ()=>{
if(deferredPrompt){
deferredPrompt.prompt()
const choice = await deferredPrompt.userChoice
if(choice.outcome === 'accepted') console.log('Usuario aceptó la instalación')
deferredPrompt = null
installBtn.style.display = 'none'
}
})


// register service worker
if('serviceWorker' in navigator){
navigator.serviceWorker.register('/service-worker.js').then(()=>console.log('SW registrado'))
}


// simple share
if(navigator.share){
document.addEventListener('click', (e)=>{
if(e.target.classList.contains('share-btn')){
const article = e.target.closest('.post')
const title = article.querySelector('.post-caption').textContent
navigator.share({title: 'Fútbol Feed', text: title, url: location.href})
}
})
}
