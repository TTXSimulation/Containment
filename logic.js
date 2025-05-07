
const { jsPDF } = window.jspdf;
const data = [{'title': 'Standort CAS: Erstes verschlüsseltes System im Produktionsnetz', 'text': 'Ein Arbeitsplatzsystem im Produktionsnetzwerk des Standorts CAS (Magstadt) ist vollständig verschlüsselt. Das System ist nicht mehr bedienbar; der Bildschirm zeigt nach einem automatischen Neustart nur noch einen schwarzen Hintergrund mit blinkendem Cursor. Die Verschlüsselungsstruktur entspricht exakt dem bekannten Verhalten der ALPHV-Ransomware. Der betroffene Host ist AD-angebunden und hatte Zugriff auf produktionsnahe Systeme. Die Microsoft-365-Dienste funktionieren weiterhin.', 'options': ['A) System sofort isolieren, RAM sichern und forensisch erfassen', 'B) System unter Beobachtung belassen – keine Maßnahme ohne weiteren Befund', 'C) EDR-Containment auf alle Systeme dieser Benutzergruppe anwenden', 'D) Keine operativen Maßnahmen – Beobachtung fortsetzen']}, {'title': 'Standort CAS: Weitere Produktionssysteme zeigen Verschlüsselung', 'text': 'Zusätzlich zum ersten betroffenen System werden drei weitere Clients im Produktionsnetz des Standorts CAS kompromittiert. Zwei davon sind direkt mit Maschinensteuerungen vernetzt. SMB-Verbindungen zu einem zentralen Produktions-Fileserver sind aktiv. Die Logs zeigen Dateioperationen außerhalb der erwarteten Muster, darunter ungewöhnliche Zugriffszeiten und Dateiänderungen.', 'options': ['A) Betroffene Endpoints isolieren, Fileserver intensiv überwachen', 'B) Zugriff zum Fileserver sofort trennen – lateral movement verhindern', 'C) Gesamtes Produktionsnetz physisch/logisch isolieren – Notbetrieb vorbereiten', 'D) AD-Konten der betroffenen Nutzer sperren und Passwortrotation einleiten']}, {'title': 'Standort CAS: Datenabfluss über Produktionssysteme festgestellt', 'text': 'Im CAS-Netzwerk wird kontinuierlicher, verschlüsselter Outbound-Traffic zu einer externen Cloudadresse festgestellt. Mehrere Systeme senden kleine Datenpakete in Intervallen von zwei Minuten. Die Dateinamen – etwa cas_export_Q2.zip oder personalstruktur.pdf – deuten auf sensible Inhalte hin. Das dienstliche Transferkonto svc_transfer_auto ist auf den betroffenen Systemen aktiv.', 'options': ['A) Dienstkonto deaktivieren, externe Verbindungen blockieren, Meldung vorbereiten', 'B) Weiter beobachten – keine Exfiltration sicher nachgewiesen', 'C) Weitere Analyse abwarten – keine voreilige Maßnahme', 'D) Systeme mit aktivem Dienstkonto vorsorglich isolieren']}, {'title': 'Standort CAS: Active Directory unter aktiver Beeinträchtigung', 'text': 'Das zentrale Active Directory-System des Standorts CAS zeigt deutliche Auffälligkeiten: erhöhte Antwortzeiten, Authentifizierungsprobleme und Prozessaktivitäten mit hohem Ressourcenverbrauch. Ein forensischer Snapshot deutet auf erste Verschlüsselungsprozesse hin. Das System ist geschäftskritisch für alle Anmeldungen im lokalen Netzwerk – ein Ausfall hätte massive Auswirkungen.', 'options': ['A) AD-Server isolieren, Notauthentifizierung aktivieren und Failover vorbereiten', 'B) Backups prüfen und kontrollierten Systemwechsel vorbereiten', 'C) System weiterlaufen lassen – M365 funktioniert stabil', 'D) Situation erfassen, Entscheidung an C-Level eskalieren']}, {'title': 'Standort CAS: Entscheidung zur vollständigen Isolation', 'text': 'Trotz eingeleiteter Maßnahmen breitet sich die Ransomware im CAS-Netzwerk weiter aus. Mindestens drei weitere VLANs zeigen Infektionsanzeichen. Ein vollständiger Air Gap zur physischen und logischen Trennung ist vorbereitet – würde aber einen Produktionsstopp von bis zu 48 Stunden nach sich ziehen.', 'options': ['A) Standort CAS vollständig vom Netz trennen – Ausbreitung stoppen', 'B) Nur betroffene Netzsegmente trennen – Produktion eingeschränkt fortführen', 'C) Entscheidung ans C-Level eskalieren – Air Gap vorbereiten', 'D) Air Gap nur im Fall eines AD-Gesamtausfalls aktivieren']}];
let current = 0;
const answers = [];

function startSimulation() {
  document.getElementById('intro').classList.remove('visible');
  document.getElementById('intro').classList.add('hidden');
  document.getElementById('scenario').classList.remove('hidden');
  renderScenario();
}

function renderScenario() {
  const s = data[current];
  const container = document.getElementById('scenario');
  container.innerHTML = `<h2>${s.title}</h2><p>${s.text}</p>`;
  s.options.forEach((opt, i) => {
    const btn = document.createElement('div');
    btn.className = 'option';
    btn.textContent = opt;
    btn.onclick = () => {
      const expl = document.createElement('textarea');
      expl.placeholder = 'Begründung eingeben...';
      container.appendChild(expl);
      const confirm = document.createElement('button');
      confirm.textContent = 'Antwort bestätigen';
      confirm.onclick = () => {
        answers[current] = {
          answer: String.fromCharCode(65 + i),
          option: opt,
          explanation: expl.value
        };
        current++;
        if (current < data.length) {
          renderScenario();
        } else {
          showSummary();
        }
      };
      container.appendChild(confirm);
      btn.classList.add('selected');
    };
    container.appendChild(btn);
  });
}

function showSummary() {
  document.getElementById('scenario').classList.add('hidden');
  document.getElementById('summary').classList.remove('hidden');
  let out = '';
  answers.forEach((a, i) => {
    out += `<p><strong>Szenario ${i+1}</strong><br>Antwort: ${a.answer}<br>Begründung: ${a.explanation}</p>`;
  });
  document.getElementById('summaryContent').innerHTML = out;
}

function generatePDF() {
  const doc = new jsPDF();
  let y = 10;
  answers.forEach((a, i) => {
    doc.text(`Szenario ${i+1}: Antwort ${a.answer}`, 10, y);
    y += 10;
    doc.text(`Begründung: ${a.explanation}`, 10, y);
    y += 20;
  });
  doc.save('Containment-Ergebnis.pdf');
}
