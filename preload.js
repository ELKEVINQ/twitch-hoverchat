const { ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', () => {
    // Inyectar CSS para la barra superior y el contenido del chat
    const style = document.createElement('style');
    style.innerHTML = `
        /* Barra superior personalizada */
        .custom-titlebar {
            width: 100%;
            height: 28px; /* Reducir altura de la barra superior */
            background-color: rgba(0, 0, 0, 0.9);
            color: white;
            font-size: 16px; /* Reducir tamaño de la fuente a 16px */
            display: flex;
            align-items: center;
            justify-content: center;
            position: fixed;
            top: 0;
            left: 0;
            -webkit-app-region: drag;
            z-index: 1;
            transition: opacity 0.3s;
        }
        .custom-titlebar.hidden {
            opacity: 0;
            pointer-events: none;
        }
        .close-button {
            color: white;
            background-color: rgba(255, 0, 0, 0.8);
            border: none;
            border-radius: 3px;
            padding: 1px 6px;
            font-size: 14px;
            position: absolute;
            right: 8px;
            top: 6px;
            cursor: pointer;
            -webkit-app-region: no-drag;
        }
        .close-button:hover {
            background-color: rgba(255, 0, 0, 1);
        }

        /* Contenedor del chat */
        .chat-container {
            position: absolute;
            top: 28px; /* Ajustar espacio debajo de la barra superior */
            left: 0;
            right: 0;
            bottom: 0;
            overflow: hidden;
        }

        /* Escalado del iframe del chat */
        iframe {
            border: none;
            width: 333.33%;
            height: 333.33%;
            transform: scale(0.3);
            transform-origin: top left;
            overflow: hidden;
        }
    `;
    document.head.appendChild(style);

    // Crear barra superior
    const titleBar = document.createElement('div');
    titleBar.className = 'custom-titlebar';

    // Texto de la cabecera
    const titleText = document.createElement('span');
    titleText.id = 'titleText';
    titleText.textContent = 'Twitch Chat Viewer';
    titleBar.appendChild(titleText);

    // Botón de cierre
    const closeButton = document.createElement('button');
    closeButton.className = 'close-button';
    closeButton.textContent = 'X';
    closeButton.onclick = () => {
        ipcRenderer.send('close-window');
    };
    titleBar.appendChild(closeButton);

    document.body.appendChild(titleBar);

    // Contenedor del chat
    const chatContainer = document.createElement('div');
    chatContainer.className = 'chat-container';
    document.body.appendChild(chatContainer);

    const iframe = document.createElement('iframe');
    chatContainer.appendChild(iframe);

    // Escuchar el canal desde el proceso principal y cargarlo en el iframe
    ipcRenderer.on('load-channel', (event, channel) => {
        // Actualizar la URL del iframe con el canal
        iframe.src = `https://www.giambaj.it/twitch/jchat/v2/?channel=${encodeURIComponent(channel)}&fade=true&animate=true&hide_commands=true&hide_badges=true&font_size=12&theme=dark`;
        
        // Actualizar el texto de la cabecera con el nombre del canal
        titleText.textContent = `Twitch Chat: ${channel}`;
    });

    // Mostrar u ocultar la barra superior según el foco
    ipcRenderer.on('hide-titlebar', () => {
        titleBar.classList.add('hidden');
    });
    ipcRenderer.on('show-titlebar', () => {
        titleBar.classList.remove('hidden');
    });
});
