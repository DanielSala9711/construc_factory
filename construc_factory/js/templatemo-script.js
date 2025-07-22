const initBg = (autoplay = true) => {
    // Definir los slides: imágenes y video
    const slides = [
        { type: 'image', src: 'img/diagoona-bg-1.jpg' },
        { type: 'image', src: 'img/diagoona-bg-2.jpg' },
        { type: 'video', src: 'img/video_1.mp4' }
    ];

    // Insertar video si no existe
    if ($('#tm-bg-video').length === 0) {
        $(".tm-bg").prepend('<video id="tm-bg-video" style="display:none; position:absolute; top:0; left:0; width:100%; height:100%; object-fit:cover; z-index:-1;" loop muted autoplay playsinline></video>');
    }

    // Guardar en window para acceso global
    window.tmSlides = slides;
    window.tmCurrentSlide = 0;

    // Inicializar Backstretch solo con imágenes
    const imgSlides = slides.filter(s => s.type === 'image').map(s => s.src);
    if (imgSlides.length > 0) {
        $.backstretch(imgSlides, {duration: 10000, fade: 1500}); // 10s por slide, fade más suave
    }

    // Mostrar el primer fondo
    setBg(0);

    // Autoplay
    if (autoplay) {
        if (window.tmBgInterval) clearInterval(window.tmBgInterval);
        // Guardar función para avanzar slide
        window.tmNextSlide = function() {
            let next = window.tmCurrentSlide + 1;
            if (next >= slides.length) next = 0;
            setBg(next);
        };
        // Iniciar timer solo si el primer slide no es video
        if (slides[0].type !== 'video') {
            window.tmBgInterval = setTimeout(window.tmNextSlide, 10000);
        }
    }
}

const setBg = id => {
    const slides = window.tmSlides;
    const $video = $('#tm-bg-video');
    window.tmCurrentSlide = id;
    if (!slides || !slides[id]) return;
    if (window.tmBgInterval) clearTimeout(window.tmBgInterval);
    if (slides[id].type === 'video') {
        // Ocultar imágenes y mostrar video con fade
        $(".backstretch").fadeOut(1500, function() {
            $video.attr('src', slides[id].src);
            $video.fadeIn(1500)[0].play();
        });
        // Limitar reproducción del video a 10 segundos máximo
        if (window.tmVideoTimeout) clearTimeout(window.tmVideoTimeout);
        $video.off('ended');
        $video[0].currentTime = 0;
        window.tmVideoTimeout = setTimeout(function() {
            $video.fadeOut(1500, function() {
                setBg(0); // Volver al primer slide
            });
        }, 10000);
        $video.on('ended', function() {
            if (window.tmVideoTimeout) clearTimeout(window.tmVideoTimeout);
            $video.fadeOut(1500, function() {
                setBg(0); // Volver al primer slide
            });
        });
    } else {
        // Mostrar imagen y ocultar video con fade
        if ($video.length) {
            $video.off('ended');
            $video[0].pause();
            if (window.tmVideoTimeout) clearTimeout(window.tmVideoTimeout);
            $video.fadeOut(1500, function() {
                // Buscar el índice de la imagen en el array de imágenes
                const imgSlides = slides.filter(s => s.type === 'image');
                const imgIndex = slides.slice(0, id + 1).filter(s => s.type === 'image').length - 1;
                if ($.backstretch && imgIndex >= 0) {
                    $.backstretch('show', imgIndex);
                    $(".backstretch").fadeIn(1500);
                }
            });
        } else {
            // Buscar el índice de la imagen en el array de imágenes
            const imgSlides = slides.filter(s => s.type === 'image');
            const imgIndex = slides.slice(0, id + 1).filter(s => s.type === 'image').length - 1;
            if ($.backstretch && imgIndex >= 0) {
                $.backstretch('show', imgIndex);
                $(".backstretch").fadeIn(1500);
            }
        }
        // Programar siguiente slide solo si no es video
        if (window.tmNextSlide) {
            window.tmBgInterval = setTimeout(window.tmNextSlide, 10000);
        }
    }
}

const setBgOverlay = () => {
    const windowWidth = window.innerWidth;
    const bgHeight = $('body').height();
    const tmBgLeft = $('.tm-bg-left');

    $('.tm-bg').height(bgHeight);

    if(windowWidth > 768) {
        tmBgLeft.css('border-left', `0`)
                .css('border-top', `${bgHeight}px solid transparent`);                
    } else {
        tmBgLeft.css('border-left', `${windowWidth}px solid transparent`)
                .css('border-top', `0`);
    }
}

$(document).ready(function () {
    const autoplayBg = true;	// set Auto Play for Background Images
    initBg(autoplayBg);    
    setBgOverlay();

    const bgControl = $('.tm-bg-control');            
    bgControl.click(function() {
        bgControl.removeClass('active');
        $(this).addClass('active');
        const id = $(this).data('id');                
        setBg(id);
    });

    $(window).on("backstretch.after", function (e, instance, index) {        
        const bgControl = $('.tm-bg-control');
        bgControl.removeClass('active');
        const current = $(".tm-bg-controls-wrapper").find(`[data-id=${index}]`);        
        current.addClass('active');
    });

    $(window).resize(function() {
        setBgOverlay();
    });
});