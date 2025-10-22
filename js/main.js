// js/main.js

import { Counter } from './counter.js';

const counter = new Counter();

// Objeto para llevar el registro de las teclas que están presionadas
const keysPressed = {};

// Estado de Pausa (Falso por defecto, es decir, está en Grabando)
let isPaused = false; 

// Referencias a los elementos del DOM para control
const toggleButton = document.getElementById('toggle-button');
const buttonIcon = document.getElementById('button-icon');
const currentStatus = document.getElementById('current-status');
const resetButton = document.getElementById('reset-button');


/**
 * Función para alternar el estado de Pausa/Play.
 */
function togglePause() {
    isPaused = !isPaused; 

    if (isPaused) {
        // Modo PAUSA
        buttonIcon.textContent = '▶️'; // Icono de Play
        toggleButton.style.backgroundColor = '#28a745'; // Color verde
        currentStatus.textContent = 'Pausado';
        currentStatus.style.color = '#dc3545'; // Color rojo
        toggleButton.setAttribute('aria-label', 'Reproducir Contador');
        console.log("Contador Pausado.");
    } else {
        // Modo GRABANDO
        buttonIcon.textContent = '⏸️'; // Icono de Pausa
        toggleButton.style.backgroundColor = '#ffc107'; // Color amarillo
        // 🚨 CAMBIO APLICADO AQUÍ
        currentStatus.textContent = 'Grabando';
        currentStatus.style.color = '#28a745'; // Color verde
        toggleButton.setAttribute('aria-label', 'Pausar Contador');
        // 🚨 CAMBIO APLICADO AQUÍ
        console.log("Contador en Grabación."); 
    }
}

// 1. Manejador para el botón Pausa/Play
toggleButton.addEventListener('click', () => {
    togglePause();
    toggleButton.blur(); 
});


// 2. Manejador para el botón de Reinicio
resetButton.addEventListener('click', () => {
    counter.reset(); 
    resetButton.blur(); 
    console.log("Contadores Reiniciados a 0.");
});


/**
 * Manejador del evento keydown (tecla presionada).
 * AÑADIDA CORRECCIÓN PARA EL BUG DEL BOTÓN
 * @param {KeyboardEvent} event 
 */
document.addEventListener('keydown', (event) => {
    // ----------------------------------------------------
    // CORRECCIÓN CLAVE: 
    // Si la tecla presionada es 'Espacio' y el elemento actualmente enfocado 
    // es uno de nuestros botones de control, detenemos la acción predeterminada.
    if (event.code === 'Space' && 
        (document.activeElement === toggleButton || document.activeElement === resetButton)) {
        
        event.preventDefault(); // Evita que el Espacio active el botón enfocado
        // No salimos con 'return' para que la lógica de combinación (más abajo)
        // aún pueda evaluar la pulsación de 'Space' en keysPressed.
    }
    // ----------------------------------------------------

    if (isPaused) return; 
    
    keysPressed[event.code] = true;

    const isSpace = keysPressed['Space'];
    const key = event.code;
    
    if (event.repeat) return;
    
    if (isSpace && key === 'KeyW') {
        counter.incrementTotal('w');
        console.log("Interacción Espacio + W contada.");
    }
    
    if (isSpace && key === 'KeyG') {
        counter.incrementTotal('g');
        console.log("Interacción Espacio + G contada.");
    }
});

/**
 * Manejador del evento keyup (tecla liberada).
 * @param {KeyboardEvent} event 
 */
document.addEventListener('keyup', (event) => {
    delete keysPressed[event.code];
});