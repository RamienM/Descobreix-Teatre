/* 
    JavaScript "mapa.js", el siguiente JavaScript contiene todas las funciones necesarias para el correcto
    funcionamiento de los mapas. Se incluyen las funciones encargadas:
      - Mostrar generar el mapa, añadir
      - Marcadores con popups
      - Generación de rutas

    -----------------------------------------Autores----------------------------------------------------------
        -> Rubén Ramis
        -> Silvia Moia
        -> Arnau Vidal
    ----------------------------------------------------------------------------------------------------------
*/

//Variable auxiliares que nos serviran para la geolocalización
var map;

var options;

/**
 * Función que se encarga de mostrar el mapa y añadir los marcadores necesarios
 * según el filtro de eventos que se desean ver.
 */
function mostraMapa(){
  //Limitamos los Zooms y nos situamos sobre las Islas Baleares
  map = L.map('map',{
    minZoom: 7,
    maxZoom:20,
  }).setView([39.64192372426212, 3.009609121353564], 7); // Coordenadas de Mallorca;

  options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  };

  // Copyright de OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  //Cogemos el elemento seleccionado del filto
  const selector = document.getElementById("filtraMapa");
  let opcioSeleccionada = selector.value;
  //Variable necesaria para poder ir eliminado marcadores
  var marker = new Array();
  generaMapa(opcioSeleccionada,map, marker);
  //Creamos un action listener para el filtro
  selector.addEventListener("change", () => {
    opcioSeleccionada = selector.value;
    generaMapa(opcioSeleccionada, map, marker);
  });

  /**
   * Función encargada de añadir los marcadores al mapa.
   * 
   * @param {*} opcioSeleccionada   Evento/Opcion selecionada por el filtro
   * @param {*} map                 Mapa donde se tienen que añadir los marcadores
   * @param {*} marker              Array de marcadores
   */
  function generaMapa(opcioSeleccionada, map, marker){
    //Si hay marcadores anteriores los borramos
    if(marker.lenght != 0){
      for(const marcador of marker){
        map.removeLayer(marcador)
      }
    }
    //Switch para seleccionar el JSON que hay que leer
    switch (opcioSeleccionada) {
      //Evento de teatros: Preparamos los marcadores
      case "Teatres":
        fetch("/assets/json/Teatre.json")
          .then((response) => response.json())
          .then((data) => {
              let teatres = data.itemListElement;
              //Icono personalizado de DescobreixTeatre
              var blueIcon = L.icon({
                iconUrl: '../assets/img/svg/descobreixteatre.svg',
                iconSize:     [25, 25], // size of the icon
              });
              for (const teatre of teatres) {
                  let m = L.marker([teatre.geo.latitude, teatre.geo.longitude], {icon: blueIcon}).addTo(map);
                  m.bindPopup(`<button onclick="obtainTeatre(${teatre.identifier})">
                    ${teatre.name}
                  </button>`);
                  marker.push(m);
              }
          })
          .catch((error) => {
            console.error(error);
          });
          
        break;
      //Evento de Ferias: Preparamos los marcadores
      case "Fires":
        fetch("https://www.firabalear.com/assets/json/fires.json")
          .then((response) => response.json())
          .then((data) => {
            //Icono personalizado para las ferias
            var blueIcon = L.icon({
              iconUrl: '../assets/img/svg/ferias.svg',
              iconSize:     [25, 25], // size of the icon
            });
              for (const fira of data) {
                  let m = L.marker([fira.location.geo.latitude, fira.location.geo.longitude], {icon: blueIcon}).addTo(map);
                  m.bindPopup(fira.name);
                  marker.push(m);
              }
          })
          .catch((error) => {
            console.error(error);
        });
        break;
      //Evento de Fiestas: Preparamos los marcadores
      case "Festes":
        fetch("https://www.festesbalears.com/json/Festes.json")
          .then((response) => response.json())
          .then((data) => {
              let fiestas = data.itemListElement;
              //Icono personalizado para las fiestas
              var blueIcon = L.icon({
                iconUrl: '../assets/img/svg/fiestas.svg',
            
                iconSize:     [25, 25], // size of the icon
            });
              for (const fiesta of fiestas) {
                  let m = L.marker([fiesta.geo.latitude, fiesta.geo.longitude], {icon: blueIcon}).addTo(map);
                  m.bindPopup(fiesta.name);
                  marker.push(m);
              }
          })
          .catch((error) => {
            console.error(error);
          });
        break;
      }
    }
}

/**
 * Función encargada de la Geolocalización del usuario. Guardará en webStorage la última ubicación en caso de que el usuario
 * no disponga de internet mas adelante.
 */
function geoPosicion(){
  navigator.geolocation.getCurrentPosition(success, error, options);
  function success(pos) {
    //En caso de que se haya podido obtener la ubicación le añadimos un marcador personalizado
    const crd = pos.coords;
    var redIcon = L.icon({
        iconUrl: '../assets/img/svg/map-marker-red.svg',

        iconSize:     [25, 25], // size of the icon
    });
    var markerPos = L.marker([crd.latitude, crd.longitude], {icon: redIcon}).addTo(map);
    markerPos.bindPopup("Your Position");
    document.getElementById("mapa-button").disabled = true;
    localStorage.setItem('userLocation', JSON.stringify({
      latitude: crd.latitude,
      longitude: crd.longitude
    }));
  }

  function error(err) {
    //Alertamos al usuario que ha habido un error al obtener su ubicación
    console.warn(`ERROR(${err.code}): ${err.message}`);
    alert("Error de geolocalizació: Reviseu la conexió a internet o els permisos d'ubicació");
  }

}


/*-----------------------------------------------------------------------------
                Funciones que usa teatros.js
------------------------------------------------------------------------------*/
/**
 * Función encargada de generar la ruta que llevará al usuario al teatro seleccionado
 * 
 * @param {*} teatre  Información sobre el teatro que queremos llegar
 */
function generaRutaMapaTeatros(teatre){
  geoPosicion();
  var crd = JSON.parse(localStorage.getItem('userLocation'));
  if(crd != null){
    var markerPos = L.marker([crd.latitude, crd.longitude]);
    let m = L.marker([teatre.geo.latitude, teatre.geo.longitude]);
  
    L.Routing.control({
      waypoints: [
        markerPos.getLatLng(),
        m.getLatLng()
      ],
      autoRoute:true
    }).addTo(map);
    document.getElementById("mapa-button").disabled = true;
  }
}

/**
 * Genera el mapa para el teatro que ha seleccionado el usuario.
 * 
 * @param {*} teatre  Teatro que el usuario ha seleccionado en teatros.js
 */
function generaMapaTeatros(teatre){
  //Nos situamos en las Islas Baleares
  map = L.map('map',{
    minZoom: 7,
    maxZoom:20,
  }).setView([39.64192372426212, 3.009609121353564], 7); // Coordenadas de Mallorca;

  options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  };

  // Copyright de OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  //Icono personalizado de DescobreixTeatre
  var blueIcon = L.icon({
    iconUrl: '../assets/img/svg/descobreixteatre.svg',
  
    iconSize:     [25, 25], // size of the icon
  });
  let m = L.marker([teatre.geo.latitude, teatre.geo.longitude], {icon: blueIcon}).addTo(map);
  m.bindPopup(teatre.name);
}