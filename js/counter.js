// js/counter.js

/**
 * Módulo para gestionar el estado de los contadores únicos de interacción
 * usando localStorage para la persistencia entre páginas.
 */
export class Counter {
    constructor() {
        this._w_display = document.getElementById('contador-w-total');
        this._g_display = document.getElementById('contador-g-total');
        this._total_display = document.getElementById('contador-total');
        
        // 🚨 CAMBIO CLAVE: Cargar valores desde localStorage
        this._w_total = this._load('w');
        this._g_total = this._load('g');
        
        this.updateDisplay();
    }
    
    /**
     * Carga un valor de contador desde localStorage o devuelve 0.
     * @param {string} keyPrefix 'w' o 'g'
     * @returns {number} El valor cargado.
     */
    _load(keyPrefix) {
        const value = localStorage.getItem(`contador_${keyPrefix}`);
        return value ? parseInt(value) : 0;
    }

    /**
     * Guarda el valor actual de un contador en localStorage.
     * @param {string} keyPrefix 'w' o 'g'
     * @param {number} value El valor a guardar.
     */
    _save(keyPrefix, value) {
        localStorage.setItem(`contador_${keyPrefix}`, value.toString());
    }

    /**
     * Aumenta el contador total para una tecla específica ('w' o 'g').
     * @param {string} key 'w' o 'g'
     */
    incrementTotal(key) {
        if (key === 'w') {
            this._w_total++;
            this._save('w', this._w_total); // 🚨 Guardar en localStorage
        } else if (key === 'g') {
            this._g_total++;
            this._save('g', this._g_total); // 🚨 Guardar en localStorage
        }
        this.updateDisplay(); 
    }
    
    /**
     * Reinicia todos los contadores a cero.
     */
    reset() {
        this._w_total = 0;
        this._g_total = 0;
        
        // 🚨 Reiniciar también en localStorage
        this._save('w', 0);
        this._save('g', 0);
        
        this.updateDisplay();
    }
    
    /**
     * Actualiza el contenido visible en la pantalla.
     */
    updateDisplay() {
        if (this._w_display) this._w_display.textContent = this._w_total.toString();
        if (this._g_display) this._g_display.textContent = this._g_total.toString();
        
        const total = this._w_total + this._g_total;
        if (this._total_display) this._total_display.textContent = total.toString();
    }
}