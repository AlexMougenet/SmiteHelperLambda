const fs = require('fs');

// function getLangIdByLang(lang) {
//   return JSON.parse(fs.readFileSync('./assets/languages/langs.json', 'utf8'))[lang];
// }

function getItemById(itemId, lang) {
  return JSON.parse(fs.readFileSync(`./assets/items/${lang}.json`)).find(x => x.ItemId == itemId);
}

function getQueueIdByQueue(queue, lang) {
  return JSON.parse(fs.readFileSync(`./assets/queues/${lang}.json`))[queue];
}

function normalizeGodName(godName, lang) {
  const god = getGodId(godName, lang);
  if (god) {
    return JSON.parse(fs.readFileSync(`./assets/gods/en.json`)).find(x => x.Id == god.Id);
  }
  return undefined;
}

function getGodId(godName, lang) {
  return JSON.parse(fs.readFileSync(`./assets/gods/${lang}.json`)).find(x => x.Name.toLowerCase() == godName);
}

module.exports = {
  getItemById : getItemById,
  getQueueIdByQueue: getQueueIdByQueue,
  normalizeGodName: normalizeGodName,
  getGodId: getGodId
};

























