const fs = require('fs');

// function getLangIdByLang(lang) {
//   return JSON.parse(fs.readFileSync('./assets/languages/langs.json', 'utf8'))[lang];
// }

function savePersistentAttributes(manager, attributes) {
  manager.setPersistentAttributes(attributes);
  manager.savePersistentAttributes();
}

function getItemById(itemId, lang) {
  return JSON.parse(fs.readFileSync(`./assets/items/${lang}.json`)).find(x => x.ItemId == itemId);
}

function getQueueIdByQueue(queue, lang) {
  return JSON.parse(fs.readFileSync(`./assets/queues/${lang}.json`))[queue];
}

function normalizeGodName(godName, lang) {
  const god = getGodByName(godName, lang);
  if (god) {
    return JSON.parse(fs.readFileSync(`./assets/gods/en.json`)).find(x => x.id == god.id).Name;
  }
  return undefined;
}

function getGodByName(godName, lang) {
  return JSON.parse(fs.readFileSync(`./assets/gods/${lang}.json`)).find(x => x.Name.toLowerCase() == godName.toLowerCase());
}

module.exports = {
  savePersistentAttributes: savePersistentAttributes,
  getItemById : getItemById,
  getQueueIdByQueue: getQueueIdByQueue,
  normalizeGodName: normalizeGodName,
  getGodByName: getGodByName
};

























