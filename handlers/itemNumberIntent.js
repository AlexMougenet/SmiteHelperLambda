const handle = handlerInput => {
  const buildIntent = require('./buildIntent');
  const index = handlerInput.requestEnvelope.request.intent.slots.index.value;
  return buildIntent.handle(handlerInput, index);
}

module.exports={
  handle : handle
};
