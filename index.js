// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');
const { DynamoDbPersistenceAdapter } = require('ask-sdk-dynamodb-persistence-adapter');
const req = require('./request');
const util = require('./util');
const i18n = require('./i18n');

const { version } = require('./package.json');

const persistenceAdapter = new DynamoDbPersistenceAdapter({ 
    tableName: 'versions',
    createTable: true,
    partitionKeyGenerator: keyGenerator
});
function keyGenerator(requestEnvelope) {
    if (requestEnvelope
        && requestEnvelope.context
        && requestEnvelope.context.System
        && requestEnvelope.context.System.application
        && requestEnvelope.context.System.application.applicationId) {
      return requestEnvelope.context.System.application.applicationId; 
    }
    throw 'Cannot retrieve app id from request envelope!';
  }
  

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    async handle(handlerInput) {
        const lang = handlerInput.requestEnvelope.request.locale.split('-')[0].toLowerCase();
        if (i18n.getLocales().includes(lang)) {
            i18n.setLocale(lang);
        }
        
        const attributesManager = handlerInput.attributesManager;
        const attributes = await attributesManager.getPersistentAttributes();
        
        let speakOutput;
        const helpOutput = i18n.t('HELP');

        if (!attributes.version || (attributes.version && attributes.version === version)) {
            // first time in the app
            speakOutput = i18n.t('WELCOME');
        } else if (attributes.version !== version) {
            speakOutput = i18n.t('WELCOME_NEW_VERSION');
        }

        if (!attributes.version || (attributes.version !== version)) {
            attributes.version = version;
            attributesManager.setPersistentAttributes(attributes);
            attributesManager.savePersistentAttributes();
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(helpOutput)
            .getResponse();
    }
};
const BuildIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'BuildIntent'
            ||  handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent');
    },
    handle(handlerInput) {
        const isYesIntent = handlerInput.requestEnvelope.request.intent.name === "AMAZON.YesIntent";
        const attributes = handlerInput.attributesManager.getSessionAttributes();
        const lang = handlerInput.requestEnvelope.request.locale.split('-')[0].toLowerCase();
        i18n.setLocale(lang);
        let god;
        let queue;
        if (isYesIntent) {
            god = attributes.god;
            queue = attributes.queue;
        } else {
            god = handlerInput.requestEnvelope.request.intent.slots.god.value;
            queue = handlerInput.requestEnvelope.request.intent.slots.queue.value;
            attributes.god = god;
            attributes.queue = queue;
            handlerInput.attributesManager.setSessionAttributes(attributes);
        }

        const normalizedGod = util.normalizeGodName(god, lang);
        const queueId = util.getQueueIdByQueue(queue, lang);
        
        let speakOutput;

        if (queueId && normalizedGod) {
            return req.httpGet(`https://api.smite.guru/v3/champions/${normalizedGod}/builds`).then(res => {
                const itemId = (i) => {
                    return util.getItemById(res['builds'][queueId][`slot-${i}`]['primary']['item'], lang);
                }
                if (!isYesIntent) {
                    const item1 = itemId(1);
                    const item2 = itemId(2);
                    const item3 = itemId(3);
                    speakOutput = i18n.tmf('BUILD.RESULT.3_FIRST_ITEMS', {god: god, queue: queue, item1: item1.DeviceName, item2: item2.DeviceName, item3: item3.DeviceName, });
                } else {
                    const item4 = itemId(4);
                    const item5 = itemId(5);
                    const item6 = itemId(6);
                    speakOutput = i18n.tmf('BUILD.RESULT.3_LAST_ITEMS', {item4: item4.DeviceName, item5: item5.DeviceName, item6: item6.DeviceName, });
                }

                const repromptSpeech = isYesIntent ? '' : i18n.t('BUILD.RESULT.CONTINUE');
    
                return handlerInput.responseBuilder
                .speak(speakOutput)
                .withShouldEndSession(isYesIntent ? true : false)
                .reprompt(repromptSpeech)
                .getResponse();
            }).catch(e => {
                speakOutput = i18n.tmf('ERROR.UNKNOWN', {error: JSON.stringify(e)});
                return handlerInput.responseBuilder
                .speak(speakOutput)
                .getResponse();
            });
        } else if (!normalizedGod && ! queueId) {
                speakOutput = i18n.tmf('ERROR.NO_GOD_NO_QUEUE', {god: god, queue: queue});
        } else if (!normalizedGod) {
                speakOutput = i18n.tmf('ERROR.NO_GOD', {god: god});
        } else if (!queueId) {
                speakOutput = i18n.tmf('ERROR.NO_QUEUE', {queue: queue});
        }
        return handlerInput.responseBuilder
        .speak(speakOutput)
        .withShouldEndSession(false)
        .getResponse();
    }
};
const SmiteGuruIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'SmiteGuruIntent';
    },
    handle(handlerInput) {
        const speakOutput = i18n.t('SMITEGURU');

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .withShouldEndSession(false)
            .getResponse();
    }
};
const UpdateIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'UpdateIntent';
    },
    handle(handlerInput) {
        const speakOutput = i18n.t('NEWS');

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .withShouldEndSession(false)
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
            .withShouldEndSession(false)
            .getResponse();
    }
};
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = i18n.t('UNHANDLED');

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .withShouldEndSession(false)
            .getResponse();
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
                || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent'
                || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.NoIntent');
    },
    handle(handlerInput) {
        const speakOutput = i18n.t('BYE');
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .withShouldEndSession(true)
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
        SmiteGuruIntentHandler,
        UpdateIntentHandler,
        FallbackIntentHandler,
        IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    .addErrorHandlers(
        ErrorHandler,
    )
    .withPersistenceAdapter(persistenceAdapter)
    .lambda();
