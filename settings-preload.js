const { ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', () => {
    const transparencySlider = document.getElementById('transparency');
    const colorPicker = document.getElementById('backgroundColor');
    const saveButton = document.getElementById('saveButton');

    // Recibe los valores actuales y los aplica a los sliders y al color
    ipcRenderer.on('load-settings', (event, settings) => {
        transparencySlider.value = settings.transparency;
        colorPicker.value = settings.backgroundColor;
    });

    function sendSettings() {
        const settings = {
            transparency: transparencySlider.value,
            backgroundColor: colorPicker.value,
        };
        ipcRenderer.send('update-settings', settings); // Envía la configuración al proceso principal
    }

    saveButton.addEventListener('click', sendSettings); // Llama a sendSettings al hacer clic en guardar
});
