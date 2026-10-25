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

## Condivisione dati tra utenti

- `fishfile-condivisione-marco.json` (30 sessioni) e `fishfile-condivisione-luca.json` (20 sessioni):
  file come quelli che manderebbero due amici. Si importano da
  Impostazioni > Condivisione dati > **Importa dati condivisi** e **non** sostituiscono i tuoi dati.
- Gli spot hanno nomi diversi dai tuoi (es. "Foce Verde" invece di "Latina - Foce Verde"):
  in pianificazione prendono il nome del tuo spot più vicino entro 3 km.
- Marco ha uno spot in più, "Circeo - Quarto Caldo": diventa uno spot nuovo, assegnato in
  automatico alla zona "Latina - Circeo - Terracina".
- Circa una cattura su sei ha il peso scritto in kg (es. "1.25"): all'import diventa grammi.

Rigenerabili con `node scripts/generaDatiTestPianifica.mjs <numeroSessioni> <seme> --condivisione <Nome>`.

### Prove suggerite

1. Importa il file da 50 sessioni come backup, poi i file di Marco e Luca come dati condivisi:
   le tue sessioni restano 50, le statistiche restano sulle tue 80 catture.
2. Mappa: le tue sessioni sono cerchi, quelle di Marco triangoli con la punta in su,
   quelle di Luca con la punta in giù. Colori come i tuoi (rosso 0, rosa 1-4, verde 5-8, blu 9+).
3. Sessioni registrate: quelle condivise mostrano "Condivisa da Marco/Luca" e non hanno il pulsante elimina.
4. Filtro "Origine dati": tutti, solo miei, solo condivisi, solo Marco, solo Luca.
5. Pianifica uscita: l'intestazione indica quante sessioni sono condivise; nel dettaglio sono segnate "(condivisa)".
6. Reimporta il file di Marco: i suoi dati vengono aggiornati, non duplicati.
7. Importa per errore il backup da 50 nel pulsante della condivisione: compare un messaggio che rimanda a "Importa".
8. Condividi i tuoi dati e prova a reimportare il file creato: viene rifiutato perché è tuo.
