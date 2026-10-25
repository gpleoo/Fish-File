# Dati di test - Pianifica uscita

**Attenzione: importare uno di questi file sostituisce i dati presenti nell'app.**
Prima esporta un backup dei tuoi dati (Impostazioni > Backup & cloud > Esporta),
oppure usa un altro browser o dispositivo.

## File

- `fishfile-test-pianifica-50.json`: 50 sessioni, 86 catture, 20 uscite a vuoto.
  Con questo volume molti spot risultano "dati insufficienti": è il comportamento atteso.
- `fishfile-test-pianifica-200.json`: 200 sessioni, per vedere anche l'affidabilità "alta".

Rigenerabili con `node scripts/generaDatiTestPianifica.mjs <numeroSessioni> [seme]`.

## Cosa contengono

- 7 spot: Anzio (Molo Innocenziano), Nettuno (Tre Cancelli), Latina (Foce Verde, Rio Martino),
  San Felice Circeo (Torre Paola), Terracina (Molo, Spiaggia di Levante).
- 2 zone già create: "Anzio - Nettuno" e "Latina - Circeo - Terracina".
- Sessioni tra gennaio e ottobre 2026 all'alba, di giorno, al tramonto e di notte
  (alcune oltre la mezzanotte), con catture, pesi, esche, attrezzatura e meteo.
- Alcune uscite a vuoto sono senza meteo: con internet attivo la funzione lo recupera dall'archivio.

## Preferenze degli spot (per verificare i risultati)

| Spot | Rende con |
|---|---|
| Anzio - Molo Innocenziano | Maestrale, mare calmo |
| Nettuno - Tre Cancelli | Scirocco, Libeccio |
| Latina - Foce Verde | Libeccio, Scirocco |
| Latina - Rio Martino | Scirocco, calma (poco in generale) |
| San Felice Circeo - Torre Paola | Calma, Tramontana |
| Terracina - Molo | Scirocco |
| Terracina - Spiaggia di Levante | Libeccio, Scirocco |

## Prove suggerite

1. Zona "Latina - Circeo - Terracina", correggi a mano: vento 3 kn, onde 10 cm, pressione 1020,
   cielo sereno. In testa deve uscire **Torre Paola**.
2. Stessa zona: vento 17 kn da SE (Scirocco), onde 100 cm, pressione 1005, cielo coperto.
   In testa devono uscire gli spot di **Terracina**.
3. Zona "Anzio - Nettuno" con il file da 200 sessioni: vento 15 kn da NW (Maestrale), onde 60 cm,
   pressione 1017. Deve prevalere **Anzio**; con Scirocco deve prevalere **Nettuno**.
   Con il file da 50 Nettuno ha pochi dati simili: compare nel gruppo "solo indicativo" in fondo.
4. Apri il dettaglio di uno spot e correggi il vento solo lì: cambia solo quello spot.
5. Disattiva la funzione in Impostazioni: la sezione deve sparire e il resto dell'app restare uguale.
