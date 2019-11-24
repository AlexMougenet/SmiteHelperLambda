const i18n = require('../i18n');

const handle = handlerInput => {
  const speakOutput = i18n.t('BYE');
  
  return handlerInput.responseBuilder
    .speak(speakOutput)
    .withShouldEndSession(true)
    .getResponse();
}

module.exports={
  handle : handle
};
