const i18n = require('i18n');
const path = require('path');

i18n.configure({
  locales: ['en', 'de', 'fr', 'es', 'pt'],
  defaultLocale: 'en',
  directory: path.join('./', 'assets/', 'i18n'),
  api: {
    '__': 't',
    '__n': 'tn'
  },
  objectNotation: true
});

function getCurrentLocale() {
  return i18n.getLocale();
}
function getLocales() {
  return i18n.getLocales();
}
function setLocale(locale) {
  if (getLocales().indexOf(locale) !== -1) {
    i18n.setLocale(locale);
  }
}
function t(string, args = undefined) {
  return i18n.__(string, args);
}
function tn(phrase, count) {
  return i18n.__n(phrase, count);
}
function tmf(phrase, args) {
  return i18n.__mf(phrase, args);
}

module.exports={
  getCurrentLocale: getCurrentLocale,
  getLocales : getLocales,
  setLocale : setLocale,
  t : t,
  tn : tn,
  tmf: tmf
};