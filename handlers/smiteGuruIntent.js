const i18n = require('../i18n');

const handle = handlerInput => {
  const speakOutput = i18n.t('SMITEGURU');

  return handlerInput.responseBuilder
    .speak(speakOutput)
    .withShouldEndSession(false)
    .getResponse();
}

module.exports={
  handle : handle
};
