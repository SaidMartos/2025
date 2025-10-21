// js/counter.js

/**
 * Módulo para gestionar el estado de los contadores únicos de interacción.
 */
export class Counter {
    constructor() {
        this._w_total = 0;
        this._g_total = 0;
        
        this._w_display = document.getElementById('contador-w-total');
        this._g_display = document.getElementById('contador-g-total');
        this._total_display = document.getElementById('contador-total');
        
        this.updateDisplay();
    }

    /**
     * Aumenta el contador total para una tecla específica ('w' o 'g').
     * @param {string} key 'w' o 'g'
     */
    incrementTotal(key) {
        if (key === 'w') {
            this._w_total++;
        } else if (key === 'g') {
            this._g_total++;
        }
        this.updateDisplay(); 
    }
    
    /**
     * NUEVO: Reinicia todos los contadores a cero.
     */
    reset() {
        this._w_total = 0;
        this._g_total = 0;
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