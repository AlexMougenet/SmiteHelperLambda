const i18n = require('../i18n');
const util = require('../util');

const { version } = require('../package.json');

const handle = async handlerInput => {
  const attributesManager = handlerInput.attributesManager;
  const attributes = await attributesManager.getPersistentAttributes();

  const lang = handlerInput.requestEnvelope.request.locale.split('-')[0].toLowerCase();
  if (i18n.getLocales().includes(lang)) {
    i18n.setLocale(lang);
  }
  
  let speakOutput;
  const helpOutput = i18n.t('HELP');

  if (!attributes.version || (attributes.version && attributes.version === version)) {
    if (attributes.notFirstTime) {
      speakOutput = i18n.t('HI');
    } else {
      speakOutput = i18n.t('WELCOME');
      attributes.notFirstTime = true;
      util.savePersistentAttributes(attributesManager, attributes);
    }
  } else if (attributes.version !== version) {
    speakOutput = i18n.t('WELCOME_NEW_VERSION');
  }

  if (!attributes.version || (attributes.version !== version)) {
    attributes.version = version;
    util.savePersistentAttributes(attributesManager, attributes);
  }

  return handlerInput.responseBuilder
    .speak(speakOutput)
    .reprompt(helpOutput)
    .getResponse();
}

module.exports={
  handle : handle
};
