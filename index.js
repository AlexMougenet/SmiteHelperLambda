const Alexa = require('ask-sdk-core');
const { DynamoDbPersistenceAdapter } = require('ask-sdk-dynamodb-persistence-adapter');

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
    handle(handlerInput) {
        const LaunchRequestIntent = require('./handlers/launchRequestIntent');
        return LaunchRequestIntent.handle(handlerInput);
    }
};
const BuildIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'BuildIntent'
            ||  handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent');
    },
    handle(handlerInput) {
        const buildIntent = require('./handlers/buildIntent');
        return buildIntent.handle(handlerInput, null);
    }
};
const ActiveIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'ActiveIntent');
    },
    handle(handlerInput) {
        const activeIntent = require('./handlers/activeIntent');
        return activeIntent.handle(handlerInput);
    }
};
const ItemNumberIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'ItemNumberIntent');
    },
    handle(handlerInput) {
        const itemNumberIntent = require('./handlers/itemNumberIntent');
        return itemNumberIntent.handle(handlerInput);
    }
};
const SmiteGuruIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'SmiteGuruIntent';
    },
    handle(handlerInput) {
        const smiteGuruIntent = require('./handlers/smiteGuruIntent');
        return smiteGuruIntent.handle(handlerInput);
    }
};
const UpdateIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'UpdateIntent';
    },
    handle(handlerInput) {
        const updateIntent = require('./handlers/updateIntent');
        return updateIntent.handle(handlerInput);
    }
};
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const helpIntent = require('./handlers/helpIntent');
        return helpIntent.handle(handlerInput);
    }
};
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'FallbackIntent';
    },
    handle(handlerInput) {
        const fallbackIntent = require('./handlers/fallbackIntent');
        return fallbackIntent.handle(handlerInput);
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
        const cancelAndStopIntent = require('./handlers/cancelAndStopIntent');
        return cancelAndStopIntent.handle(handlerInput);
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder.getResponse();
    }
};

const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = handlerInput.requestEnvelope.request.intent.name;
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const fallbackIntent = require('./handlers/fallbackIntent');
        console.log('ERROR', JSON.stringify(error.stack));
        return fallbackIntent.handle(handlerInput);
        // console.log(`~~~~ Error handled: ${error.stack}`);
        // const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

        // return handlerInput.responseBuilder
        //     .speak(speakOutput)
        //     .reprompt(speakOutput)
        //     .getResponse();
    }
};

exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        BuildIntentHandler,
        ActiveIntentHandler,
        ItemNumberIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        SmiteGuruIntentHandler,
        UpdateIntentHandler,
        FallbackIntentHandler,
        IntentReflectorHandler,
    )
    .addErrorHandlers(
        ErrorHandler,
    )
    .withPersistenceAdapter(persistenceAdapter)
    .lambda();
