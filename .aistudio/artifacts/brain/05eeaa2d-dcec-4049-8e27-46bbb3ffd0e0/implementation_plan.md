# Vrijbaan — Live Matrixborden & Verkeerssnelheid

Vrijbaan is een specialistische, afleidingsvrije snelweg-assistent voor automobilisten in Nederland. De app beantwoordt tijdens het rijden één cruciale vraag: **wat staat er verderop op mijn weg, in mijn rijrichting, op de matrixborden, en hoe hard rijdt het verkeer daar?**

Dit plan beschrijft de volledige realisatie van Vrijbaan volgens de specificaties van Gerrit Jan de Bruin ([D-1] t/m [X-10]), verrijkt met de bevestigde keuzes voor ritsimulatie, een Express NDW data-proxy met ETag caching, en PWA-installatie met Screen Wake Lock.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Hieronder staan de beslissingen die zijn afgestemd in de intake. Controleer de aanpak en klik op **Proceed** om de bouw te starten.

- **Ritsimulatie & Testmodus (Bevestigd)**: Schakelbaar tussen live apparaat-GPS en een interactieve ritsimulatie (bijv. A2 Amsterdam Amstel → Utrecht Oudenrijn en A10 Ring Amsterdam). Hiermee kan het gedrag van hectometer-interpolatie, naderende matrixportalen en snelheidsbalken direct vanaf het bureau of in stilstand worden gevalideerd.
- **Data-architectuur & NDW Proxy (Bevestigd)**: Een robuuste backend Express-proxy (`/api/traffic/*`) die de actuele NDW XML/GZ feeds (`matrixsignaalinformatie`, `trafficspeed`, `measurement`) met conditionele HTTP-headers (ETag / If-Modified-Since) ophaalt en parseert, met automatische fallback op een snapshot als het netwerk offline is of NDW tijdelijk onbereikbaar is.
- **PWA & Scherm-aan (Bevestigd)**: Volwaardige Progressive Web App configuratie (`manifest.json`, iconen, `apple-touch-icon`) en Screen Wake Lock API integratie zodat het scherm ingeschakeld blijft zolang het scherm *Onderweg* actief is en de locatie aan staat [O-21].

---

## 1. Overview & Core Concept

### Wat de app doet
- **Onderweg (Startscherm)**: Bepaalt via GPS de actuele weg, hectometer en rijbaan (links/rechts op basis van oplopende of aflopende kilometrering [P-4]). Biedt een rustige, verticale tijdlijn (zoals Flitsmeister, géén kaart) van naderende portalen met getrouwe matrixborden (snelheidsringen 50/70/80/100, rode kruisen, invoegpijlen, einde-beperking schijf), filevakken en een 10-segments snelheidsbalk (10, 20 of 30 km vooruit).
- **Overzicht (Landelijk)**: Toont een filterbare lijst van alle actuele files en rijstrookafsluitingen op het Nederlandse hoofdwegennet, met zoekveld op wegnummer (bijv. A2, A12, N201), tellers bovenaan en waarschuwingen voor rode kruisen in of vlak na files.
- **Instellingen & Status**: Beheer van GPS-gebruik, automatische verversingsinterval (1, 2 of 5 min), inzicht in sessiedataverbruik (bijv. "4,2 MB") en achtergrondinformatie over NDW en VILD.

---

## 2. User Experience & Visual Design

### Visuele Identiteit & Richtlijnen
- **Nederlandse Wegen-typografie & Bordenstijl**:
  - Wegschilden exact conform RWS-richtlijnen: Rood met witte opdruk voor autosnelwegen (`A2`, `A10`, `A12`), geel met zwarte opdruk voor provinciale wegen (`N201`, `N3`).
  - Knooppunt-aanduidingen met het herkenbare klaverblad-icoon [O-3a] in plaats van de tekst "knooppunt".
  - Matrixborden met donkere LED-achtergrond, witte/gele cijfers in een rode ring, helder rode Andreas-kruisen (afgekruiste stroken), witte diagonale invoegpijlen en de diagonale zwarte strepen op witte achtergrond voor einde-snelheidsbeperking.
- **Snelheidskleuren ([O-9])**:
  - `Rood`: < 50 km/u (file / zware vertraging)
  - `Oranje`: 50 – 80 km/u (langzaam verkeer)
  - `Groen`: ≥ 80 km/u (vrije doorstroming)
  - `Grijs`: Geen meting beschikbaar
- **Typografie & Numerieke Notatie**:
  - Getallen in Nederlandse notatie [D-5] met komma als decimaalteken (`km 58,3`, `1,2 km`).
  - Monospace tabular cijfers (`tabular-nums`) voor kilometrering, afstanden en snelheden zodat de tijdlijn en tabellen niet verspringen.
- **Dark / Light Modus ([K-4])**:
  - Automatische synchronisatie met het besturingssysteem of toestelmodus, met geoptimaliseerde nachtweergave voor rijden in het donker zonder verblinding.

```
┌────────────────────────────────────────────────────────┐
│ [≡ Vrijbaan]          14:32 · 1 min (● Groen)   [⟳]   │
├────────────────────────────────────────────────────────┤
│  [A2] Richting Utrecht  (☘ Holendrecht → Afrit 3)      │
│  Bord: 100 km/u  ·  Gemeten: 104 km/u  ·  km 34,2 Re   │
├────────────────────────────────────────────────────────┤
│  Vooruitkijken: [10 km] [ 20 km ] [30 km]             │
│  [████████][████████][████    ][░░░░░░░░]  (Snelheid)  │
├────────────────────────────────────────────────────────┤
│  TIJDLĲN                                               │
│   Hier      ● Huidige positie                          │
│             │                                          │
│   650 m     ● ┌─────┐ ┌─────┐                          │
│             │ │ 100 │ │ 100 │ (Portaal km 34,8)        │
│             │ └─────┘ └─────┘                          │
│   1,4 km    ● File 42 km/u, 1,2 km lang                │
│             │ (laagste meting 31 km/u)                 │
│   2,1 km    ● ┌─────┐ ┌─────┐ ┌─────┐                  │
│             │ │  X  │ │ 70  │ │  ↘  │ (t/m km 37,2)    │
│             │ └─────┘ └─────┘ └─────┘                  │
│   6,5 km    ● Vrije baan (100 km/u)                    │
├────────────────────────────────────────────────────────┤
│  [ Onderweg ]           [ Overzicht ]    [ Instellingen]│
└────────────────────────────────────────────────────────┘
```

---

## 3. Key Product Decisions & Trade-Offs

1. **Kaartloos ontwerp ([D-3])**:
   - *Keuze*: Een strakke verticale tijdlijn (zoals Flitsmeister/Waze lijstmodus) in plaats van een zware interactieve kaart.
   - *Rationale*: Tijdens het rijden wil de bestuurder binnen 1 seconde zien wat er vóór hem gebeurt. Een kaart leidt af en verbruikt veel rekenkracht en data.
2. **Afstand-interpolatie en Hectometrering ([P-1] t/m [P-7])**:
   - *Keuze*: Vrijbaan projecteert de GPS-locatie op de dichtstbijzijnde weglijn tussen twee meetpunten (maximaal 100 m afstand). De kilometrering wordt lineair geïnterpoleerd en de rijrichting wordt afgeleid uit het stijgen of dalen over minstens 300 m.
3. **Samenvoegen van Portalen ([O-13])**:
   - *Keuze*: Portalen met identieke signalering direct achter elkaar worden samengevoegd tot één item met `t/m ... km`. Dit voorkomt herhalende visuele ruis op de tijdlijn.
4. **Dataverbruik optimalisatie ([G-5], [G-6], [I-3])**:
   - *Keuze*: Server-side ETag checks zorgen ervoor dat alleen veranderde gegevens worden gedownload. Dataverbruik per minuut en per sessie wordt live bijgehouden in megabytes.

---

## 4. Technical Architecture & Data Strategy

```
┌──────────────────────────────────────────────────────────────┐
│                      Client (React 19 / Vite)                 │
│                                                              │
│  ┌───────────────┐ ┌────────────────┐ ┌───────────────────┐  │
│  │ Onderweg View │ │ Overzicht View │ │ Instellingen View │  │
│  └───────┬───────┘ └────────┬───────┘ └─────────┬─────────┘  │
│          │                  │                   │            │
│  ┌───────▼──────────────────▼───────────────────▼─────────┐  │
│  │ TrafficState & GPS Engine                              │  │
│  │ • GPS Matcher (Weg / km / Rijbaan)                     │  │
│  │ • Ritsimulator (A2 / A10 Demo Ritten)                  │  │
│  │ • Matrix Sign Renderer & Timeline Aggregator           │  │
│  │ • Screen Wake Lock & PWA Hook                          │  │
│  └──────────────────────────┬─────────────────────────────┘  │
└─────────────────────────────┼────────────────────────────────┘
                              │ HTTP /api/traffic/*
┌─────────────────────────────▼────────────────────────────────┐
│                   Server / API Proxy Router                  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ • Matrixsignaalinformatie parser & cache (ETag)        │  │
│  │ • Trafficspeed parser & cache (ETag)                   │  │
│  │ • Measurement & VILD database (knooppunten, afritten)  │  │
│  │ • Traffic Segmenter (files < 50 km/u, langzaam < 80)   │  │
│  └──────────────────────────┬─────────────────────────────┘  │
└─────────────────────────────┼────────────────────────────────┘
                              │ HTTPS (opendata.ndw.nu)
                     ┌────────▼────────┐
                     │ NDW Open Data   │
                     │ Portal Feeds    │
                     └─────────────────┘
```

### Belangrijkste Componenten & Modules:
- `src/types/traffic.ts`: Data-definities voor meetlocaties, snelheidsmetingen, matrixborden, tijdlijn-items, VILD-wegvakken en filekaarten.
- `src/services/vildData.ts`: Ingebouwde VILD-plaatsnamendatabase met knooppunten (klaverblad), afritnummers, bruggen, tunnels en richtingen voor Nederlandse snelwegen (A1 t/m A79, N-wegen).
- `src/services/geoMatcher.ts`: GPS-naar-snelweg projectie, hectometer-interpolatie en rijrichtingdetectie (oplopend vs aflopend).
- `src/services/ndwService.ts`: Data-laag voor live NDW opvraging, verversingstimer, ETag beheer en dataverbruik-meter.
- `src/components/MatrixSign.tsx`: Schaalbaar SVG-component voor matrixborden (snelheidsringen 50, 70, 80, 100, rood kruis, invoegpijl links/rechts, einde alle beperkingen).
- `src/components/RoadShield.tsx`: Nederlandse A-weg (rood/wit) en N-weg (geel/zwart) schildjes.
- `src/components/SpeedBar.tsx`: 10-segments snelheidsbalk voor 10, 20 of 30 km vooruitkijken.
- `src/views/OnderwegView.tsx`: Startscherm met kopkaart, snelheidsbalk en dynamische tijdlijn.
- `src/views/OverzichtView.tsx`: Landelijk file- en afsluitingenoverzicht met zoekfunctie.
- `src/views/InstellingenView.tsx`: Instellingen, datateller, bronvermelding en ritsimulator-bediening.
- `src/hooks/useWakeLock.ts`: Automatische Wake Lock beheer voor Onderweg [O-21].
- `src/hooks/usePWAInstall.ts`: PWA-installatie banner en functionaliteit.

---

## Verificatieplan

1. **GPS & Wegpassing**: Testen met live GPS en ritsimulatie op de A2 (Amsterdam-Zuidoost naar Utrecht) om te verifiëren dat hectometerpaaltjes vloeiend interpoleren en de rijrichting ("Richting Utrecht", Rechterrijbaan) correct wordt bepaald.
2. **Matrixborden & Tijdlijn**: Verifiëren dat opeenvolgende portalen met identieke snelheden worden samengevoegd (`t/m km X`), en dat rode kruisen en invoegpijlen exact getoond worden zoals boven de weg.
3. **Overzicht & Filters**: Zoeken op "A2" en controleren of tellers, filelengte, gemiddelde snelheid en rode-kruiswaarschuwingen direct kloppen.
4. **Instellingen & Offline**: Verversen uitschakelen / testen met verbroken verbinding om te verifiëren dat "Verversen mislukt" netjes verschijnt en de oude data behouden blijft [S-4].
5. **Code & PWA Build**: `npm run build` en `compile_applet` doorlopen zonder typefouten of waarschuwingen.
