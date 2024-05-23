/*
    JavaScript "obres.js", el siguiente JavaScript se encarga de actualizar el DOM para que muestre la pestaña
    correspondiente de la obra que selecciona el usuario.
    
    Con esta obra se prentende mostrar la siguiente información que se puede encontrar en JSON "Teatre.json"
        - Obra de teatro:
            · Titulo obra *
            · Descripción *
            · Director    *
            · Duranción   *
            · Imagen
        
        - Actores (Es posible que no haya información sobre los actores, se tiene en cuenta en el código la gestión)
            · Imagen del actor
            · Nombre del actor
        
        - Trailer (Es posible que no disponga de trailer, se tiene en cuenta en el código la gestión)
            · Video del trailer en ".mp4" y ".webm"
        
        - Reviews (Es posible que no disponga de reviews, se tiene en cuenta en el código la gestión)
            · Mostrar reviews
                o   Valoración/Puntuación de la review con estrellas
                o   Nombre del redactor
                o   Opinión
            
            · Formulario (Formulario que usar WebStortage para mostrar posteriormente información)
                o   Nombre de usuario
                o   Valoración/Puntuacion con estrellas
                o   Opinión

    (*) = Los elementos marcados con asterisco se leen usando SpeechSyntesis

    -----------------------------------------Autores----------------------------------------------------------
        -> Rubén Ramis
        -> Silvia Moia
        -> Arnau Vidal
    ----------------------------------------------------------------------------------------------------------
*/
/**
 * Función que permite la actualización del DOM mostrando información y la obra seleccionada por el usuario
 *      - La función principalmente se encarga de llamar a funciones auxiliares para montar el nuevo HTML
 *      - También se encarga de recargar funciones necesarias para el correcto funcionamiento de la página
 * 
 * @param {*} obraId    ID de la obra que ha pulsado el usuario
 */

async function obtainObra(obraId) {
    //Configuramos el botón superior que permite volver a la página principal
    let hijo = document.getElementById('nose');
    hijo.innerHTML = `  <button onclick="reloadIndex()" class="logo d-flex align-items-center me-auto me-lg-0">
                            <h1>Teatre<span>.</span></h1>
                        </button>`;
    
    //Leemos nuestro JSON "Teatre.json" y obtenemos la obra que ha seleccionado el usuario
    let obra;
    let jsons = await fetch("../assets/json/Teatre.json")
        .then((response) => response.json())
        .catch((error) => {
          console.error(error);
        });

    let teatres = jsons.itemListElement;
    for (const teatre of teatres) {
        for(const obras of teatre.event){
            if(obras.identifier == obraId){
                obra = obras;
            }
        }
    }

    //Montamos el panel que permite visualizar la información de la obra
    let hero = document.getElementById('info');
    hero.innerHTML = generarHTMLinfoObres(obra);

    //Montamos las Reviews/Trailer/Actores
    let obrasHTML = document.getElementById('main');
    let main = generaHtmlActores(obra);
    main = main.concat(generaHtmlTrailer(obra));
    main = main.concat(generaHtmlReviews(obra));     
    //Actualizamos DOM
    obrasHTML.innerHTML = main;
    //Movemos la vista del usuario a la parte superior de la pantalla
    window.scrollTo(0, 0);
    //Recarga de funciones auxiliares necesarias para el correcto funcionamiento
    reloadSwiper();
    //Action Listener para el boton de rellenar el formulario
    guardaReview(obraId);
}

/*
    Funciones encargadas de generar el HTML del apartado de obras
*/

/**
 *  Función que genera el HTML que actualizará "info" que es un div que contiene información
 *  sobre la página principal, teatros y obras.
 * 
 *  Además prepara el texto necesario para hacer uso del speechSyntesis.
 * 
 * @param {*} obra  Información de la obra leida del JSON
 * @returns         Devuelve el HTML que actualizará la sección "info"
 */
function generarHTMLinfoObres(obra){
    const synth = window.speechSynthesis;

    //Recogemos toda la información necesaria en variables
    let sinopsis = obra.description;
    let duracion = obra.duration;
    let director = obra.director.givenName;
    let imgObra = obra.image.contentUrl;
    let nomObra = obra.name.trim().split(' ');
    let meitat = nomObra.length / 2;
    let nomPrimeraLinea = nomObra.slice(0, meitat).join(' ');
    let nomSegonaLinea = nomObra.slice(meitat).join(' ');

    let infoObras = `
    <div class="row justify-content-between gy-5">
        <div class="col-lg-5 order-2 order-lg-1 d-flex flex-column justify-content-center align-items-center align-items-lg-start text-center text-lg-start">
            <h2  id="nomTeatre">${nomPrimeraLinea}<br>${nomSegonaLinea}</h2>
            <p  >Sinopsis:<br> ${sinopsis}</p>
            <p  >Director: ${director}</p>
            `;
    
    //Convertimos el tiempo guardado en ISO 8601 de Schema en un formato legible por el usuario
    const minutes = parseInt(duracion.replace('PT', '').replace('M', ''));
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    const durationText = 'Duración: ' + formattedMinutes + ' minutos';

    //Preparamos el audio
    let audio = `L´obra de teatre: ${nomPrimeraLinea} ${nomSegonaLinea} la cual la seva sinopsis es ${sinopsis} ha estat dirigida per ${director} y té una duració de ${formattedMinutes} minuts`;
    let msg = audio.toString();

    infoObras = infoObras.concat(`
                <p  >${durationText}</p>
            </div>
            <div class="col-lg-5 order-1 order-lg-2 text-center text-lg-start">
                <img src="${imgObra}" class="img-fluid" alt="" >
                <button id="repBtn" onclick='reproductorAudio("${msg}")'><img src="assets/img/svg/audio-play.svg" class="audioIA menu-img img-fluid" alt=""></button>
            </div>
        </div>
    `);
    return infoObras;
}

/**
 *  Función que genera el HTML de actores que actualizará "main" que es un div donde no tiene que seguir la estructura de otras páginas.
 * 
 * @param {*} obra      Información de la obra leida del JSON
 * @returns             Devuelve el HTML que actualizará la sección "main" con el contenido de los actores
 */
function generaHtmlActores(obra){
    let actores = obra.actor;
    let obraActors;

    //Condición de control en caso que no haya actores
    if(actores.length != 0){
        //Caso donde hay almenos un actor
        obraActors = `
        <!-- ======= Testimonials Section ======= -->
                <section id="testimonials" class="testimonials">
                <div class="container" >
    
                    <div class="section-header">
                        <p>Elenco de <span>Actores</span></p>
                    </div>
    
                    <div class="slides-1 swiper"  >
                        <div class="swiper-wrapper">`;

        //Iteramos para cada actor
        for(const actor of actores){
            obraActors = obraActors.concat(`
                <div class="swiper-slide">
                    <div class="testimonial-item">
                        <div class="row gy-4 justify-content-center">
                            <div class="col-lg-6">
                                <div class="testimonial-content">
                                <img src="${actor.image.contentUrl}" class="img-fluid img-round-obres" alt="">
                                <h3>${actor.givenName}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div><!-- End testimonial item -->`);
        }
        //Importante cerrar el Swiper y añadir la paginación
        obraActors = obraActors.concat(`
                </div>
                    <div class="swiper-pagination"></div>
                </div>
    
                </div>
            </section><!-- End Testimonials Section -->`);

    }else{
        //Caso donde no hay actores
        obraActors = `
        <!-- ======= Testimonials Section ======= -->
                <section id="testimonials" class="testimonials">
                <div class="container" >
                    <div class="section-header">
                        <p>Elenco de <span>Actores</span></p>
                        <h3>Actores no disponibles</h3>
                    </div>
                </div>
            </section><!-- End Testimonials Section -->`;
    }
    return obraActors;

}

/**
 * Función que genera el HTML de los trailers que actualizará "main" que es un div donde no tiene que seguir la estructura de otras páginas.
 * 
 * @param {*} obra      Información de la obra leida del JSON
 * @returns             Devuelve el HTML que actualizará la sección "main" con el contenido de los trailer
 */
function generaHtmlTrailer(obra){
    let aux = obra.additionalProperty;
    let element;
    for(const a of aux){
        if(a.name == "hasVideo"){
           element = a;
        }
    }
    let trailer = element.url;
    let obraTrailer;
    //Condición de control en caso que no haya trailer
    if(trailer){
        //En caso de que haya trailer, lo obtenemos y lo configuramos para obtener el ".mp4" y ".webm"
        let video = element.url;
        let videoAux = video.substring(0, video.lastIndexOf("."));
        obraTrailer =`
                <!-- ======= Video Section ======= -->
            <section id="hero" class="hero d-flex align-items-center section-bg">
                <div class="container" >
                    <div class="section-header">
                        <p><span>Trailer</span></p>
                        <video id="videoPlayer" controls width="640" height="360" class="img-fluid" alt="">
                            <source src="${video}" type="video/mp4">
                            <source src="${videoAux}.webm" type="video/webm">
                            Tu navegador no admite la reproducción de video.
                        </video>
                    </div>
            </section><!-- End Video Section -->`;
    }else{
        //En caso de que no haya trailer
        obraTrailer = `
            <!-- ======= Video Section ======= -->
                <section id="hero" class="hero d-flex align-items-center section-bg">
                    <div class="container" >
                        <div class="section-header">
                            <p><span>Trailer</span></p>
                            <h3>Video no disponible</h3>
                        </div>
                </section><!-- End Video Section -->`;
    }
    return obraTrailer;
}

/**
 * Función que genera el HTML de las reviews que actualizará "main" que es un div donde no tiene que seguir la estructura de otras páginas.
 * 
 * @param {*} obra      Información de la obra leida del JSON
 * @returns             Devuelve el HTML que actualizará la sección "main" con el contenido de las reviews
 */
function generaHtmlReviews(obra){
    let reviews = obra.review;
    let reviewsS = JSON.parse(localStorage.getItem('review'+obra.identifier));
    let obraReviews;
    //Condición de control en caso que no haya review
    if(reviews.length != 0 || reviewsS != null){
        //En caso de que haya almenos una review en el JSON o webStorage
        obraReviews = 
            `
                <!-- ======= Testimonials Section ======= -->
              <section id="testimonials" class="testimonials">
                <div class="container" >
    
                    <div class="section-header">
                        <p><span>Review</span></p>
                    </div>
                    <div class="mapa-contenedor">
                        <div class="slides-1 swiper mapa-align">
                            <div class="swiper-wrapper">
              `;

        //Imagenes de estrellas de Boostrap Icons                
        let estrellaCompleta = `<i class="bi bi-star-fill"></i>`;
        let estrellaMedia = `<i class="bi bi-star-half"></i>`;
        let estrellas;
        let aux;
        //Comprobamos si hay reviews en webStorage
        if(reviewsS != null){
            estrellas = reviewsS.puntuation;
            aux = Math.floor(estrellas)
            obraReviews = obraReviews.concat(`
            <div class="swiper-slide">
                <div class="testimonial-item">
                    <div class="row gy-4 justify-content-center">
                        <div class="col-lg-6">
                            <div class="testimonial-content">
                                <p>
                                    <i class="bi bi-quote quote-icon-left"></i>
                                    ${reviewsS.opinion}
                                    <i class="bi bi-quote quote-icon-right"></i>
                                  </p>
                                  <h3>${reviewsS.name}</h3>
                                  <div class="stars">`);
            //Añadimos estrellas
            if(estrellas == aux){
                for(var e = 0; e< aux; e++){
                    obraReviews=obraReviews.concat(estrellaCompleta)
                }
            }else{
                for(var e = 0; e< aux; e++){
                    obraReviews=obraReviews.concat(estrellaCompleta)
                } 
                obraReviews=obraReviews.concat(estrellaMedia)
            } 

            obraReviews = obraReviews.concat(
                                  `</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div><!-- End testimonial item -->`);
        }
        //Comprobamos si hay reviews en el JSON
        if(reviews.length != 0 ){
            for(const review of reviews){
                estrellas = review.reviewRating.ratingValue
                aux = Math.floor(estrellas)
                obraReviews = obraReviews.concat(`
                <div class="swiper-slide">
                    <div class="testimonial-item">
                        <div class="row gy-4 justify-content-center">
                            <div class="col-lg-6">
                                <div class="testimonial-content">
                                    <p>
                                        <i class="bi bi-quote quote-icon-left"></i>
                                        ${review.reviewBody}
                                        <i class="bi bi-quote quote-icon-right"></i>
                                      </p>
                                      <h3>${review.reviewRating.author.givenName}</h3>
                                      <div class="stars">`);
                 //Añadimos estrellas
                if(estrellas == aux){
                    for(var e = 0; e< aux; e++){
                        obraReviews=obraReviews.concat(estrellaCompleta)
                    }
                }else{
                    for(var e = 0; e< aux; e++){
                        obraReviews=obraReviews.concat(estrellaCompleta)
                    } 
                    obraReviews=obraReviews.concat(estrellaMedia)
                } 
    
                obraReviews = obraReviews.concat(
                                      `</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div><!-- End testimonial item -->`);
            }
        }

        obraReviews = obraReviews.concat(`
            </div>
                        <div class="swiper-pagination"></div>
                    </div>
                    <div class="mapa-element review-form-bg">`);
        //Añadimos las valoraciones
        obraReviews = obraReviews.concat(generarHTMLValoracion());
        obraReviews = obraReviews.concat(`</div>
        </div>
                    </div>
                </section><!-- End Testimonials Section -->`);
    }else{
        obraReviews = `
        <!-- ======= Testimonials Section ======= -->
                <section id="testimonials" class="testimonials">
                <div class="container" >
                    <div class="section-header">
                        <p><span>Review</span></p>
                        <h3>Reviews no disponibles</h3>
                    </div>
                    <div class="mapa-contenedor">
                    <div class="mapa-align"></div>
                        <div class="mapa-element review-form-bg">`;
        //Añadimos las valoraciones
        obraReviews = obraReviews.concat(generarHTMLValoracion());
        obraReviews = obraReviews.concat(`      
                        </div>
                    </div>
                </div>
            </section><!-- End Testimonials Section -->`);
    }
    return obraReviews;
}

/**
 * Función que genera el HTML de las valoraciones, hace uso de Forms API
 *     Contiene:
 *          - Petición de nombre
 *          - Estrellas como puntuación
 *          - Bloque de texto para la opinion
 * 
 * @returns     Devuelve el HTML de las valoraciones
 */
function generarHTMLValoracion(){
    return `<p>Deixa la teva opinió:</p>
    <form class="review-form" id="review-form">
        <input type="text" name="name" id="name"
            placeholder="El teu nom" required>
    <div class="col-lg-4 col-md-6">
    <p class="clasificacion">
    <input id="radio1" type="radio" name="estrellas" value="5"><!--
    --><label for="radio1">★</label><!--
    --><input id="radio2" type="radio" name="estrellas" value="4"><!--
    --><label for="radio2">★</label><!--
    --><input id="radio3" type="radio" name="estrellas" value="3"><!--
    --><label for="radio3">★</label><!--
    --><input id="radio4" type="radio" name="estrellas" value="2"><!--
    --><label for="radio4">★</label><!--
    --><input id="radio5" type="radio" name="estrellas" value="1"><!--
    --><label class="active" for="radio5">★</label>
    </p>
    </div>
    <div class="mt-3">
        <textarea name="message" name="name" rows="5" placeholder="La teva opinió." minlength="10" required></textarea>
    </div>
    <div class="text-center"><button type="submit">Desa</button></div>
</form>`;
}

/**
 * Función que haciendo uso de SpeechSyntesis se encarga de leer la información de la obra
 * 
 * @param {*} audio     String con la información que debe leer
 */
function reproductorAudio(audio){
    let boton = document.getElementById("repBtn");
    //Condición encargada de apagar y activar el audio
    if(window.speechSynthesis.speaking){
        window.speechSynthesis.cancel();
        utterance = null;
        boton.innerHTML = `<img src="assets/img/svg/audio-play.svg" class="audioIA menu-img img-fluid" alt="">`;
    }else{
        const utterance = new SpeechSynthesisUtterance(audio);
        utterance.lang = 'ca-ES'; // Catalan language code
        utterance.rate = 1.2; // establecer la velocidad de
        utterance.pitch = 1.5; // establecer la altura de voz;
        speechSynthesis.speak(utterance);
        boton.innerHTML = `<img src="assets/img/svg/audio-stop.svg" class="audioIA menu-img img-fluid" alt="">`;
    }
}

/**
 * Función que modifica el comportamiento entandar del botón submit del formulario para que guarde
 * la información de la review del usuario en local usando WebStorage
 * 
 * @param {*} id    Identificador de la obra, permitira crear la variable propia para esa obra 
 */
async function guardaReview(id){
    const formulario = document.getElementById('review-form');
    
    formulario.addEventListener('submit', (event) => {
        event.preventDefault();
        const selectedValue = getSelectedRadioValue();
        localStorage.setItem('review'+id, JSON.stringify({
            opinion:  event.target.elements.message.value,
            puntuation:  selectedValue,
            name: event.target.elements.name.value
        }));
        obtainObra(id);
        alert("Review guardada amb éxit!");
    });
}

/**
 * Función que permite la incorporación/detección de las estrellas del formulario.
 * 
 * @returns     Devuelve la cantidad de estrellas que ha añadido en usuario. 
 */
function getSelectedRadioValue() {
    // Get all radio buttons with the name "estrellas"
    const radios = document.querySelectorAll('input[name="estrellas"]');
  
    // Loop through each radio button
    for (const radio of radios) {
      // Check if the radio button is checked
      if (radio.checked) {
        // If checked, return its value
        return radio.value;
      }
    }
  
    // If no radio button is selected, return null
    return 1;
  }