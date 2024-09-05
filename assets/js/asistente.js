const chatBubble = document.getElementById("chat-bubble");
const chatWindow = document.getElementById("chat-window");


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
            const response = await obtenerMensaje(idMensaje);

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
        let response = await fetch(`https://api.openai.com/v1/threads/${thread}/messages`, {
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
        const idMensaje = data.id

        response = await fetch(`https://api.openai.com/v1/threads/${thread}/runs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'OpenAI-Beta': `assistants=v2`
            },
            body: JSON.stringify({assistant_id : assistant})
        });

        return idMensaje;

    } catch (error) {
        console.error(error);
    }
}


async function obtenerMensaje(idMensaje){
    let finished = false;
    let mensaje;

    while(!finished){
        setTimeout(2000)
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
                    finished = true;        
                    mensaje = info.data[0].content[0].text.value;
                }

            }
    
        } catch (error) {
            console.error(error);
        }
    }
    return mensaje;
}