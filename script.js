let currentSize = 6;          
let currentFormat = 'hex';   
let currentColors = [];       
let savedPalettes = [];      

const paletteEl    = document.getElementById('palette');
const savedListEl  = document.getElementById('saved-list');
const savedCountEl = document.getElementById('saved-count');
const toastEl      = document.getElementById('toast');


function randomChannel() {
    return Math.floor(Math.random() * 256);
}

function generateColor() {
    return {
        r: randomChannel(),
        g: randomChannel(),
        b: randomChannel()
    };
}

function toHex({ r, g, b }) {
    const hex = (value) => value.toString(16).padStart(2, '0').toUpperCase();
    return `#${hex(r)}${hex(g)}${hex(b)}`;
}

function toHsl({ r, g, b }) {
    
    const rn = r / 255;
    const gn = g / 255;
    const bn = b / 255;

    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    const delta = max - min;

    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (delta !== 0) {
        s = l > 0.5
            ? delta / (2 - max - min)
            : delta / (max + min);

        switch (max) {
            case rn: h = ((gn - bn) / delta + (gn < bn ? 6 : 0)) / 6; break;
            case gn: h = ((bn - rn) / delta + 2) / 6; break;
            case bn: h = ((rn - gn) / delta + 4) / 6; break;
        }
    }

    const hDeg = Math.round(h * 360);
    const sPct = Math.round(s * 100);
    const lPct = Math.round(l * 100);

    return `hsl(${hDeg}, ${sPct}%, ${lPct}%)`;
}

function colorLabel(color) {
    return currentFormat === 'hex' ? toHex(color) : toHsl(color);
}

function toRgbString({ r, g, b }) {
    return `rgb(${r}, ${g}, ${b})`;
}

function generatePalette() {
    currentColors = Array.from({ length: currentSize }, generateColor);
    renderPalette();
}

function renderPalette() {
  
    paletteEl.innerHTML = '';

    currentColors.forEach((color) => {
        const label = colorLabel(color);

        const swatch = document.createElement('div');
        swatch.className = 'swatch';
        swatch.style.backgroundColor = toRgbString(color);
        swatch.setAttribute('role', 'listitem');
        swatch.setAttribute('tabindex', '0');
        swatch.setAttribute('aria-label', `Color ${label}. Presioná Enter o hacé clic para copiar.`);

        swatch.innerHTML = `<span class="swatch-code">${label}</span>`;

       
        swatch.addEventListener('click', () => copyToClipboard(label, swatch));

        swatch.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                copyToClipboard(label, swatch);
            }
        });

        paletteEl.appendChild(swatch);
    });
}

function renderSaved() {
    
    const count = savedPalettes.length;
    savedCountEl.textContent = count > 0
        ? `${count} guardada${count !== 1 ? 's' : ''}`
        : '';

    if (count === 0) {
        savedListEl.innerHTML = '<p class="saved-empty">Guardá paletas usando el botón ♥</p>';
        return;
    }

    savedListEl.innerHTML = '';

    
    savedPalettes.forEach((colors, index) => {
        const item = document.createElement('div');
        item.className = 'saved-item';
        item.setAttribute('role', 'listitem');

        const swatches = document.createElement('div');
        swatches.className = 'saved-swatches';
        swatches.setAttribute('tabindex', '0');
        swatches.setAttribute('role', 'button');
        swatches.setAttribute('aria-label', `Paleta guardada ${index + 1} con ${colors.length} colores. Clic para restaurar.`);
        swatches.title = 'Clic para restaurar esta paleta';

        colors.forEach((color) => {
            const mini = document.createElement('div');
            mini.className = 'saved-swatch';
            mini.style.backgroundColor = toRgbString(color);
            swatches.appendChild(mini);
        });

        swatches.addEventListener('click', () => restorePalette(index));
        swatches.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                restorePalette(index);
            }
        });

        const meta = document.createElement('span');
        meta.className = 'saved-meta';
        meta.textContent = `${colors.length} colores`;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn--delete';
        deleteBtn.innerHTML = '✕';
        deleteBtn.setAttribute('aria-label', `Eliminar paleta guardada ${index + 1}`);
        deleteBtn.addEventListener('click', () => deletePalette(index));

        item.appendChild(swatches);
        item.appendChild(meta);
        item.appendChild(deleteBtn);
        savedListEl.appendChild(item);
    });
}

function copyToClipboard(text, swatchEl) {
    navigator.clipboard.writeText(text).catch(() => {
        
    });

    const codeEl = swatchEl.querySelector('.swatch-code');
    const original = codeEl.textContent;
    codeEl.textContent = '¡Copiado!';

    setTimeout(() => {
        codeEl.textContent = original;
    }, 1000);

    showToast(`${text} copiado`);
}

function savePalette() {
    if (currentColors.length === 0) return;

    savedPalettes.unshift([...currentColors]);
    renderSaved();
    showToast('Paleta guardada ♥');
}

function restorePalette(index) {
    currentColors = [...savedPalettes[index]];
    renderPalette();
    showToast('Paleta restaurada');
}

function deletePalette(index) {
    savedPalettes.splice(index, 1);
    renderSaved();
    showToast('Paleta eliminada');
}

function showToast(message) {
    toastEl.textContent = message;
    toastEl.classList.add('toast--visible');

    clearTimeout(toastEl._hideTimer);
    toastEl._hideTimer = setTimeout(() => {
        toastEl.classList.remove('toast--visible');
    }, 1800);
}

function setSize(size, clickedBtn) {
    currentSize = size;

    document.querySelectorAll('.btn--size').forEach((btn) => {
        const isActive = btn === clickedBtn;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-pressed', isActive.toString());
    });

    generatePalette();
}


function setFormat(format, clickedBtn) {
    currentFormat = format;

    document.querySelectorAll('.btn--format').forEach((btn) => {
        const isActive = btn === clickedBtn;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-pressed', isActive.toString());
    });

    renderPalette();
    renderSaved();
}

document.getElementById('generate-btn').addEventListener('click', generatePalette);
document.getElementById('save-btn').addEventListener('click', savePalette);

document.querySelectorAll('.btn--size').forEach((btn) => {
    btn.addEventListener('click', () => {
        const size = parseInt(btn.dataset.size, 10);
        setSize(size, btn);
    });
});

document.querySelectorAll('.btn--format').forEach((btn) => {
    btn.addEventListener('click', () => {
        setFormat(btn.dataset.format, btn);
    });
});

generatePalette();