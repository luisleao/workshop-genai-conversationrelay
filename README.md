# Workshop IA Generativa e Twilio Conversation Relay

## Utilize o DevPhone no IDX
https://www.twilio.com/docs/labs/dev-phone


## Configuração da sua conta Twilio
* [Crie uma conta Twilio](https://twil.io/summitsp25) caso ainda não tenha. Você também pode acessar o link https://twil.io/summitsp25
* Acesse o produto de voz (Voice) > Configurações > Geral
* Ative a opção `Predictive and Generative AI/ML Features Addendum` e salve

## [LINK APRESENTAÇÃO](https://docs.google.com/presentation/d/12YyHh4431qEYbz8JIIhYn92800cj2bd9-YWKOJHMwlQ/edit#slide=id.g343a50f534e_0_20)




## Inicializando seu projeto

Para rodar no computador do TDC:
```
$ Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Comandos para iniciar um projeto novo
```bash
mkdir src
cd src
npm init -y
npm i --save @google/generative-ai dotenv express ws twilio

touch server.js
touch .env

```

Você também pode optar por clonar o repositório base:
````
git clone http://github.com/luisleao/workshop-genai-conversationrelay
```

Caso utilize o Ngrok, faça a instalação com o comando
````
npm i -g ngrok
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