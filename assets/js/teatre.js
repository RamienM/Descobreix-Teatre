/* 
    JavaScript "teatre.js", el siguiente JavaScript se encarga de actualizar el DOM para que muestre la página del teatro
    que abrá seleccionado el usuario.
    
    En la página de teatros se prentende mostrar la siguiente información:
        - Teatro
            · Nombre del teatro *
            · Descripción *
            · Ubicación   *
            · Número de telefono  
            · Url del teatro
            · Imagen
        
        
        - Obras
            · Swiper de 3 slides que muestra las obras que se van a realizar o se han realizado en ese teatro.
        
        - Mapa y tiempo
            · Mapa de OpenStreetMap donde se muestra la ubicación del teatro seleccionado
            · Tiempo que hace en la ubicación del teatro
            · Botón que permite al usuario ubicarse en el mapa haciendo uso Geolocation y 
                usando la libreria de leaflet-routing-machine obtener una ruta para llegar
                al teatro


    -----------------------------------------Autores----------------------------------------------------------
        -> Rubén Ramis
        -> Silvia Moia
        -> Arnau Vidal
    ----------------------------------------------------------------------------------------------------------
*/
// Como nuestra app es completamente front las llaves de las APIs serán vistas por
// todo el que inspeccione la página
const WEATHER_KEY = '14a89879feae44fa870111543242804';

/**
 * Dado un id de teatro, buscamos dentro de Teatre.json un teatro cuyo id coincida
 * con el nuestro. Una vez encontrado representamos todos los datos necesarios
 * en la página
 * @param {*} teatreId id del teatro a pintar
 */
async function obtainTeatre(teatreId) {
    let hijo = document.getElementById('nose');
    hijo.innerHTML = `  <button onclick="reloadIndex()" class="logo d-flex align-items-center me-auto me-lg-0">
                            <h1>Teatre<span>.</span></h1>
                        </button>`;

    // Obtenemos el json de teatros mediante una llamada asínctona
    let jsons = await fetch("../assets/json/Teatre.json")
        .then((response) => response.json())
        .catch((error) => {
          console.error(error);
        });

    // Una vez tengamos el JSON escogemos el teatro deseado
    let teatre = jsons.itemListElement[teatreId];

    // Rellenamos la página con la información necesaria que está contenida en el objeto
    // del json que acabamos de extraer
    let teatreDiv = document.getElementById('info');
    teatreDiv.innerHTML = await generarHTMLinfoTeatre(teatre);
        
    let teatreHTML = document.getElementById('main');
    let main = generarHTMLobras(teatre);    
    main = main.concat(generaHTMLMapaTeatros(teatre));
        
    teatreHTML.innerHTML = main;

    // Añadimos que al clickar el botón para generar rutas se genere dicha ruta
    document.getElementById("mapa-button").addEventListener('click',()=>{generaRutaMapaTeatros(teatre)});

    // Dirigimos la vista del usuario al inicio de la página
    window.scrollTo(0, 0);
    reloadSwiper();

    // Generamos los elementos dinámicos en función del teatro elegido, tanto el tiempo que hace en el teatro
    // como el mapa para ver donde se encuentra
    generaMapaTeatros(teatre);
    let weather = await getWeather(teatre.geo.latitude,teatre.geo.longitude);
    document.getElementById("weather").innerHTML = generaHTMLWeatherTeatro(weather);

}

/**
 * Genera el html con toda la información del teatro para luego añadirlo al elemento de la web
 * correspondiente.
 * 
 * @param {*} teatre    Información del teatro leido del JSON
 * @returns             Devuelve el HTML que actualizará la sección "info"
 */
function generarHTMLinfoTeatre(teatre){
    let adreca = teatre.address
    let imgTeatre = teatre.image.contentUrl
    let phone = teatre.telephone
    let url = teatre.url
    let hasAudio = teatre.additionalProperty.value;

    let nomTeatre = teatre.name.trim().split(' ');
    let meitat = nomTeatre.length / 2;
    let nomPrimeraLinea = nomTeatre.slice(0, meitat).join(' ');
    let nomSegonaLinea = nomTeatre.slice(meitat).join(' ');

    let teatreInfo = `
    <div class="row justify-content-between gy-5">
    <div class="col-lg-5 order-2 order-lg-1 d-flex flex-column justify-content-center align-items-center align-items-lg-start text-center text-lg-start">
        <h2  id="nomTeatre">${nomPrimeraLinea}<br>${nomSegonaLinea}</h2>
        <p>${teatre.description}</p>
        <p>${adreca.addressLocality} - ${adreca.addressRegion}</p>
        <p>${phone}</p>
        <a href="${url}"><p>${url}</p></a>
    </div>
    <div class="col-lg-5 order-1 order-lg-2 text-center text-lg-start">
        <img src="${imgTeatre}" class="img-fluid" alt="">
        `;
    // Algunos teatros pueden no tener audios
    if(hasAudio){
        let audio = teatre.additionalProperty.url;
        teatreInfo = teatreInfo.concat(`
        <audio id="audioPlayer" controls>
            <source src="${audio}" type="audio/aac">
            Tu navegador no admite la reproducción de audio.
        </audio>  
        </div>
        </div>
        `);
    }else{
        teatreInfo = teatreInfo.concat(`
        </div>
        </div>
        `);
    }

    return teatreInfo;
}

/**
 * Genera el HTML correspondiente de las obras que podrán verse en el teatro.
 * 
 * @param {*} teatre    Información del teatro leido del JSON
 * @returns             Devuelve el HTML que actualizará la sección de obras
 */
function generarHTMLobras(teatre){
    let obras = teatre.event;
    let teatreObras
    // Nos aseguramos que haya obras
    if(obras.length != 0){
        // Si hay menos de tres obras el usuario no podrá hacer scroll en las mismas
        if(obras.length<3){
            let valor = 3 - obras.length;
            teatreObras = `
            <section id="events" class="events">
                <div class="container-fluid" >

                    <div class="section-header">
                        <h2>Obres</h2>
                        <p>Pròximes <span>Obres</span> a les Balears</p>
                    </div>

                    <div class="slides-3-no-auto swiper">
                        <div class="swiper-wrapper">
                `;

            // Genera el html para cada una de las obras a mostrar    
            for(const obra of obras){
                let aux = obra.additionalProperty;
                let price;
                for(const a of aux){
                    if(a.name = "price"){
                    price = a.value;
                    }
                }
                teatreObras = teatreObras.concat(
                        `<button onclick="obtainObra(${obra.identifier})" class="swiper-slide event-item d-flex flex-column justify-content-end"
                            style="background-image: url(${obra.image.contentUrl})">
                                <h3>${obra.name}</h3>
                                <div class="price align-self-start">$${price}</div>
                                <p class="description">
                                    ${obra.description.slice(0,150)}...
                                </p>
                                </button><!-- End Event item -->`);
            }
            //Añadimos los carteles de próximamente
            while(valor>0){ 
                teatreObras = teatreObras.concat(`<div class="swiper-slide event-item d-flex flex-column justify-content-end" style="background-image: url(assets/img/obres/proximamente.jpg)"></div>`);
                valor--;
            }
            teatreObras = teatreObras.concat(`</div>
                            </div>
                        </div>
                    </section><!-- End Events Section -->`);

        }else{
            //Caso donde hay mas de 3 obras
            teatreObras = `
            <section id="events" class="events">
                <div class="container-fluid" >

                    <div class="section-header">
                        <h2>Obres</h2>
                        <p>Pròximes <span>Obres</span> a les Balears</p>
                    </div>

                    <div class="slides-3 swiper">
                <div class="swiper-wrapper">`;

            for(const obra of obras){
                let aux = obra.additionalProperty;
                let price;
                for(const a of aux){
                    if(a.name = "price"){
                    price = a.value;
                    }
                }
                teatreObras = teatreObras.concat(
                    `<button onclick="obtainObra(${obra.identifier})" class="swiper-slide event-item d-flex flex-column justify-content-end"
                        style="background-image: url(${obra.image.contentUrl})">
                                    <h3>${obra.name}</h3>
                                    <div class="price align-self-start">$${price}</div>
                                    <p class="description">
                                    ${obra.description.slice(0,150)}...
                                    </p>
                                </button><!-- End Event item -->`);
            }
            teatreObras = teatreObras.concat(`</div>
                            <div class="swiper-pagination"></div>
                        </div>
                    </div>
                </section><!-- End Events Section -->`);
            }
    }else{
        // Caso donde el teatro no tiene obras
        teatreObras =  `
        <!-- ======= Testimonials Section ======= -->
            <section id="events" class="events">
                <div class="container-fluid" >
                    <div class="section-header">
                        <h2>Obres</h2>
                        <p>Pròximes <span>Obres</span> a les Balears</p>
                        <h3>Obras no disponibles</h3>
                    </div>
                </div>
            </section><!-- End Events Section -->`;
    }

    return teatreObras;
}

/**
 * Genera HTML del mapa donde el usuario va a poder ver como dirigirse hacia el teatro en cuestión
 * 
 * @returns       Devuelve el HTML que actualizará la sección del mapa
 */
function generaHTMLMapaTeatros(){
    let teatreMapa = `
    <!-- ======= Contact Section ======= -->
      <section id="mapa" class="section-bg">
        <div class="container" >
  
          <div class="section-header">
            <h2>Mapa</h2>
            <p>Descobreix com <span>Arribar</span></p>
          </div>
          <div class="mapa-contenedor">
                <div id="map" class="mapa-align"></div> <!-- Contenedor del mapa -->
                    <div class="mapa-element">
                        <div id="weather">
                        </div>
                        <div>
                            <p>Vols averiguar com arribar?</p>
                            <button id="mapa-button" class="mapa-button">Ubicam</button>
                        </div>   
                    </div>
                </div>
            </div>
        </div>
      </section><!-- End Contact Section -->`;
    
      return teatreMapa;
}

/*-----------------------------------------------------------------------------
                Conjunto de funciones para usar Weather API
------------------------------------------------------------------------------*/

/**
 * Dada una longitud y una latitud obtenemos el tiempo que hace en esas coordenadas
 * usando la api api.weatherapi.com que es gratuita
 * 
 * @param {*} latitud   latitud del teatro
 * @param {*} longitud  longitud del teatro
 * @returns             JSON, tiempo en las coords
 */
async function getWeather(latitud, longitud) {
    //URL a la que hacer la petición
    let baseURL = "https://api.weatherapi.com/v1/current.json"
    //Añadimos parámetros a la URL
    baseURL += `?key=${WEATHER_KEY}&q=${latitud},${longitud}&lang=es`;
    try {
        const response = await fetch(baseURL);
        if (response.ok) return response.json();
        return null
    } catch (error) {
        return null;
    }
}

/**
 * Genera el HTML donde se muestra la temperatura y el tiempo del lugar
 * @param {*} weather   JSON de respuesta de la API
 * @returns             Devuelve los icones del tiempo de la localidad
 */
function generaHTMLWeatherTeatro(weather){
    let wheaterTeatro = `
    <h3>Temps actual a ${weather.location.name}</h3>
    <div>
        <img src="${weather.current.condition.icon}">
        <p>${weather.current.condition.text} ${weather.current.temp_c}ºC</p>
    </div>
    `;
    return wheaterTeatro;
}