const i18n = require('../i18n');
const fs = require('fs');
const util = require('../util');

const handle = async (handlerInput, itemNumber) => {
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
  let repromptSpeech;

  if (queueId && normalizedGod) {
    if (itemNumber || !isYesIntent) {
      let res = JSON.parse(fs.readFileSync(`./assets/builds/${normalizedGod}.json`));
      const itemId = (i) => {
        if (!!res['builds'][queueId][`slot-${i}`]['primary']) {
          return util.getItemById(res['builds'][queueId][`slot-${i}`]['primary']['item'], lang);
        } else {
          return {DeviceName: 'null'};
        }
      }

      if (itemNumber) {
        const item = itemId(itemNumber);
        speakOutput = i18n.tmf('BUILD.RESULT.ITEM_NUMBER', {god: god, queue: queue, index: itemNumber, item: item.DeviceName});
      }
      else if (!isYesIntent) {
        const item1 = itemId(1);
        const item2 = itemId(2);
        const item3 = itemId(3);
        attributes.item4 = itemId(4);
        attributes.item5 = itemId(5);
        attributes.item6 = itemId(6);
        handlerInput.attributesManager.setSessionAttributes(attributes);

        speakOutput = i18n.tmf('BUILD.RESULT.3_FIRST_ITEMS', {god: god, queue: queue, item1: item1.DeviceName, item2: item2.DeviceName, item3: item3.DeviceName, });
        repromptSpeech = i18n.t('BUILD.RESULT.CONTINUE');
        
      }
    } else if (isYesIntent) {
      const item4 = attributes.item4 || {DeviceName: null};
      const item5 = attributes.item5 || {DeviceName: null};
      const item6 = attributes.item6 || {DeviceName: null};
      speakOutput = i18n.tmf('BUILD.RESULT.3_LAST_ITEMS', {item4: item4.DeviceName, item5: item5.DeviceName, item6: item6.DeviceName, });
      repromptSpeech = i18n.t('DO_YOU_NEED_MORE');
    }
    
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
    .withShouldEndSession(itemNumber ? true : false)
    .reprompt(repromptSpeech)
    .getResponse();
}

module.exports={
  handle : handle
};
