document.addEventListener('DOMContentLoaded', () => {
    // 1. Seleccionar elementos clave del DOM
    const track = document.querySelector('.carousel-track');
    const container = document.querySelector('.carousel-container'); 
    const nextButton = document.querySelector('.carousel-button.next');
    const prevButton = document.querySelector('.carousel-button.prev');

    // 🚩 CLAVE CORREGIDA: Detectar solo las tarjetas originales
    const originalCards = Array.from(document.querySelectorAll('.carousel-card'));
    
    // 🚩 PASO 1: DUPLICACIÓN DINÁMICA DE TARJETAS
    // Esto asegura que, aunque el HTML solo tiene 4 tarjetas, el track tiene 8 (4 + 4) para el bucle.
    originalCards.forEach(card => {
        const clone = card.cloneNode(true);
        // Opcional: limpiar data-index para evitar IDs duplicados
        clone.removeAttribute('data-index');
        track.appendChild(clone);
    });
    
    // Ahora 'cards' incluye el set original y los clones (8 tarjetas en total)
    const cards = Array.from(document.querySelectorAll('.carousel-card')); 
    
    // Parámetros de las tarjetas
    const originalCardCount = originalCards.length; // ¡Ahora es 4!
    
    // 🚩 CLAVE JS: El valor del gap debe coincidir con el CSS (60px)
    const gap = 60; 
    
    let cardWidth = cards.length > 0 ? cards[0].getBoundingClientRect().width : 0;
    // El tamaño total para el bucle ahora es el tamaño de las 4 tarjetas originales
    let originalTrackSize = (cardWidth + gap) * originalCardCount; 
    
    // Parámetros de Movimiento Automático (requestAnimationFrame)
    let currentPosition = 0; 
    const autoSpeed = 0.05; // Velocidad muy lenta
    let animationFrameId; 
    
    // Parámetros de Movimiento Manual (Clic de flecha)
    let isManualMode = false; 
    let currentManualIndex = 0; 
    const transitionTime = 300; 
    const pauseTime = 3000; 

    // 🚩 Parámetros de Arrastre (Drag)
    let isDragging = false;
    let startX = 0; 
    let startPosition = 0; 
    
    if (cards.length === 0 || cardWidth === 0) return;

    // 2. Preparación inicial
    track.style.transition = 'none';
    cards.forEach(card => card.style.left = 'unset');

    // --- FUNCIONES DE MOVIMIENTO AUTOMÁTICO Y FLUJO ---

    const animateAutoScroll = () => {
        if (isManualMode || isDragging) return; 
        
        currentPosition += autoSpeed;
        
        // Bucle sin fin: Reiniciar la posición
        if (currentPosition >= originalTrackSize) {
            currentPosition -= originalTrackSize;
        }

        track.style.transform = `translateX(-${currentPosition}px)`;
        animationFrameId = requestAnimationFrame(animateAutoScroll);
    };

    // --- FUNCIONES DE ARRASTRE (DRAG) ---

    const handleDragStart = (e) => {
        if (isDragging || e.button !== 0) return; 
        
        e.preventDefault(); 
        
        cancelAnimationFrame(animationFrameId);
        isDragging = true;
        isManualMode = true; 
        
        startX = e.clientX; 
        startPosition = currentPosition;
        
        document.addEventListener('mousemove', handleDragMove);
        document.addEventListener('mouseup', handleDragEnd);
    };

    const handleDragMove = (e) => {
        if (!isDragging) return;

        const dragDistance = e.clientX - startX;
        let newPosition = startPosition - dragDistance; 
        
        track.style.transform = `translateX(-${newPosition}px)`;
        currentPosition = newPosition; 
    };

    const handleDragEnd = () => {
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);

        if (!isDragging) return;

        isDragging = false;
        
        const cardSize = cardWidth + gap;
        let snappedIndex = Math.round(currentPosition / cardSize); 
        
        const snappedPosition = cardSize * snappedIndex;
        
        track.style.transition = `transform ${transitionTime / 1000}s ease-out`;
        track.style.transform = `translateX(-${snappedPosition}px)`;
        currentPosition = snappedPosition;
        
        setTimeout(() => {
            track.style.transition = 'none';

            // Normalizamos al rango del set original (0 a 3)
            let baseIndex = snappedIndex % originalCardCount;
            if (baseIndex < 0) {
                baseIndex += originalCardCount;
            }

            const resetPosition = cardSize * baseIndex;

            track.style.transform = `translateX(-${resetPosition}px)`;
            currentPosition = resetPosition;
            
            isManualMode = false;
            animateAutoScroll();
        }, transitionTime); 
    };

    // --- FUNCIONES DE NAVEGACIÓN MANUAL (Flechas) ---

    const activateManualMode = (direction) => {
        if (isManualMode || isDragging) return; 
        
        cancelAnimationFrame(animationFrameId); 
        isManualMode = true;
        
        currentManualIndex = Math.round(currentPosition / (cardWidth + gap)); 
        
        let targetIndex = currentManualIndex + direction;

        if (targetIndex >= cards.length) {
            targetIndex = 0;
        } else if (targetIndex < 0) {
            targetIndex = cards.length - 1;
        }

        const targetPosition = (cardWidth + gap) * targetIndex;

        track.style.transition = `transform ${transitionTime / 1000}s ease-in-out`;
        track.style.transform = `translateX(-${targetPosition}px)`;
        
        currentManualIndex = targetIndex;
        
        // Pausa de 3 segundos antes de reanudar el auto-scroll
        setTimeout(() => {
            track.style.transition = 'none';

            // Salto al inicio del set original (0-3) si aterrizamos en el duplicado (4-7)
            if (currentManualIndex >= originalCardCount) {
                const resetIndex = currentManualIndex - originalCardCount; 
                const resetPositionPx = (cardWidth + gap) * resetIndex;

                track.style.transform = `translateX(-${resetPositionPx}px)`;
                currentPosition = resetPositionPx;
                currentManualIndex = resetIndex;
            } else {
                currentPosition = targetPosition;
            }
            
            isManualMode = false;
            animateAutoScroll();
            
        }, transitionTime + pauseTime); 
    };
    
    // --- ASIGNACIÓN DE EVENTOS ---

    if (nextButton) nextButton.addEventListener('click', () => {
        activateManualMode(1);
    });
    if (prevButton) prevButton.addEventListener('click', () => {
        activateManualMode(-1);
    });

    container.addEventListener('mousedown', handleDragStart);
    document.addEventListener('mouseleave', () => {
        if (isDragging) handleDragEnd();
    });

    // 6. Manejo de Redimensionamiento 
    window.addEventListener('resize', () => {
        cancelAnimationFrame(animationFrameId); 
        
        // Recalcular dimensiones
        cardWidth = cards[0].getBoundingClientRect().width;
        originalTrackSize = (cardWidth + gap) * originalCardCount;
        const cardSize = cardWidth + gap;

        if (isDragging) handleDragEnd();
        
        // Recalcular la posición al centro de la tarjeta más cercana
        const targetPosition = cardSize * Math.round(currentPosition / cardSize);
        
        track.style.transition = 'none';
        track.style.transform = `translateX(-${targetPosition}px)`;
        currentPosition = targetPosition;
        
        // Reiniciar el scroll automático
        if (!isManualMode && !isDragging) {
            animateAutoScroll();
        }
    });

    // 7. INICIAR EL MOVIMIENTO AUTOMÁTICO
    animateAutoScroll();
});