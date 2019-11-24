const i18n = require('../i18n');
const req = require('../request');
const util = require('../util');

const handle = handlerInput => {
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
    if (!isYesIntent) {
      return req.httpGet(`https://api.smite.guru/v3/champions/${normalizedGod}/builds`).then(res => {
        const itemId = (i) => {
          if (!!res['builds'][queueId][`slot-${i}`]['primary']) {
            return util.getItemById(res['builds'][queueId][`slot-${i}`]['primary']['item'], lang);
          } else {
            return {DeviceName: 'null'};
          }
        }
        if (!isYesIntent) {
          const item1 = itemId(1);
          const item2 = itemId(2);
          const item3 = itemId(3);
          attributes.item4 = itemId(4);
          attributes.item5 = itemId(5);
          attributes.item6 = itemId(6);
          handlerInput.attributesManager.setSessionAttributes(attributes);
          speakOutput = i18n.tmf('BUILD.RESULT.3_FIRST_ITEMS', {god: god, queue: queue, item1: item1.DeviceName, item2: item2.DeviceName, item3: item3.DeviceName, });
        }
  
        const repromptSpeech = i18n.t('BUILD.RESULT.CONTINUE');
  
        return handlerInput.responseBuilder
          .speak(speakOutput)
          .withShouldEndSession(true)
          .reprompt(repromptSpeech)
          .getResponse();
      }).catch(e => {
          speakOutput = i18n.tmf('ERROR.UNKNOWN', {error: JSON.stringify(e)});
          console.log('ERROR', JSON.stringify(e));
          return handlerInput.responseBuilder
            .speak(speakOutput)
            .withShouldEndSession(false)
            .getResponse();
      });
    } else {
      const item4 = attributes.item4;
      const item5 = attributes.item5;
      const item6 = attributes.item6 ;
      speakOutput = i18n.tmf('BUILD.RESULT.3_LAST_ITEMS', {item4: item4.DeviceName, item5: item5.DeviceName, item6: item6.DeviceName, });
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .withShouldEndSession(false)
        .getResponse();
    }
    
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

module.exports={
  handle : handle
};
