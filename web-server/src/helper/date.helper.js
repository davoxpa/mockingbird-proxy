function getDateTime() {
  // Creare un nuovo oggetto Date
  let dataOra = new Date();

  // Ottenere l'anno
  let anno = dataOra.getFullYear();

  // Ottenere il mese
  // Attenzione: i mesi in JavaScript iniziano da 0, quindi gennaio è 0, febbraio è 1, ecc.
  let mese = dataOra.getMonth() + 1;

  // Ottenere il giorno
  let giorno = dataOra.getDate();

  // Ottenere l'ora
  let ora = dataOra.getHours();

  // Ottenere i minuti
  let minuti = dataOra.getMinutes();

  return `${anno}-${mese}-${giorno}-${ora}-${minuti}`;
}

module.exports = { getDateTime };