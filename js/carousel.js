document.addEventListener('DOMContentLoaded', () => {
    // 1. Seleccionar elementos clave del DOM
    const track = document.querySelector('.carousel-track');
    const container = document.querySelector('.carousel-container'); 
    const cards = Array.from(document.querySelectorAll('.carousel-card')); 
    const nextButton = document.querySelector('.carousel-button.next');
    const prevButton = document.querySelector('.carousel-button.prev');
    
    // 🚩 CLAVE JS: El valor del gap debe coincidir con el CSS (60px)
    const gap = 60; 
    
    // Parámetros de las tarjetas
    const originalCardCount = cards.length / 2; 
    let cardWidth = cards.length > 0 ? cards[0].getBoundingClientRect().width : 0;
    let originalTrackSize = (cardWidth + gap) * originalCardCount; 
    
    // Parámetros de Movimiento Automático (requestAnimationFrame)
    let currentPosition = 0; 
    const autoSpeed = 0.05; // Velocidad muy lenta
    let animationFrameId; // Para controlar requestAnimationFrame
    
    // Parámetros de Movimiento Manual (Clic de flecha)
    let isManualMode = false; // Indica si el carrusel está en pausa o en transición manual
    let currentManualIndex = 0; 
    const transitionTime = 300; 
    const pauseTime = 3000; 

    // 🚩 Parámetros de Arrastre (Drag)
    let isDragging = false;
    let startX = 0; // Posición X inicial del clic
    let startPosition = 0; // Posición 'currentPosition' al iniciar el arrastre
    
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
        // Ignorar si ya estamos arrastrando o no es clic izquierdo
        if (isDragging || e.button !== 0) return; 
        
        e.preventDefault(); 
        
        // 1. Detener el movimiento automático y establecer banderas
        cancelAnimationFrame(animationFrameId);
        isDragging = true;
        isManualMode = true; 
        
        // 2. Capturar posiciones iniciales
        startX = e.clientX; 
        
        // CLAVE CORREGIDA: Usamos la 'currentPosition' mantenida por el auto-scroll
        startPosition = currentPosition;
        
        // 3. Añadir escuchadores de movimiento y finalización a TODO EL DOCUMENTO
        document.addEventListener('mousemove', handleDragMove);
        document.addEventListener('mouseup', handleDragEnd);
    };

    const handleDragMove = (e) => {
        if (!isDragging) return;

        // Calcular el desplazamiento del ratón (Delta X)
        const dragDistance = e.clientX - startX;
        
        // Calcular la nueva posición del carrusel:
        // El movimiento debe ser: Mover el ratón a la DERECHA (X positivo) debe REDUCIR la posición (mover el carrusel a la DERECHA)
        // Mover el ratón a la IZQUIERDA (X negativo) debe AUMENTAR la posición (mover el carrusel a la IZQUIERDA)
        // Por lo tanto, restamos el desplazamiento del ratón.
        let newPosition = startPosition - dragDistance; 
        
        // Aplicar la nueva posición
        track.style.transform = `translateX(-${newPosition}px)`;
        
        // Actualizar la posición actual para que se use como punto de partida
        currentPosition = newPosition; 
    };

    const handleDragEnd = () => {
        // 1. Limpiar los escuchadores
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);

        if (!isDragging) return;

        isDragging = false;
        
        // 2. Aplicar un 'snap' (ajuste) a la tarjeta más cercana
        const cardSize = cardWidth + gap;
        // El índice puede ser negativo o muy grande debido al arrastre libre
        let snappedIndex = Math.round(currentPosition / cardSize); 
        
        const snappedPosition = cardSize * snappedIndex;
        
        // 3. Aplicamos el 'snap' de forma suave
        track.style.transition = `transform ${transitionTime / 1000}s ease-out`;
        track.style.transform = `translateX(-${snappedPosition}px)`;
        currentPosition = snappedPosition;
        
        // 4. Después de la transición de 'snap', eliminamos la transición y reanudamos
        setTimeout(() => {
            track.style.transition = 'none';

            // Normalizamos la posición de nuevo al rango del set original (0 a 5)
            // Calculamos el índice base dentro del set original (0 a originalCardCount - 1)
            let baseIndex = snappedIndex % originalCardCount;
            // Aseguramos que el índice sea positivo si arrastró demasiado hacia la derecha
            if (baseIndex < 0) {
                baseIndex += originalCardCount;
            }

            const resetPosition = cardSize * baseIndex;

            // Hacemos el salto instantáneo si es necesario
            track.style.transform = `translateX(-${resetPosition}px)`;
            currentPosition = resetPosition;
            
            isManualMode = false;
            animateAutoScroll();
        }, transitionTime); // Esperamos a que termine el deslizamiento de ajuste
    };

    // --- FUNCIONES DE NAVEGACIÓN MANUAL (Flechas) ---

    const activateManualMode = (direction) => {
        if (isManualMode || isDragging) return; 
        
        cancelAnimationFrame(animationFrameId); 
        isManualMode = true;
        
        // Sincronizar el índice manual con la posición actual del track
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

    // 5. Asignar los manejadores de eventos (Flechas)
    if (nextButton) nextButton.addEventListener('click', () => {
        activateManualMode(1);
    });
    if (prevButton) prevButton.addEventListener('click', () => {
        activateManualMode(-1);
    });

    // 🚩 Asignar los manejadores de eventos de ARRASTRE al contenedor principal
    container.addEventListener('mousedown', handleDragStart);
    // Para asegurar que si el mouse se suelta o sale del documento, se limpia el estado
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

        // Limpiar arrastre si estaba activo
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