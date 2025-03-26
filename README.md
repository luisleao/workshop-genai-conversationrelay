# Workshop IA Generativa e Twilio Conversation Relay


## Configuração da sua conta Twilio
* [Crie uma conta Twilio](https://www.twilio.com/try-twilio?utm_campaign=Developer&utm_medium=conference&utm_source=twilio&utm_content=EVENT_Third_Party_2025_MAR_26_TDC_Summit_IA_SaoPaulo_2025_LATAM&promo=TDCSUMMIT25) caso ainda não tenha. Você também pode acessar o link https://twil.io/summitsp25
* Acesse o produto de voz (Voice) > Configurações > Geral
* Ative a opção `Predictive and Generative AI/ML Features Addendum` e salve







## Inicializando seu projeto

```bash
mkdir src
cd src
npm init -y
npm i --save @google/generative-ai dotenv express ws twilio
npm i -g ngrok

touch server.js
touch .env

```





## Gere sua chave de API do AI Studio
Acesse https://aistudio.google.com/app/apikey

## Login do Ngrok
Caso tenha algum servidor com acesso público na web e que tenha opção de inicializar um serviço de websocket, você pode utilizá-lo.

Ou pode optar por executar localmente. Para isso, crie uma conta no Ngrok.com! Vamos utilizá-lo para fazer um túnel https e de websocket para sua aplicação local.



## Links Importantes

* [Onboarding do ConversationRelay](https://www.twilio.com/docs/voice/twiml/connect/conversationrelay/onboarding)


# Etapas de Implementação
* Configurar o Express com WebSocket
* Reponder ao webhook de chamada telefônica
* Tratar comandos pelo websocket
* Inicializar o LLM
* Estruturar chamadas de função da LLM
* Retornar a resposta do LLM
* Finalizar a ligação