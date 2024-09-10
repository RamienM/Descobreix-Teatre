const chatBubble = document.getElementById("chat-bubble");
const chatWindow = document.getElementById("chat-window");

const apiKey = "Assistant API Key";
const assistant = "Assistant ID";
let active = false;
let thread;

chatBubble.addEventListener("click", async function() {
    chatWindow.style.display = chatWindow.style.display === "none" || chatWindow.style.display === "" ? "flex" : "none";
    if(!active){
        thread = await initThread();
    }
});

// Manejar el envío de mensajes al presionar Enter
async function handleKeyPress(event) {
    if (event.key === "Enter") {
        const input = document.getElementById("userInput");
        const message = input.value.trim();
        input.disabled = true;
        
        if (message !== "") {
            input.placeholder = "Procesando..."
            // Agregar el mensaje del usuario a la ventana de chat
            const chatBody = document.getElementById("chat-body");
            chatBody.innerHTML += `<p><strong>Tú:</strong> ${message}</p>`;
            
            // Limpiar el campo de texto
            input.value = "";

            const idMensaje = await mandarMesaje(message);
            const idRun = await ejecutarAssistant();
            const response = await obtenerMensaje(idMensaje, idRun);

            if (response != null) {
                chatBody.innerHTML += `<p><strong>Asistente:</strong> ${response}</p>`;
            } else {
                chatBody.innerHTML += `<p><strong>Asistente:</strong> No se recibió una respuesta válida.</p>`;
            }

            // Scroll al final del chat
            chatBody.scrollTop = chatBody.scrollHeight;
        }
        input.disabled = false;
        input.placeholder = "Escribe tu mensaje...";
    }
}

/**
 * Iniciamos el contedenor donde se iran almacenando los mensajes 
 * para su posterior procesado.
 * @returns Devuelve el id del contenedor
 */
async function initThread() {
    try {
        const response = await fetch('https://api.openai.com/v1/threads', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'OpenAI-Beta': `assistants=v2`
            }
        });

        const data = await response.json();
        return data.id;

    } catch (error) {
        console.error(error);
    }

}

/**
 * Añade un mensaje al contenedor para su analisis.
 * @param {String} mensaje      Mensaje a almacenar
 * @returns     Devuelve el id del mensaje
 */
async function mandarMesaje(mensaje) {
    try {
        const response = await fetch(`https://api.openai.com/v1/threads/${thread}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'OpenAI-Beta': `assistants=v2`
            },
            body: JSON.stringify({
                role : "user",
                content : mensaje
            })
        });

        const data = await response.json();
        return data.id
    } catch (error) {
        console.error(error);
    }
}

/**
 * Se encarga de poner en marcha el Assistant para que analice 
 * los mensjes que hay en el contendedor
 * @returns     Devuelde el id de la ejecución
 */
async function ejecutarAssistant() {
    try {
        const response = await fetch(`https://api.openai.com/v1/threads/${thread}/runs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'OpenAI-Beta': `assistants=v2`
            },
            body: JSON.stringify({assistant_id : assistant})
        });

        const data = await response.json();

        return data.id;

    } catch (error) {
        console.error(error);
    }
}


/**
 * Obtenemos la ejecución, aquí comprobaremos si es necesario
 * realizar procedimientos extras como llamar a funciones.
 * @param {String} idMensaje        Identificador del mensaje       
 * @param {String} idRun            Identificador de la ejecución
 */
async function obtenerMensaje(idMensaje, idRun){
    let finished = false;

    while(!finished){
        finished = await consultMessageStatus(idRun); //Requiere controlar los cancelled
        /*
        Como las peticiones tarda en procesarse, damos tiempo antes de
        volver a consultar la petición.
        */
        setTimeout(10000);
    }

    try {
        const response = await fetch(`https://api.openai.com/v1/threads/${thread}/messages`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'OpenAI-Beta': `assistants=v2`
            }
        });

        const info = await response.json();

        if(info.first_id != idMensaje && info.last_id != null){
            if(info.data[0].content.length > 0){      
                return info.data[0].content[0].text.value;
            }

        }

    } catch (error) {
        console.error(error);
    }
}

/**
 * Comprobamos el estado del mensaje. Este pueda estar procesandose
 * o requerir acciones extras.
 * @param {*} idRun         ID de la ejecucion
 * @returns     Devuelve true cuando el mesaje se ha procesado
 */
async function consultMessageStatus(idRun) {
    try {
        const response = await fetch(`https://api.openai.com/v1/threads/${thread}/runs/${idRun}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'OpenAI-Beta': `assistants=v2`
            }
        });

        const data = await response.json();

        if(data.status == "completed"){
            return true;
        }else if(data.status == "requires_action"){ //Requiere acciones extras
            await requiredAction(data, idRun);
        }

    } catch (error) {
        console.error(error);
    }
}

/**
 * Cuando se requiere acciones es necesario proporcionar infomación,
 * para ello identificamos que necesita y llamamos la función 
 * correspondiente
 * @param {*} data          JSON devuelto por Open AI
 * @param {*} idRun         ID de la ejecución
 */
async function requiredAction(data, idRun) {
    let tools_output = [] //Es posible que se incluyan varias peticiones
    const tools = data.required_action.submit_tool_outputs.tool_calls;
    //Iteramos todas las peticiones
    for(const tool of tools){
        if(tool.function.name == "get_weather_theater"){
            const datos = JSON.parse(tool.function.arguments);

            let weather = await getWeather(datos.latitude, datos.longitude);
            tools_output.push({
                "tool_call_id" : tool.id,
                "output" : weather.current.condition.text
            });
        }
    }
    await sendRequiredAction(tools_output,idRun)
}

/**
 * Informamos a la API de Assistant que la petición se resuelto,
 * y mandamos la información necesaria.
 * @param {*} tools_output      Respuesta a las peticiones  
 * @param {*} runId             ID de la ejecución
 */
async function sendRequiredAction(tools_output, runId) {
    try {
        await fetch(`https://api.openai.com/v1/threads/${thread}/runs/${runId}/submit_tool_outputs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'OpenAI-Beta': `assistants=v2`
            },
            body: JSON.stringify({tool_outputs : tools_output})
            
        });
    } catch (error) {
        console.error(error);
    }
}