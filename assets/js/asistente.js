const chatBubble = document.getElementById("chat-bubble");
const chatWindow = document.getElementById("chat-window");

const apiKey = "OPEN AI key";
const assistant = "Assistant id";
let active = false;
let thread;

chatBubble.addEventListener("click", function() {
    chatWindow.style.display = chatWindow.style.display === "none" || chatWindow.style.display === "" ? "flex" : "none";
    if(!active){
        initAssistant();
    }
});

// Manejar el envío de mensajes al presionar Enter
async function handleKeyPress(event) {
    if (event.key === "Enter") {
        const input = document.getElementById("userInput");
        const message = input.value.trim();
        
        if (message !== "") {
            // Agregar el mensaje del usuario a la ventana de chat
            const chatBody = document.getElementById("chat-body");
            chatBody.innerHTML += `<p><strong>Tú:</strong> ${message}</p>`;
            
            // Limpiar el campo de texto
            input.value = "";

            const idMensaje = await mandarMesaje(message);
            const idRun = await ejecutarMensaje();
            const response = await obtenerMensaje(idMensaje, idRun);

            if (response != null) {
                chatBody.innerHTML += `<p><strong>Asistente:</strong> ${response}</p>`;
            } else {
                chatBody.innerHTML += `<p><strong>Asistente:</strong> No se recibió una respuesta válida.</p>`;
            }

            // Scroll al final del chat
            chatBody.scrollTop = chatBody.scrollHeight;
        }
    }
}

async function initAssistant() {
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
        thread = data.id;

    } catch (error) {
        console.error(error);
    }

}

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

async function ejecutarMensaje() {
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


async function obtenerMensaje(idMensaje, idRun){
    let finished = false;

    while(!finished){
        finished = await consultMessageStatus(idRun);
        setTimeout(5000)
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

        console.log(info);
        

        if(info.first_id != idMensaje && info.last_id != null){
            if(info.data[0].content.length > 0){      
                return info.data[0].content[0].text.value;
            }

        }

    } catch (error) {
        console.error(error);
    }
}

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

        console.log(data);

        if(data.status == "completed"){
            return true;
        }else if(data.status == "requires_action"){
            await requiredAction(data, idRun);
        }

    } catch (error) {
        console.error(error);
    }
}


async function requiredAction(data, idRun) {
    let tools_output = []
    const tools = data.required_action.submit_tool_outputs.tool_calls;
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

async function sendRequiredAction(tools_output, runId) {
    console.log(JSON.stringify(tools_output));
    
    try {
        const response = await fetch(`https://api.openai.com/v1/threads/${thread}/runs/${runId}/submit_tool_outputs`, {
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