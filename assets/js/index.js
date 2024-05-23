/*
    JavaScript "index.js", el siguiente JavaScript se encarga de actualizar el DOM para que muestre la página principal.
    
    En la página principal se prentende mostrar la siguiente información:
        - Header
            · Información sobre www.descobreixteatre.com
            · Logo principal de Descobreix Teatre
        
        - Teatros
            · Filtro que permite mostrar todos los teatros o los teatros de las siguientes islas
                o Mallorca
                o Eivissa
                o Menorca
        
        - Obras
            · Swiper de 3 slides que muestra las obras que se van a realizar durante el mes que se encuentra el usuario.
        
        - Mapa de eventos
            · Mapa de OpenStreetMap donde se muestran por defectos los teatros de Baleares
            · Filtro que permite mostrar otros eventos o lugares:
                o Teatros
                o Ferias
                o Fiestas
            · Botón que permite al usuario ubicarse en el mapa haciendo uso Geolocation

        - Sobre Nosotros
            · Información de quienes somos y los integrantes que han realizado la página web
            · Video desmostrativo del funcionamiento de la página

        - Contador
            · Haciendo uso del JSON disponemos un contador dinámico que muestra:
                o La cantidad de islas con teatros
                o Localidades con teatros
                o Cantidad de teatros
                o Cantidad de obras
        
        -Footer
            · Contacto de la página inventado
            · Disponibilidad horaria inventada
            · Advertencia de la veracidad de la información de la página
            · Proposicito del desarrollo de la página
            · Plantilla usada

    -----------------------------------------Autores----------------------------------------------------------
        -> Rubén Ramis
        -> Silvia Moia
        -> Arnau Vidal
    ----------------------------------------------------------------------------------------------------------
*/

/**
 * Función que permite actualizar el DOM para que muestre el contenido de la página principal.
 *      - La función principalmente se encarga de llamar a funciones auxiliares para montar el nuevo HTML
 *      - También se encarga de recargar funciones necesarias para el correcto funcionamiento de la página
 */
async function reloadIndex(){
    //En caso de que el usuario se haya dejado activo el speechSynthesis se lo desactivamos
    if(window.speechSynthesis.speaking) window.speechSynthesis.cancel();
    //Configuramos el botón superior que permite volver a la página principal y la barra de navegación
    let indexHeader = document.getElementById('nose');
    let header = `<button onclick="reloadIndex()" class="logo d-flex align-items-center me-auto me-lg-0">
                    <h1>Teatre<span>.</span></h1>
                  </button>

      <nav id="navbar" class="navbar">
          <ul>
              <li><a href="#hero">Inici</a></li>
              <li><a href="#menu">Teatres</a></li>
              <li><a href="#events">Obres</a></li>
              <li><a href="#mapa">Mapa events</a></li>
              <li><a href="#about">Sobre nosaltres</a></li>
          </ul>
      </nav><!-- .navbar -->
      <i class="mobile-nav-toggle mobile-nav-show bi bi-list"></i>
      <i class="mobile-nav-toggle mobile-nav-hide d-none bi bi-x"></i>`;

    indexHeader.innerHTML = header;

    //Actualizamos el div encargado de mostrar la información
    let indexHero = document.getElementById('info');
    let hero = `<div class="row justify-content-between gy-5">
        <div
                    class="col-lg-5 order-2 order-lg-1 d-flex flex-column justify-content-center align-items-center align-items-lg-start text-center text-lg-start">
                    <h2  id="Name">Descobreix<br>Teatre!</h2>
                    <p  id="Description">Totes les obres teatrals de Balears les tens només a un click. Entra i descobreix-ho!</p>
                </div>
                <div class="col-lg-5 order-1 order-lg-2 text-center text-lg-start">
                    <img src="assets/img/svg/hero-img.svg" class="img-fluid img-indexHero-medidas" alt="" id="ImageMain">
                </div>
        </div>`

    indexHero.innerHTML = hero;

    //Montamos filtro teatros, obras, mapa, sobre nosotros contador y footer
    let indexHTML = document.getElementById('main');
    let main = generarHTMLteatrosIndex();
    main = main.concat(generarHTMLobrasIndex());
    main = main.concat(generarHTMLmapa());
    main = main.concat(generaHTMLNosaltres());
    main = main.concat(generarHTMLcontador());
    main = main.concat(generaHTMLFooter());

    indexHTML.innerHTML = main;
    //Movemos al usuario hasta arriba
    window.scrollTo(0, 0);
    //Funciones auxiliares y recargar las ya inicializadas
    mostraTeatres();
    mostraObres();
    mostraMapa();
    reloadAll();
    contador();
}

/**
 * Función encargada de preparar el HTML donde se mostrarán los teatros, en la siguiente función se prepara el filtro
 * y el div que contendrá los teatros. Los teatros serán añadidos usando la función mostraTeatres()
 * 
 * @returns     Devuelve el HTML del apartado de teatros
 */
function generarHTMLteatrosIndex(){
  let teatros = `
        <!-- ======= Menu Section ======= -->
        <section id="menu" class="menu">
            <div class="container" >

                <div class="section-header">
                    <p>Consulta qualsevol <span>Teatre </span>del teu entorn</p>
                </div>

                <label for="filtraPer" class="visually-hidden">Filtra per</label>
                    <select class="form-select" id="filtraPer" style="border-radius: 4px;">
                      <option vlue="Totes les illes" selected>Totes les illes</option>
                      <option value="Mallorca">Mallorca</option>
                      <option value="Menorca">Menorca</option>
                      <option value="Eivissa">Eivissa</option>
                </select>
                 
                <div class="tab-content" id="teatres">
                </div>

            </div>
        </section><!-- End Menu Section -->
  `;
  return teatros;
}

/**
 * Función encargada de preparar el HTML donde se mostrarán las obras, en la siguiente función se prepara 
 * el div que contendrá las obras. Los obras serán añadidas usando la función mostraTeatres()
 * 
 * @returns         Devuelve el HTML del apartado de las obras
 */
function generarHTMLobrasIndex(){
  let obras = `
        <section id="events" class="events section-bg">
        <div class="container-fluid" data-aos="fade-up">

            <div class="section-header">
                <h2>Obres</h2>
                <p>Obres <span>aquest mes</span> a les Balears</p>
            </div>
            <div id="desplazamiento">
            </div>

        </div>
      </section><!-- End Events Section -->
        `;
  return obras;
}

/**
 * Función encargada de preparar el HTML donde se mostrará el mapa, un filtro donde el usuario podrá seleccionar que
 * clase de evento desea ver en el mapa (se usan JSON de compañeros) y un boton que permite al usuario saber su posición
 * haciendo uso de Geolocation
 * 
 * @returns     Devuelve el HTML del apartado de mapa
 */
function generarHTMLmapa(){
    let indexMapa = `
    <!-- ======= Contact Section ======= -->
      <section id="mapa">
        <div class="container">
  
          <div class="section-header">
            <h2>Mapa</h2>
            <p>Descobreix <span>Events</span></p>
          </div>
          <div class="mapa-contenedor">
                    <div id="map" class="mapa-align"></div> <!-- Contenedor del mapa -->
                      <div class="mapa-element">
                          <div class="mapa-filter">
                              <p>Seleccioni quin event vol visualizar:</p>
                              <label for="filtraMapa" class="visually-hidden">Filtra per</label>
                                  <select class="form-select" id="filtraMapa" style="border-radius: 4px;">
                                  <option vlue="Teatres" selected>Teatres</option>
                                  <option value="Fires">Fires</option>
                                  <option value="Festes">Festes</option>
                              </select>
                          </div>
                          <div>
                              <p>Vols visualizar la teva posició?</p>
                              <button id="mapa-button" class="mapa-button" onclick="geoPosicion()">Ubicam</button>
                          </div>   
                      </div>
          </div>
  
        </div>
      </section><!-- End Contact Section -->`;
    
    return indexMapa;
}

/**
 * Función encargada de generar el HTML del apartado Sobre Nosotros donde se puede encontrar información sobre los integrates
 * que han realizado la práctica y un video ilustrativo sobre el funcionamiento de la página
 * 
 * @returns         Devuelve el HTML del apartado sobre nosotros
 */
function generaHTMLNosaltres(){
  let nosaltres = `
  <!-- ======= About Section ======= -->
        <section id="about" class="about section-bg">
            <div class="container">
          
              <div class="section-header">
                <h2>Sobre nosaltres</h2>
                <p>Qui som <span>?</span></p>
              </div>
          
              <div class="row d-flex">  <div class="col-lg-5 content ps-0 ps-lg-5">  <p class="fst-italic">
                    Som un grup que està cursant l'assignatura de Multimèdia del grau d'Enginyeria Informàtica Universitat de les Illes Balears.
                  </p>
                  <ul>
                    <li><i class="bi bi-check2-all"></i> Rubén Ramis</li>
                    <li><i class="bi bi-check2-all"></i> Arnau Vidal</li>
                    <li><i class="bi bi-check2-all"></i> Sílvia Moià</li>
                  </ul>
                </div>
          
                <div class="col-lg-7">  <div class="position-relative mt-4">
                        <img src="assets/img/about-2.jpg" class="img-fluid img-indexContador-medidas" alt="">
                        <a href="assets/vid/DescobreixTeatre.mp4" class="glightbox play-btn" aria-label="Nuestra presentacion"></a>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <!-- End About Section -->
  `
  return nosaltres;
}

/**
 * Función encargada de generar el HTML del apartado contador, se encarga de preparar el div que se 
 * completará haciendo uso de la función contador (clase separada al ser async, aparte que facilita el trabajo)
 * 
 * @returns         Devuelve el HTML del apartado del contador
 */
function generarHTMLcontador(){
  let contador = `<!-- ======= Stats Counter Section ======= -->
    <section id="stats-counter" class="stats-counter">
        <div class="container">
            <div id="cont" class="row gy-4">
            </div>
        </div>
    </section><!-- End Stats Counter Section -->`;
  return contador;
}

/**
 * Función encargada de generar el HTML del apartado del footer, en este se encuentra:
 *  - Contacto (inventado)
 *  - Disponibilidad (inventada)
 *  - Advertencia sobre la veracidad de la información
 *  - Proposito de la página web
 * 
 * @returns         Devuelve el HTML del apartado footer
 */
function generaHTMLFooter(){
  let footer = `<!-- ======= Footer ======= -->
  <footer id="footer" class="footer">

      <div class="container">
          <div class="row gy-3">
            <div class="col-lg-3 col-md-6 footer-links d-flex">
              <i class="bi bi-telephone icon"></i>
                <div>
                    <p class="cont-index">Contacte</p>
                    <p>
                        <strong>Telèfon:</strong> +34 622 22 22 22<br>
                        <strong>Correu:</strong> info@descobreixteatre.com<br>
                    </p>
                </div>
            </div>

            <div class="col-lg-3 col-md-6 footer-links d-flex">
                <i class="bi bi-clock icon"></i>
                <div>
                    <p class="cont-index">Disponibilitat horària</p>
                    <p>
                        <strong>Dill-Div: 11AM</strong> - 14PM<br>
                    </p>
                </div>
            </div>
            <div class="col-lg-3 col-md-6 footer-links d-flex">
                <i class="bi bi-patch-exclamation-fill icon"></i>
                <div>
                    <p class="cont-index">Advertència</p>
                    <p>
                        <strong>Aquesta pàgina web no ofereix informació encertada, si us plau no fer servir la informació com a referència</strong>
                    </p>
                </div>
            </div>
            <div class="col-lg-3 col-md-6 footer-links d-flex">
                <i class="bi bi-cloud-moon-fill icon"></i>
                <div>
                    <p class="cont-index">Propòsit</p>
                    <p>
                        Pàgina web desenvolupada com a pràctica per a la asignatura 21755-Tecnologia Multimedia d'Enginyeria Informàtica de la Universitat de les Illes Balears
                    </p>
                </div>
            </div>
      </div>
    </div>

      <div class="container">
          <div class="credits">
              <!-- All the links in the footer should remain intact. -->
              <!-- You can delete the links only if you purchased the pro version. -->
              <!-- Licensing information: https://bootstrapmade.com/license/ -->
              <!-- Purchase the pro version with working PHP/AJAX contact form: https://bootstrapmade.com/yummy-bootstrap-restaurant-website-template/ -->
              Designed by <a href="https://bootstrapmade.com/">BootstrapMade</a>
          </div>
      </div>

  </footer><!-- End Footer -->
  <!-- End Footer -->

  <a href="#" class="scroll-top d-flex align-items-center justify-content-center"><i
          class="bi bi-arrow-up-short"></i></a>`;
          return footer;
}

/*-----------------------------------------------------------------------------
                    Conjunto de funciones de Contador
------------------------------------------------------------------------------*/
/**
 * Función que haciendo uso del JSON generamos el HTML necesario para añadir al contenedor
 * "cont" de contador para tener un contador dinámico
 */
async function contador(){
    let contador;

    let jsons = await fetch("../assets/json/Teatre.json")
    .then((response) => response.json())
    .catch((error) => {
      console.error(error);
    });

    let element = jsons.itemListElement;
    contador = generarHTMLcontadorIslas(element);
    contador = contador.concat(generarHTMLcontadorLocalidades(element));
    contador = contador.concat(generarHTMLcontadorTeatros(element));
    contador = contador.concat(generarHTMLcontadorObras(element));

    let cont = document.getElementById('cont');
    cont.innerHTML = contador;
    //Importante recargar la función counter que anima los movimientos de los numeros
    reloadCounter()
}
/**
 * Función encargada de generar el HTML del apartado de las islas de contador
 * 
 * @param {*} element   Contenido del JSON 
 * @returns             HTML necesario para el contador sobre la cantidad de islas
 */
function generarHTMLcontadorIslas(element){
    //Uso de Set para no contar repetidos
    let illes = new Set();
    for(const isla of element){
        illes.add(isla.address.addressRegion);
    }
    let contadorIslas = `
    <div class="col-lg-3 col-md-6">
        <div class="stats-item text-center w-100 h-100">
            <span data-purecounter-start="0" data-purecounter-end="${illes.size}" data-purecounter-duration="1"
                class="purecounter"></span>
            <p>Illes</p>
        </div>
    </div><!-- End Stats Item -->`;
    return contadorIslas;
}
/**
 * Función encargada de generar el HTML del apartado de localidades de contador
 * @param {*} element   Contenido del JSON 
 * @returns             HTML necesario para el contador sobre la cantidad de localidades
 */
function generarHTMLcontadorLocalidades(element){
    //Uso de Set para no contar repetidos
    let localidades = new Set();
    for(const isla of element){
        localidades.add(isla.address.addressLocality);
    }
    let contadorLocalidades = `
    <div class="col-lg-3 col-md-6">
        <div class="stats-item text-center w-100 h-100">
            <span data-purecounter-start="0" data-purecounter-end="${localidades.size}" data-purecounter-duration="1"
                class="purecounter"></span>
            <p>Localidades</p>
        </div>
    </div><!-- End Stats Item -->`;
    return contadorLocalidades;
}
/**
 * Función encargada de generar el HTML del apartado de teatros de contador
 * @param {*} element   Contenido del JSON 
 * @returns             HTML necesario para el contador sobre la cantidad de teatros
 */
function generarHTMLcontadorTeatros(element){
    let contadorTeatros = `
        <div class="col-lg-3 col-md-6">
            <div class="stats-item text-center w-100 h-100">
                <span data-purecounter-start="0" data-purecounter-end="${element.length}" data-purecounter-duration="1"
                    class="purecounter"></span>
                <p>Teatres</p>
            </div>
         </div><!-- End Stats Item -->
    `;
    return contadorTeatros;
}
/**
 * Función encargada de generar el HTML del apartado de obras de contador
 * @param {*} element   Contenido del JSON 
 * @returns             HTML necesario para el contador sobre la cantidad de obras
 */
function generarHTMLcontadorObras(element){
    //Uso de Set para no contar repetidos
    let obres = new Set();
    for(const teatro of element){
        for(const obra of teatro.event){
            obres.add(obra.name);
        }
    }
    let contadorObras = `
        <div class="col-lg-3 col-md-6">
            <div class="stats-item text-center w-100 h-100">
                <span data-purecounter-start="0" data-purecounter-end="${obres.size}" data-purecounter-duration="1"
                    class="purecounter"></span>
                <p>Obres</p>
            </div>
        </div><!-- End Stats Item -->
    `;
    return contadorObras;
}

/*-----------------------------------------------------------------------------
                    Conjunto de funciones de mostraTeatres
Estas funciones se encargan principalmente de generar el HTML de teatros y obras
de la página principal. Haciendo uso del filtro correspondiente
------------------------------------------------------------------------------*/
/**
 * Función principal que se encarga de añadir los teatros y obras dependiendo del
 * filtro seleccionado.
 */
function mostraTeatres(){
    const selector = document.getElementById("filtraPer");
    let opcioSeleccionada = selector.value;
    getTeatres(opcioSeleccionada);

    //Action Listener para cuando se cambie el filtro
    selector.addEventListener("change", () => {
        opcioSeleccionada = selector.value;
        getTeatres(opcioSeleccionada);
    });
}

/**
 * Función encargada de leer el JSON para obtener la información necesaria sobre teatros y obras. 
 * @param {*} filtre    Elemento seleccionado con el filtro.
 */
async function getTeatres(filtre){
    //Leemos el json
    let jsons = await fetch(
        "../assets/json/Teatre.json"
      )
        .then((response) => response.json())
        .catch((error) => {
          console.error(error);
        });

    //Filtramos el json
    if(filtre == "Totes les illes"){
        jsonsFiltrats = jsons.itemListElement
    }else{
        jsonsFiltrats = jsons.itemListElement.filter(
            (json) => json.address.addressRegion === filtre
        );
    }
        

        let htmlTeatres = `<div class="tab-pane fade active show" id="menu-starters">
        <div class="tab-header text-center">
        <p>Teatres</p>
        <h3>${filtre}</h3>
        </div>
        <div class="row gy-5">`

        //Generación del HTML de los teatros
        jsonsFiltrats.forEach(element => {
            htmlTeatres = htmlTeatres.concat(`
            <div class="col-lg-4 menu-item">
                <button onclick="obtainTeatre(${element.identifier})"><img
                        src="${element.image.contentUrl}" class="img-index-medidas menu-img img-fluid" alt="">
                <h4>${element.name}</h4>
                </button>
            </div>`);
        });
        htmlTeatres = htmlTeatres.concat('</div></div>');
        document.getElementById("teatres").innerHTML = htmlTeatres;
}

/**
 * Función encargada de añadir las obras en la sección de obras correspondiente, se mostrarán
 * las obras disponibles en el mes en que se encuentre el usuario
 */
async function mostraObres(){
    //Leemos el JSON
    let jsons = await fetch(
        "../assets/json/Teatre.json"
      )
        .then((response) => response.json())
        .catch((error) => {
          console.error(error);
        });
    let htmlObres = `<div class="slides-3 swiper">
        <div class="swiper-wrapper" id="obres">                      
    `;

    let obres = [];
    jsons.itemListElement.forEach(element => {
        element.event.forEach(obra => {
            if(new Date(Date.parse(obra.startDate)).getMonth() == new Date(Date.now()).getMonth() + 3 && !obres.includes(obra.name)) {
                obres.push(obra.name);
                htmlObres = htmlObres.concat(generaHtmlObres(obra));
            }});
    });
    htmlObres = htmlObres.concat(`</div>
        <div class="swiper-pagination"></div>
    </div>`);

    document.getElementById("desplazamiento").innerHTML = htmlObres;
    //Recarga de la función auxiliar
    reloadSwiper();
}
/**
 * Función encargada de generar el HTML para que se muestren las obras correctamente en los slides.
 * 
 * @param {*} element   Contenido del JSON 
 * @returns             HTML para mostrar y interactuar con las obras
 */
function generaHtmlObres(element){
    //Obtenemos el precio
    let aux = element.additionalProperty;
    let price;
    for(const a of aux){
        if(a.name = "price"){
            price = a.value;
        }
    }
    return `
    <button onclick="obtainObra(${element.identifier})" class="swiper-slide event-item d-flex flex-column justify-content-end" style="background-image: url(${element.image.contentUrl}); width: 853.333px;">
        <h3>${element.name}</h3>
        <div class="price align-self-start">${price}€</div>
        <p class="description">
        ${element.description.slice(0,150)}...
        </p>
    </button>`
}
