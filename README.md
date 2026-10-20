# Svetinje Srbije

Manastiri i crkve Srbije na mapi, uključujući Kosovo i Metohiju: priče, fotografije, put do svake svetinje i „Moje sveće", kolekcija posećenih mesta. Ceo sajt radi i ćirilicom i latinicom (prekidač Ћ / L gore desno).

## Pokretanje

```bash
npm install
npm run dev
```

## Fotografije

Slike se učitavaju same sa Wikipedije i Wikimedia Commons-a. To su slobodne fotografije koje smeju da se koriste uz navođenje autora, pa aplikacija ispod svake velike slike ispisuje autora i licencu. Taj potpis nemoj da brišeš.

Ako za neku svetinju dobiješ pogrešnu ili ružnu sliku:
1. Otvori commons.wikimedia.org i nađi lepšu fotografiju tog manastira.
2. Kopiraj ime fajla (npr. `Studenica_Monastery.jpg`, bez „File:").
3. U `src/data/monasteries.js` tom manastiru dodaj red `photo: 'Studenica_Monastery.jpg',`.

## Dodavanje svetinja

Sve je u `src/data/monasteries.js`. Tekst se piše latinicom, a ćirilica se pravi automatski. Pre objavljivanja proveri sve datume, imena i koordinate.

## Objavljivanje

Isto kao Skrivena Srbija: GitHub, pa Vercel. Ime projekta na Vercelu: `svetinje-srbije`.
