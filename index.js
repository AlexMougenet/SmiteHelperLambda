// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');
const req = require('./request');
const util = require('./util');
const i18n = require('./i18n');

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        let lang = handlerInput.requestEnvelope.request.locale.split('-')[0].toLowerCase();
        i18n.setLocale(lang);
        const speakOutput = i18n.t('WELCOME');
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
        const lang = i18n.getCurrentLocale();

        const englishGod =  util.normalizeGodName(god, lang);
        const queueId = util.getQueueIdByQueue(queue, lang);
        
        let speakOutput;

        if (queueId && englishGod) {
            return req.httpGet(`https://api.smite.guru/v3/champions/${god}/builds`).then(res => {
                const item1 = util.getItemById(res['builds'][queueId]['slot-1']['primary']['item'], lang);
                const item2 = util.getItemById(res['builds'][queueId]['slot-2']['primary']['item'], lang);
                const item3 = util.getItemById(res['builds'][queueId]['slot-3']['primary']['item'], lang);
    
                speakOutput = i18n.tmf('BUID.RESULT.3_ITEMS', {god: god, queue: queue, item1: item1.DeviceName, item2: item2.DeviceName, item3: item3.DeviceName, });
                return handlerInput.responseBuilder
                .speak(speakOutput)
                .getResponse();
            }).catch(e => {
                speakOutput = i18n.t('ERROR.UNKNOWN');
                return handlerInput.responseBuilder
                .speak(speakOutput)
                .getResponse();
            });
        } else if (!englishGod && ! queueId) {
                speakOutput = i18n.t('ERROR.NO_GOD_NO_QUEUE', {god: god, queue: queue});
        } else if (!englishGod) {
                speakOutput = i18n.t('ERROR.NO_GOD', {god: god});
        } else if (!queueId) {
                speakOutput = i18n.t('ERROR.NO_QUEUE', {queue: queue});
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
        const speakOutput = i18n.t('HELP');

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
        const speakOutput = i18n.t('BYE');
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
