const { ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', () => {
    // Inserta los estilos adicionales
    const style = document.createElement('style');
    style.innerHTML = `
        .custom-titlebar {
            width: 100%;
            height: 28px;
            background-color: rgba(0, 0, 0, 0.9);
            color: white;
            font-size: 16px;
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
        .close-button, .menu-button {
            color: white;
            border: none;
            background: none;
            padding: 0;
            position: absolute;
            cursor: pointer;
            -webkit-app-region: no-drag;
        }
        .close-button {
            right: 8px;
            top: 6px;
            background-color: rgba(255, 0, 0, 0.8);
            border-radius: 3px;
            padding: 2px 6px;
        }
        .close-button:hover {
            background-color: rgba(255, 0, 0, 1);
        }
        .menu-button {
            left: 8px;
            top: 6px;
            width: 20px;
            height: 16px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            cursor: pointer;
        }
        .menu-button div {
            width: 100%;
            height: 3px;
            background-color: white;
        }
        .dropdown-menu {
            display: none;
            position: absolute;
            top: 28px;
            left: 8px;
            background-color: white;
            color: black;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
            width: 150px;
            z-index: 100;
            flex-direction: column;
        }
        .dropdown-menu.show {
            display: flex;
        }
        .dropdown-menu button {
            background: none;
            border: none;
            padding: 10px;
            text-align: left;
            cursor: pointer;
            width: 100%;
            color: black;
        }
        .dropdown-menu button:hover {
            background-color: #f0f0f0;
        }
        .chat-container {
            position: absolute;
            top: 28px;
            left: 0;
            right: 0;
            bottom: 0;
            overflow: hidden;
        }
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

    const titleBar = document.createElement('div');
    titleBar.className = 'custom-titlebar';

    const titleText = document.createElement('span');
    titleText.id = 'titleText';
    titleText.textContent = 'Twitch Chat Viewer';
    titleBar.appendChild(titleText);

    // Botón Menú
    const menuButton = document.createElement('button');
    menuButton.className = 'menu-button';
    menuButton.innerHTML = '<div></div><div></div><div></div>';
    titleBar.appendChild(menuButton);

    // Menú desplegable
    const dropdownMenu = document.createElement('div');
    dropdownMenu.className = 'dropdown-menu';

    const configureOption = document.createElement('button');
    configureOption.textContent = 'Configurar';
    configureOption.onclick = () => {
        ipcRenderer.send('open-settings'); // Enviar evento al proceso principal
        dropdownMenu.classList.remove('show');
    };

    const changeChannelOption = document.createElement('button');
    changeChannelOption.textContent = 'Cambiar canal';
    changeChannelOption.onclick = () => {
        console.log('Cambiar canal seleccionado');
        dropdownMenu.classList.remove('show');
    };

    dropdownMenu.appendChild(configureOption);
    dropdownMenu.appendChild(changeChannelOption);
    titleBar.appendChild(dropdownMenu);

    menuButton.onclick = () => {
        dropdownMenu.classList.toggle('show');
    };

    // Botón de cierre
    const closeButton = document.createElement('button');
    closeButton.className = 'close-button';
    closeButton.textContent = 'X';
    closeButton.onclick = () => {
        ipcRenderer.send('close-window');
    };
    titleBar.appendChild(closeButton);

    document.body.appendChild(titleBar);

    const chatContainer = document.createElement('div');
    chatContainer.className = 'chat-container';
    document.body.appendChild(chatContainer);

    const iframe = document.createElement('iframe');
    chatContainer.appendChild(iframe);

    ipcRenderer.on('load-channel', (event, channel) => {
        iframe.src = `https://www.giambaj.it/twitch/jchat/v2/?channel=${encodeURIComponent(channel)}&fade=true&animate=true&hide_commands=true&hide_badges=true&font_size=12&theme=dark`;
        titleText.textContent = `Twitch Chat: ${channel}`;
    });

    ipcRenderer.on('hide-titlebar', () => {
        titleBar.classList.add('hidden');
    });
    ipcRenderer.on('show-titlebar', () => {
        titleBar.classList.remove('hidden');
    });

    ipcRenderer.on('update-background-color', (event, color) => {
        document.body.style.backgroundColor = color;
    });
});
