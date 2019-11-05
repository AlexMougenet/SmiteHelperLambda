// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');
const req = require('./request');
const util = require('./util');

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        let lang = handlerInput.requestEnvelope.request.locale.split('-')[0].toLowerCase();
        process.env.LANG = lang;
        const speakOutput = 'Bonjour. Je suis là pour vous conseiller sur des items à acheter en fonction des modes de jeu disponibles. De quoi avez-vous besoin ?';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
const BuildIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'BuildIntent';
    },
    handle(handlerInput) {
        const god = handlerInput.requestEnvelope.request.intent.slots.god.value;
        const queue = handlerInput.requestEnvelope.request.intent.slots.queue.value;

        const englishGod =  util.normalizeGodName(god, process.env.LANG);
        const queueId = util.getQueueIdByQueue(queue, process.env.LANG);
        
        let speakOutput;

        if (queueId && englishGod) {
            return req.httpGet(`https://api.smite.guru/v3/champions/${god}/builds`).then(res => {
                const item1 = util.getItemById(res['builds'][queueId]['slot-1']['primary']['item'], process.env.LANG);
                const item2 = util.getItemById(res['builds'][queueId]['slot-2']['primary']['item'], process.env.LANG);
                const item3 = util.getItemById(res['builds'][queueId]['slot-3']['primary']['item'], process.env.LANG);
    
                speakOutput = `Vous avez demandé un build pour ${god} en ${queue}. Le premier item est ${item1.DeviceName}. Le deuxième item est ${item2.DeviceName}. Le troisième item est ${item3.DeviceName}.`;
                return handlerInput.responseBuilder
                .speak(speakOutput)
                .getResponse();
            }).catch(e => {
                speakOutput = `Il semblerait qu'il y ait une erreur quelque part. ${e}`;
                return handlerInput.responseBuilder
                .speak(speakOutput)
                .getResponse();
            });
        } else if (!englishGod && ! queueId) {
            speakOutput = `Il n'existe ni dieu ${god} ni mode de jeu "${queue}".`;
        } else if (!englishGod) {
            speakOutput = `Il n'existe pas de dieu "${god}".`;
        } else if (!queueId) {
            speakOutput = `Il n'existe pas de mode de jeu "${queue}".`;
        }
        return handlerInput.responseBuilder
        .speak(speakOutput)
        .getResponse();
    }
};
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Vous pouvez me demander par exemple "Quel est le build pour Thanatos en Joute". De quoi avez-vous besoin ?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
                || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Good luck, have fun.';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = handlerInput.requestEnvelope.request.intent.name;
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        BuildIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    .addErrorHandlers(
        ErrorHandler,
    )
    .lambda();
