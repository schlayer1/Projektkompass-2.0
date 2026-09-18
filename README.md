# Projektkompass 2.0 | Staatliche Regelschule »Heimbürgeschule« Kahla

Der **Projektkompass 2.0** ist ein agiles, schülerorientiertes und datenschutzfreundliches Web-Werkzeug, um Schülern bei komplexen Unterrichtsprojekten Struktur zu geben und Selbstorganisation einzuüben. 

Er wurde modernisiert auf Basis von **React 18, Vite, TypeScript, Tailwind CSS, Firebase Firestore und Google Gemini AI** – im einheitlichen Designsystem der Heimbürgeschule Kahla (analog zur App *Tag in der Praxis*).

---

## 🌟 Die Kernfunktionen auf einen Blick

1. **Agiles Kanban-Board:**
   * 3 Spalten: *Zu Erledigen*, *In Arbeit*, *Erledigt*.
   * Drag & Drop (HTML5) sowie Touch-freundliche Pfeile (◀ / ▶) für Tablets und Smartphones.
   * Farbige Kategorien (🔍 Recherche, ✂️ Material, ✍️ Text, 🎨 Layout, 🗣️ Präsentation, 💻 Technik, 🔄 Kontrolle).
   * Automatische Fristen- und Überfälligkeits-Warnungen mit Tages-Countdown.

2. **🪄 KI-Zauberstab 2.0 (Intelligente Aufgabenzerlegung):**
   * Große Aufgaben („Vortrag über erneuerbare Energien vorbereiten“) überfordern Schüler oft.
   * Ein Klick auf den **Zauberstab** analysiert die Aufgabe per Gemini AI und erzeugt 4–5 konkrete, machbare Teilschritte als Checkliste.
   * *Offline-Schutz:* Ist das Internet weg oder kein Schlüssel hinterlegt, greift sofort eine didaktische Standardvorlage.

3. **🚨 Gezielte Unterstützung & KI-Projektcoach (Blocker-Signal):**
   * Bei Problemen klicken Schüler auf **„Hilfe / Blockiert“**.
   * Die Aufgabe wird rot hervorgehoben und erscheint im **Lehrer-Cockpit ganz oben**.
   * Der integrierte **KI-Coach** gibt den Schülern didaktische Leitfragen und Impulse, um Hürden selbstständig zu überwinden.

4. **📖 Integriertes Projekt-Tagebuch (Reflexion & Metakognition):**
   * Drei gezielte Reflexionsfelder: *„Das lief heute gut“*, *„Das war schwierig“*, *„Ziel für nächstes Mal“*.
   * Inklusive **KI-Impuls-Button**, der anhand der heute erledigten Aufgaben passende Denkanstöße formuliert.

5. **📈 Sichtbarer Lernprozess (Trend-Chart):**
   * Zeichnet den täglichen Arbeitsfortschritt (Erledigt / In Arbeit / Offen) auf.
   * Erzeugt ein anschauliches Diagramm für den Statusbericht, das zeigt, ob kontinuierlich gearbeitet wurde.

6. **🎓 Lehrer-Cockpit & Klassenradar:**
   * Live-Überblick aller Schülergruppen einer Klasse (z. B. 8a, 8b).
   * **Live-Ampel:** Zeigt sofort an, welche Gruppe im Klassenraum gerade Unterstützung braucht.
   * **Feedback-Snippets:** Lehrkräfte senden mit 1 Klick Rückmeldungen direkt auf das Board der Schüler.
   * **KI-Notenberichte:** Automatische Zusammenfassung des Arbeitsprozesses für Bewertungsgespräche.

7. **🎉 PDF-Export & Druck:**
   * Saubere DIN-A4-Ausgabe mit Schulsiegel und Unterschriftenfeld via `html2pdf.js`.
   * Löst bei 100% Projekt-Abschluss Konfetti aus!

---

## 🔒 Datenschutz & 100% Abwärtskompatibilität

* **Bestehende Altdaten (Version 2.1):** Alle bisher von Schülern oder Kollegen erstellten `.json`-Dateien (`kompass-*.json`) können ohne Datenverlust über **„Laden“ (⬆️)** importiert werden.
* **Auto-Erkennung:** Wurde das Gerät bereits mit der alten HTML-Version genutzt, erkennt Projektkompass 2.0 die Daten (`hk_tasks_v7`) automatisch und bietet die Übernahme mit einem Klick an.
* **Keine Passwörter für Schüler:** Anonymisierte Gruppen-Codes (z. B. `PK-8A-01`) ermöglichen den Zugriff ohne persönliche Kontodaten.
* **Offline-First:** Dank lokaler Queue gehen auch bei instabilem Schul-WLAN keine Eingaben verloren; sie synchronisieren automatisch nach.

---

## 📱 Workflow mit EduPage

1. **Statusberichte einsammeln:**
   * Schüler klicken am Ende der Stunde auf **„Bericht“** -> **„Text kopieren“** und senden diesen per EduPage-Nachricht an die Lehrkraft.
2. **Projektabgabe:**
   * Zum Projektende exportieren Schüler das Board als **PDF** und laden es als Anhang in EduPage hoch.
3. **Aufgaben-Vorlagen verteilen:**
   * Die Lehrkraft legt ein Board mit Pflichtaufgaben an, klickt auf **„Speichern“ (⬇️)** und verteilt die `.json`-Datei über EduPage an die Klasse.

---

## 🛠️ Entwicklung & Build

```bash
# Entwicklungsserver starten
npm run dev

# Produktions-Build erzeugen
npm run build

# Vorschau des Builds
npm run preview
```
