function generateColor() {
    return `#${Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, '0')}`;
}

function generatePalette() {
    const palette = document.querySelector('#palette');

    // Limpiar contenido anterior
    palette.innerHTML = '';

    for (let i = 0; i < 5; i++) {
        const color = generateColor();

        const colorDiv = document.createElement('div');
        colorDiv.className = 'color';
        colorDiv.style.backgroundColor = color;

        colorDiv.innerHTML = `<span class="color-code">${color}</span>`;

        colorDiv.addEventListener('click', () => {
            navigator.clipboard.writeText(color);

            const text = colorDiv.querySelector('.color-code');
            text.textContent = '¡Copiado!';

            setTimeout(() => {
                text.textContent = color;
            }, 1000);
        });

        palette.appendChild(colorDiv);
    }
}

document
    .querySelector('#generate-btn')
    .addEventListener('click', generatePalette);

// Generar al cargar
generatePalette();