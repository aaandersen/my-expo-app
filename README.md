# FamTime - Apple Calendar Sync App 📅👨‍👩‍👧‍👦

En React Native Expo app der synkroniserer med Apple Calendar for at finde og administrere familietid.

## 🎯 App Koncept

FamTime hjælper familier med at finde ledige tidspunkter til kvalitetstid sammen ved at:
- Synkronisere med Apple/iOS kalendere
- Analysere familiemedlemmers kalendere automatisk
- Foreslå optimale tidspunkter for familieaktiviteter
- Gøre det nemt at planlægge og oprette familieevents

## ✨ Funktionaliteter

### 📱 4 Hovedskærme:

1. **Kalender Integration** (`index.js`)
   - Forbind til Apple Calendar
   - Se dagens events på tværs af familiens kalendere
   - Synkroniser kalenderdata
   - Oversigt over tilsluttede kalendere

2. **Familie Oversigt** (`explore.js`)
   - Visualiser alle familiemedlemmers kalendere
   - Se antal events per person
   - Statistik over familiens aktivitetsniveau
   - Hurtig adgang til individuelle kalendere

3. **Ledige Tider** (`schedule.js`)
   - Intelligent algoritme finder ledige tidspunkter
   - Visualisering af tilgængelighed (alle/de fleste/få ledige)
   - Datovælger for fremtidige dage
   - Direkte planlægning fra ledige slots

4. **Planlæg Familietid** (`planner.js`)
   - Skabeloner til populære familieaktiviteter
   - Tilpassede aktivitetsformularer
   - Forslag til optimale tidspunkter
   - Opret events direkte i kalenderen

## 🛠 Teknisk Implementation

### Tech Stack:
- **React Native** med Expo Router
- **Expo Calendar API** til kalender integration
- **StyleSheet** til styling
- **FlatList** til effektiv listevisning

### Arkitektur:
```
app/
├── (tabs)/
│   ├── index.tsx         # Kalender Integration
│   ├── explore.tsx       # Familie Oversigt  
│   ├── schedule.tsx      # Ledige Tider
│   ├── planner.tsx       # Planlæg Aktiviteter
│   └── _layout.tsx       # Tab Navigation
├── _layout.tsx           # Root Layout
└── modal.tsx             # Modal Screens

services/
└── FamilyCalendarService.ts  # Kalender Logic & Algoritmer

components/
├── ui/                   # UI Komponenter
└── ...                   # Themed Komponenter
```

### 🔧 Tekniske Krav (Opfyldt):
- ✅ **Minimum 3 views/screens** (4 screens implementeret)
- ✅ **Minimum 2 knapper med funktionalitet** (Navigation + features)
- ✅ **Minimum 3 separate screens med navigation** (4 screens med tab navigation)
- ✅ **Minimum 1 liste** (Events, familiemedlemmer, tidspunkter, aktivitetsskabeloner)
- ✅ **Styling i separate filer** (StyleSheet i hver komponent)
- ✅ **README fil** (denne fil)

## 🚀 Installation & Kørsel

### Forudsætninger:
- Node.js (v18+)
- Expo CLI
- iOS device/simulator for kalender adgang

### Setup:
```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS (for kalender funktionalitet)
npm run ios

# Run on Android (begrænset kalender funktionalitet)
npm run android
```

### 📱 Test på Device:
1. Scan QR koden med Expo Go app
2. Giv tilladelse til kalender adgang
3. Test alle 4 tabs og funktionaliteter

## 🎮 Demo Video

> **Demo Video Link:** [Indsæt link til demo video her]

Videoen viser:
- App navigation mellem alle 4 screens
- Kalender integration og permissions
- Familie oversigt med statistikker  
- Algoritme for at finde ledige tider
- Oprettelse af nye familieaktiviteter
- Responsivt design og brugerinteraktion

## 📊 Core Algoritmer

### Ledig Tid Finder:
```typescript
// Finder gaps mellem eksisterende events
findAvailableTimeSlots(date, minDuration, calendars)
```

### Familie Tilgængelighed:
```typescript
// Checker overlappende events på tværs af kalendere
checkFamilyAvailability(startTime, endTime, calendars)
```

### Smart Forslag:
```typescript
// Foreslår optimale tidspunkter baseret på familiemønstre
suggestOptimalTimes(preferences, availability)
```

## 🎨 Design Principper

- **Familie-centreret**: Alle funktioner fokuserer på familietid
- **Visuelt intuitivt**: Farver og ikoner gør navigation let
- **Minimal interaction**: Få tryk for at nå mål
- **Responsive**: Fungerer på alle skærmstørrelser
- **Accessibility**: Support for dark/light mode

## 🔮 Fremtidige Features

- [ ] Push notifikationer for familieevents
- [ ] Integration med flere kalender platforme
- [ ] AI-baserede aktivitetsforslag
- [ ] Familie chatfunktion
- [ ] Deling af familiekalender med eksterne
- [ ] Statistik over familietid trends
- [ ] Gamification af familieaktiviteter

## 📄 Licens

Dette projekt er udviklet som en del af et kodeprojekt og er til uddannelsesformål.

---

**FamTime** - Bringing families together, one event at a time! 💝
