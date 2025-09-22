# 📱 FamTime - Familie Kalender App

En React Native Expo app til familieplanlægning og koordinering af aktiviteter.

## 🎯 App Koncept

FamTime hjælper familier med at planlægge og koordinere aktiviteter ved at:
- Oprette og håndtere familiebegivenheder
- Give overblik over familiens kalender
- Finde ledige tidspunkter til familieaktiviteter  
- Gøre det nemt at planlægge kvalitetstid sammen

## ✨ Features

🗓️ **Kalender Visning**: Se alle familiebegivenheder i en intuitiv kalendervisning  
📅 **Event Oprettelse**: Opret begivenheder med avancerede dato/tid pickers  
👨‍👩‍👧‍👦 **Familie Oversigt**: Se status på alle familiemedlemmer  
⏰ **Ledig Tid Finder**: Find tidspunkter hvor alle er ledige  
🎯 **Activity Templates**: Hurtige skabeloner til populære familieaktiviteter  
📱 **iPhone 14 Pro Optimeret**: Perfect tilpasset til moderne iPhone skærme med safe areas

### 📱 4 Hovedskærme:

1. **Kalender** (`index.js`)
   - Grupperet visning af begivenheder pr. dato
   - Detaljeret event modal med sletning
   - Pull-to-refresh funktionalitet
   - Elegant dato headers (I dag, I morgen, etc.)

2. **Familie Oversigt** (`explore.js`)
   - Familiemedlemmers status og tilgængelighed
   - Ugentlige statistikker
   - Næste begivenhed oversigt
   - Clean og oversigteligt design

3. **Ledig Tid Finder** (`schedule.js`)
   - Intelligent visning af tilgængelige tidspunkter
   - Filtrering efter præferencer
   - Farvekodning baseret på tilgængelighed
   - Konflikthåndtering

4. **Planlæg** (`planner.js`)
   - 8 forudkonfigurerede aktivitetsskabeloner
   - Avancerede dato/tid pickers med fuld-skærm modals
   - Brugerdefineret begivenhedssoprettelse
   - Integration med lokalt storage og Calendar API

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
