
require('dotenv').config();



const { TWILIO_NUMBER_TO_CALL, PORT, GEMINI_API_KEY } = process.env;

const { makeCall } = require('./call');

const { GoogleGenerativeAI } = require('@google/generative-ai');


const SERVER = `https://SUA_URL_RANDOMICA.ngrok.io`;


const {
    VOICE,
    WELCOME_GREETING,
    WELCOME_GREET_LANGUAGE,
    TRANSCRIPTION_LANGUAGE,
    INTERRUPTIBLE,
    DTMF_DETECTION
} = process.env;




const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const twilio = require('twilio');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });


// Middleware to parse JSON bodies
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// WebSocket connection handler
wss.on('connection', (ws) => {
    console.log('WebSocket connection established');

    async function printHoroscope(firstImpression, previsionDate, firstName, sign, horoscope) {
        console.log(`Printing horoscope for ${firstName} (${sign})\n\n${horoscope}\nFirst: ${firstImpression}`);
        
        return {
            printed: true // call your function here
        };
    }

    async function endCall() {
        console.log('Ending call');
        ws.send(JSON.stringify({
            "type": "end",
            // "handoffData": "{\"reasonCode\":\"live-agent-handoff\", \"reason\": \"The caller wants to talk to a real person\"}"
        }));

        return {
            ended: true
        };
    }
    
    const printHoroscopeFunctionDeclaration = {
        name: "printHoroscope",
        parameters: {
            type: "OBJECT",
            description: "Print a horoscope for a given person and sign.",
            properties: {
                firstImpression: {
                    type: "BOOLEAN",
                    description: "This is the first impression the user requested to print the horoscope. Default = true",
                },
                previsionDate: {
                    type: "STRING",
                    description: "Prevision date in the format 'DD/MM/YYYY'.",
                },
                firstName: {
                    type: "STRING",
                    description: "The first name of the person.",
                },
                sign: {
                    type: "STRING",
                    description: "The zodiac sign of the person in Portuguese without accentuation.",
                },
                horoscope: {
                    type: "OBJECT",
                    properties: {
                        "message": {"type": "string", "description": "The full detailed horoscope text. Add new lines without breaking words on every 45 characters."},
                        "lottery": {"type": "string", "description": "The lottery numbers for the day, 6 numbers in total from 1 to 60 in the format '00-00-00-00-00-00'."},
                        "luckyNumber": {"type": "number", "description": "The lucky number for the day."},
                        "luckyColor": {"type": "string", "description": "The lucky color for the day."},
                        "phrase_of_day": {"type": "string", "description": "The phrase of the day. Add new lines without breaking words on every 22 characters"}
                    }
                }
            },
            required: ["firstImpression", "previsionDate", "firstName", "sign", "horoscope"],
        },
    };

    const endCallDeclaration = {
        name: "endCall",
        parameters: {
            required: [],
        },
    };
      
      // Put functions in a "map" keyed by the function name so it is easier to call
    const functions = {
        printHoroscope: ({ firstImpression, previsionDate, firstName, sign, horoscope }) => {
            return printHoroscope(firstImpression, previsionDate, firstName, sign, horoscope);
        },
        endCall: () => {
            return endCall();
        }
    };

    
    const SYSTEM_INSTRUCTION = `Você é ZorAIde, uma cartomante pronta para prever o futuro de pessoas participando do TDC Summit (TDC corresponde a The Developer's Conference).
        Somente responda em português, inclusive em todos os parâmetros das funções!
        NUNCA fale o nome completo da pessoa, apenas o primeiro nome. NUNCA repita sobre quem é você e o que faz.

        O evento acontece nos dias 26 e 26 de março de 2025 e hoje é dia 26 de março de 2025. Você deve inicialmente criar a previsão para o data de hoje, porém é possível que a pessoa solicite previsões para outros dias.

        A pessoa pode informar a data de nascimento ou o signo para receber uma previsão do futuro para o dia de hoje.

        Você está interagindo com uma pessoa pelo telefone, portanto seja mais breve e direta possível. A cada nova interação, sempre finalize a conversa com uma pergunta para manter a interação.

        Ao responder a previsão por voz seja simples e forneça apenas a mensagem de previsão e nada mais. As demais informações e o formato mais completo da previsão só devem ser enviadas na função de impressão.
        Você pode responder qualquer pergunta que seja relacionada a horóscopo, astrologia ou previsões do futuro e nada mais. Se você não souber a resposta, você pode dizer que não sabe ou que não pode responder.
        Quando fizer sua previsão, você pode oferecer para imprimir o horóscopo da pessoa.
        Se ela aceitar, você deve dizer que vai imprimir o horóscopo, chamar a função 'printHoroscope'. O parâmetro 'horoscope.message' deve ser completo, com pelo menos 200 caracteres e deve quebrar de linha a cada 45 caracteres, mesmo que a frase seja mais longa que isso. O parâmetro horoscope.phrase_of_day deve quebrar de linha a cada 22 caracteres, mesmo que a frase seja mais longa que isso.

        A pessoa deve dizer o primeiro nome. Se ela não disser, você pode perguntar. Quando ela responder, não fale novamente sobre você e seja direta sobre o horóscopo e algum dado que precise.
        Seja sempre gentil e educada. Quando confirmar a impressão, pergunte se a pessoa deseja mais alguma coisa.

        Ao gerar o horóscopo impresso, liste com mais detalhes as previsões para o dia de hoje.

        A pessoa pode solicitar mais de um horóscopo impresso, então você deve estar pronta para atender a solicitação e fazer a impressão especificamente para cada signo solicitado, neste caso NÃO PERGUNTE o nome da pessoa e faça a impressão direta e não ser que a pessoa peça para falar o horóscopo.
        Se a pessoa disser o nome no início, se apresente e fale sobre você faz antes de continuar, porém seja breve e pergunte qual signo ou a data de nascimento da pessoa.`
    


    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash',
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: {
            functionDeclarations: [
                printHoroscopeFunctionDeclaration
            ],
        },
    });

    const chat = model.startChat();
    console.log('MODEL INSTRUCTION', JSON.stringify(model.systemInstruction));

    ws.on('message', async (data) => {
        const message = JSON.parse(data);
        switch(message.type) {
            case 'setup':
                console.log('SETUP', message)
                ws.params = message;
                const personName = message.customParameters && message.customParameters.name ? message.customParameters.name : null;

                if (personName) {
                    // Me conte quando nasceu que vou te ajudar a descobrir seu futuro.
                    const resultSetup = await chat.sendMessage(`Me chamo ${personName}.`);
                    ws.send(JSON.stringify({ 
                        type: 'text',
                        token: resultSetup.response.text(),
                        last: true
                    }));
                    console.log('> ', resultSetup.response.text());

                } else {

                    ws.send(JSON.stringify({ 
                        type: 'text',
                        token: `Olá, me chamo ZorAIde, a cartomante feita por IA para o TDC Summit São Paulo! Eu ainda não sei o seu nome. Como você se chama?`,
                        last: true
                    }));

                }

                break;

            case 'interrupt':
                console.log('Interruption:', message);
                

                break;

            case 'prompt':
                console.log('Prompt:', message.voicePrompt);
                const result = await chat.sendMessage(message.voicePrompt);

                console.log('RESULT', result);
                console.log('\n\n\n\n\n\n\n\n');

                const calls = await result.response.functionCalls();                
                if (calls && calls.length > 0) {

                    console.log('CALLs', calls);
                    const call = calls[0];

                    // Chamar a função identificada pelo Gemini
                    const apiResponse = await functions[call.name](call.args);
                    console.log('API RESPONSE', apiResponse);
                    
                    // Reencaminhar a resposta da função para o Gemini
                    const result2 = await chat.sendMessage([{functionResponse: {
                        name: call.name,
                        response: apiResponse
                    }}]);
                    
                    // Responder ao usuário
                    ws.send(JSON.stringify({ 
                        type: 'text',
                        token: result2.response.text(),
                        last: true
                    }));
                    console.log('> ', result2.response.text());
    
                } else {
                    ws.send(JSON.stringify({ 
                        type: 'text',
                        token: result.response.text(),
                        last: true
                    }));
                    console.log('> ', result.response.text());
                }
                break;

            case 'dtmf':
                console.log('DTMF:', message);
                break;

            default:
                console.log('Evento Desconhecido:', message);
        }
        console.log();

    });

    ws.on('close', () => {
        console.log('WebSocket fechado');
        console.log(ws.params);
        console.log();
    });
});


/* COMANDOS DISPONÍVEIS

    // ws.send(JSON.stringify({ 
    //     type: 'text',
    //     token: 'Isso é um teste',
    //     last: true
    // }));

    // ws.send(JSON.stringify({
    //     "type": "play",
    //     "source": "https://api.twilio.com/cowbell.mp3",
    //     "loop": 1,
    //     "preemptible": true
    // }));

    // ws.send(JSON.stringify({ 
    //     type: 'text',
    //     token: 'Isso é um teste',
    //     last: true
    // }));

    // ws.send(JSON.stringify({
    //     "type": "end",
    //     // "handoffData": "{\"reasonCode\":\"live-agent-handoff\", \"reason\": \"The caller wants to talk to a real person\"}"
    // }));
    // handoffData optional

*/


app.post('/connect', (req, res) => {
    console.log();
    console.log();
    console.log('Finalizou a chamada do ConversationRelay'), req.body;
    console.log();
    console.log();
    res.status(200).end();
});



// POST request handler
app.post('/', (req, res) => {
    // Função utilizada para receber uma chamada
    // Ela responde com um objeto do ConversationRelay incluindo os parâmetros necessários para a chamada
    
    const twiml = new twilio.twiml.VoiceResponse();
    const connect = twiml.connect({
        action: `${SERVER}/connect`,
    });
    const conversationrelay = connect.conversationRelay({
        url: `wss://${SERVER.split('https://')[1]}`,
        welcomeGreeting: WELCOME_GREETING, //.split('{nome}').join('desconhecido'), 
        welcomeGreetingLanguage: WELCOME_GREET_LANGUAGE,
        transcriptionLanguage: TRANSCRIPTION_LANGUAGE,
        voice: VOICE,
        interruptible: INTERRUPTIBLE,
        dtmfDetection: DTMF_DETECTION,

    });
    // conversationrelay.parameter({
    //     name: 'NOME_DO_PARAMETRO',
    //     value: 'VALOR_DO_PARAMETRO'
    // });
    
    res.type('text/xml');
    res.send(twiml.toString());

});

app.get('/liga', (req, res) => {

    const userData = {
        name: 'Fulano',
        birthDate: '01/01/2000',
    };

    makeCall(
        TWILIO_NUMBER_TO_CALL,
        userData,
        SERVER
    );

    res.send('Ligando...');
});

server.listen(PORT, async () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


const finish = async () => {
    console.log('Server closing...');
    await server.close();
    process.exit();
}
// detect server close
process.on('SIGINT', finish);

// detect server close
process.on('SIGTERM', finish);




/*
    // Teste para fazer uma nova chamada

    makeCall(
        TWILIO_NUMBER_TO_CALL, 
        userDataJson.memberNome,
        userData,
        SERVER
    );
*/