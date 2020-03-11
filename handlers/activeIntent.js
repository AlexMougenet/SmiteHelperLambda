const i18n = require('../i18n');
const fs = require('fs');
const util = require('../util');

const handle = async (handlerInput) => {
  const lang = handlerInput.requestEnvelope.request.locale.split('-')[0].toLowerCase();
  i18n.setLocale(lang);

  let god = handlerInput.requestEnvelope.request.intent.slots.god.value;
  let queue = handlerInput.requestEnvelope.request.intent.slots.queue.value;
  const normalizedGod = util.normalizeGodName(god, lang);
  const queueId = util.getQueueIdByQueue(queue, lang);
  
  let speakOutput;
  let repromptSpeech;

  if (queueId && normalizedGod) {
    let res = JSON.parse(fs.readFileSync(`./assets/builds/${normalizedGod}.json`));
    const itemId = (i) => {
      if (!!res['builds'][queueId][`slot-${i}`]['primary']) {
        return util.getItemById(res['builds'][queueId]['active']['items'][`${i}`]['item'], lang);
      } else {
        return {DeviceName: 'null'};
      }
    }
    const item1 = itemId(1);
    const item2 = itemId(2);
    const item3 = itemId(3);

    speakOutput = i18n.tmf('BUILD.RESULT.ACTIVE', {god: god, queue: queue, item1: item1.DeviceName, item2: item2.DeviceName, item3: item3.DeviceName, });
    repromptSpeech = i18n.t('DO_YOU_NEED_MORE');
  
  } else {
    if (!normalizedGod && ! queueId) {
      speakOutput = i18n.tmf('ERROR.NO_GOD_NO_QUEUE', {god: god, queue: queue});
    } else if (!normalizedGod) {
      speakOutput = i18n.tmf('ERROR.NO_GOD', {god: god});
    } else if (!queueId) {
      speakOutput = i18n.tmf('ERROR.NO_QUEUE', {queue: queue});
    }
    repromptSpeech = i18n.t('HELP');
  } 
  return handlerInput.responseBuilder
    .speak(speakOutput)
    .withShouldEndSession(false)
    .reprompt(repromptSpeech)
    .getResponse();
}

module.exports={
  handle : handle
};
