/**
 * Inversor de Texto - Aplicación Web
 * Funcionalidades: Invertir texto, limpiar campos, copiar resultado, contador de caracteres
 */

class TextInverter {
    constructor() {
        this.inputText = document.getElementById('inputText');
        this.resultText = document.getElementById('resultText');
        this.invertButton = document.getElementById('invertButton');
        this.clearButton = document.getElementById('clearButton');
        this.copyButton = document.getElementById('copyButton');
        this.currentCount = document.getElementById('currentCount');
        this.themeToggle = document.getElementById('themeToggle');
        
        this.init();
    }

    /**
     * Inicializa la aplicación y configura los event listeners
     */
    init() {
        this.initializeTheme();
        this.setupEventListeners();
        this.updateCharCount();
        this.updateButtonStates();
    }

    /**
     * Configura todos los event listeners
     */
    setupEventListeners() {
        // Event listener para el botón de invertir
        this.invertButton.addEventListener('click', () => this.invertText());

        // Event listener para el botón de limpiar
        this.clearButton.addEventListener('click', () => this.clearFields());

        // Event listener para el botón de copiar
        this.copyButton.addEventListener('click', () => this.copyResult());

        // Event listener para el toggle de tema
        this.themeToggle.addEventListener('click', () => this.toggleTheme());

        // Event listeners para el textarea de entrada
        this.inputText.addEventListener('input', () => {
            this.updateCharCount();
            this.updateButtonStates();
        });

        // Permitir invertir con Enter (Ctrl/Cmd + Enter)
        this.inputText.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                this.invertText();
            }
        });

        // Event listener para detectar cambios en el resultado
        this.resultText.addEventListener('input', () => {
            this.updateButtonStates();
        });

        // Detectar cambios en las preferencias del sistema
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', () => {
                if (!localStorage.getItem('theme-preference')) {
                    this.applyTheme(mediaQuery.matches ? 'dark' : 'light');
                }
            });
        }
    }

    /**
     * Inicializa el tema basado en la preferencia guardada o del sistema
     */
    initializeTheme() {
        const savedTheme = localStorage.getItem('theme-preference');
        const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        const theme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
        this.applyTheme(theme);
    }

    /**
     * Cambia entre modo claro y oscuro
     */
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        this.applyTheme(newTheme);
        localStorage.setItem('theme-preference', newTheme);
        
        this.showMessage(`Modo ${newTheme === 'dark' ? 'oscuro' : 'claro'} activado`, 'success');
    }

    /**
     * Aplica el tema especificado
     * @param {string} theme - 'light' o 'dark'
     */
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        
        // Actualizar el aria-label del botón
        const label = theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
        this.themeToggle.setAttribute('aria-label', label);
        
        // Actualizar el meta theme-color para dispositivos móviles
        this.updateThemeColor(theme);
    }

    /**
     * Actualiza el color del tema para la barra de estado en móviles
     * @param {string} theme - 'light' o 'dark'
     */
    updateThemeColor(theme) {
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }
        
        const color = theme === 'dark' ? '#1e293b' : '#ffffff';
        metaThemeColor.content = color;
    }
    invertText() {
        const text = this.inputText.value.trim();
        
        if (!text) {
            this.showMessage('Por favor, ingresa algún texto para invertir.', 'warning');
            this.inputText.focus();
            return;
        }

        try {
            // Añadir estado de carga
            this.setLoadingState(true);
            
            // Simular un pequeño delay para mejor UX (opcional)
            setTimeout(() => {
                const invertedText = this.reverseString(text);
                this.resultText.value = invertedText;
                
                this.setLoadingState(false);
                this.updateButtonStates();
                
                // Mostrar mensaje de éxito
                this.showMessage('¡Texto invertido correctamente!', 'success');
                
                // Enfocar el resultado para mejor accesibilidad
                this.resultText.focus();
            }, 100);
            
        } catch (error) {
            this.setLoadingState(false);
            console.error('Error al invertir el texto:', error);
            this.showMessage('Ha ocurrido un error al invertir el texto.', 'error');
        }
    }

    /**
     * Función para invertir una cadena de texto
     * @param {string} str - Cadena a invertir
     * @returns {string} - Cadena invertida
     */
    reverseString(str) {
        // Método más eficiente para invertir strings
        return str.split('').reverse().join('');
    }

    /**
     * Limpia todos los campos del formulario
     */
    clearFields() {
        this.inputText.value = '';
        this.resultText.value = '';
        this.updateCharCount();
        this.updateButtonStates();
        this.inputText.focus();
        
        this.showMessage('Campos limpiados correctamente.', 'success');
    }

    /**
     * Copia el resultado al portapapeles
     */
    async copyResult() {
        const text = this.resultText.value;
        
        if (!text) {
            this.showMessage('No hay texto que copiar.', 'warning');
            return;
        }

        try {
            // Usar la API moderna del portapapeles si está disponible
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
            } else {
                // Fallback para navegadores más antiguos
                this.fallbackCopyToClipboard(text);
            }
            
            this.showMessage('¡Texto copiado al portapapeles!', 'success');
            
        } catch (error) {
            console.error('Error al copiar al portapapeles:', error);
            this.showMessage('Error al copiar el texto.', 'error');
        }
    }

    /**
     * Método fallback para copiar al portapapeles
     * @param {string} text - Texto a copiar
     */
    fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
        } finally {
            document.body.removeChild(textArea);
        }
    }

    /**
     * Invierte el texto ingresado por el usuario
     */
    updateCharCount() {
        const currentLength = this.inputText.value.length;
        const maxLength = this.inputText.getAttribute('maxlength') || 1000;
        
        this.currentCount.textContent = currentLength;
        
        // Cambiar color si se acerca al límite
        if (currentLength > maxLength * 0.9) {
            this.currentCount.style.color = '#ef4444';
        } else if (currentLength > maxLength * 0.7) {
            this.currentCount.style.color = '#f59e0b';
        } else {
            this.currentCount.style.color = '';
        }
    }

    /**
     * Actualiza el estado de los botones basado en el contenido
     */
    updateButtonStates() {
        const hasInputText = this.inputText.value.trim().length > 0;
        const hasResultText = this.resultText.value.length > 0;
        
        // Habilitar/deshabilitar botón de invertir
        this.invertButton.disabled = !hasInputText;
        
        // Habilitar/deshabilitar botón de copiar
        this.copyButton.disabled = !hasResultText;
        
        // Habilitar/deshabilitar botón de limpiar
        this.clearButton.disabled = !hasInputText && !hasResultText;
    }

    /**
     * Establece el estado de carga del botón de invertir
     * @param {boolean} loading - Si está cargando o no
     */
    setLoadingState(loading) {
        if (loading) {
            this.invertButton.disabled = true;
            this.invertButton.classList.add('loading');
            this.invertButton.setAttribute('aria-label', 'Invirtiendo texto...');
        } else {
            this.invertButton.disabled = false;
            this.invertButton.classList.remove('loading');
            this.invertButton.setAttribute('aria-label', 'Invertir texto');
        }
    }

    /**
     * Muestra mensajes temporales al usuario
     * @param {string} message - Mensaje a mostrar
     * @param {string} type - Tipo de mensaje (success, warning, error)
     */
    showMessage(message, type = 'info') {
        // Remover mensaje anterior si existe
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Crear elemento de mensaje
        const messageEl = document.createElement('div');
        messageEl.className = `message message--${type}`;
        messageEl.textContent = message;
        messageEl.setAttribute('role', 'alert');
        messageEl.setAttribute('aria-live', 'polite');
        
        // Estilos del mensaje
        Object.assign(messageEl.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 16px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            color: 'white',
            zIndex: '1000',
            maxWidth: '300px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            opacity: '0',
            transform: 'translateY(-10px)',
            transition: 'all 0.3s ease-in-out'
        });

        // Colores según el tipo
        const colors = {
            success: '#059669',
            warning: '#d97706',
            error: '#dc2626',
            info: '#2563eb'
        };
        
        messageEl.style.backgroundColor = colors[type] || colors.info;

        // Añadir al DOM
        document.body.appendChild(messageEl);

        // Animar entrada
        requestAnimationFrame(() => {
            messageEl.style.opacity = '1';
            messageEl.style.transform = 'translateY(0)';
        });

        // Remover después de 3 segundos
        setTimeout(() => {
            messageEl.style.opacity = '0';
            messageEl.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
            }, 300);
        }, 3000);
    }
}

/**
 * Inicializar la aplicación cuando el DOM esté listo
 */
document.addEventListener('DOMContentLoaded', () => {
    try {
        new TextInverter();
        console.log('✅ Inversor de Texto inicializado correctamente');
    } catch (error) {
        console.error('❌ Error al inicializar la aplicación:', error);
    }
});

/**
 * Manejar errores globales
 */
window.addEventListener('error', (event) => {
    console.error('Error global capturado:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Promise rechazada no manejada:', event.reason);
});