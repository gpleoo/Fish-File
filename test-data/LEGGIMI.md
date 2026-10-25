# Dati di test - Pianifica uscita

**Attenzione: importare uno di questi file sostituisce i dati presenti nell'app.**
Prima esporta un backup dei tuoi dati (Impostazioni > Backup & cloud > Esporta),
oppure usa un altro browser o dispositivo.

## File

- `fishfile-test-pianifica-50.json`: 50 sessioni, 80 catture, 17 uscite a vuoto.
  Con questo volume alcuni spot risultano "dati insufficienti": è il comportamento atteso.
- `fishfile-test-pianifica-200.json`: 200 sessioni, per vedere anche l'affidabilità "alta".

Rigenerabili con `node scripts/generaDatiTestPianifica.mjs <numeroSessioni> [seme]`.

## Cosa contengono

- 8 spot, ognuno è un tratto di costa: ogni sessione cade in un punto diverso del tratto
  (distanze tra le sessioni da poche decine di metri a 3-4 km, fino a 9 km a Sabaudia).
- 2 zone già create: "Anzio - Nettuno" e "Latina - Circeo - Terracina".
- Sessioni tra gennaio e ottobre 2026 all'alba, di giorno, al tramonto e di notte
  (alcune oltre la mezzanotte), con catture, pesi, esche, attrezzatura e meteo.
- Alcune uscite a vuoto sono senza meteo: con internet attivo la funzione lo recupera dall'archivio.

## Preferenze degli spot (per verificare i risultati)

| Spot | Zona | Rende con |
|---|---|---|
| Anzio - Riviera di Ponente | Anzio - Nettuno | Maestrale, mare calmo |
| Nettuno - Litorale di Levante | Anzio - Nettuno | Scirocco, Libeccio |
| Latina - Foce Verde | Latina - Circeo - Terracina | Libeccio, Scirocco |
| Latina - Rio Martino | Latina - Circeo - Terracina | Scirocco, calma (poco in generale) |
| Sabaudia - Lungomare | Latina - Circeo - Terracina | Scirocco, Libeccio |
| San Felice Circeo - Torre Paola | Latina - Circeo - Terracina | Calma, Tramontana |
| Terracina - Ponente e Molo | Latina - Circeo - Terracina | Scirocco |
| Terracina - Spiaggia di Levante | Latina - Circeo - Terracina | Libeccio, Scirocco |

Le catture sono estratte a caso in base a queste preferenze: con poche uscite per tipo di
tempo il risultato riflette i dati generati, non sempre la preferenza teorica.

## Prove suggerite

1. Zona "Latina - Circeo - Terracina", correggi a mano: vento 3 kn, onde 10 cm, pressione 1020,
   cielo sereno. In testa deve uscire **Torre Paola** (con entrambi i file).
2. Stessa zona: vento 17 kn da SE (Scirocco), onde 100 cm, pressione 1005, cielo coperto.
   In testa devono uscire spot da mare mosso (**Sabaudia, Foce Verde, Terracina**);
   Torre Paola e Rio Martino devono scendere o finire tra i "solo indicativo".
3. Zona "Anzio - Nettuno" con il file da 200 sessioni: con lo Scirocco dell'esempio 2
   deve prevalere nettamente **Nettuno**; con mare calmo (esempio 1) **Anzio**.
4. Apri il dettaglio di uno spot e correggi il vento solo lì: cambia solo quello spot.
5. Apri la mappa delle catture: le sessioni di ogni località devono comparire sparse lungo la costa.
6. Disattiva la funzione in Impostazioni: la sezione deve sparire e il resto dell'app restare uguale.
