
let selected = null;

const feedbackText = {
  scenario1: {
    A: "✅ Richtige Maßnahme zum frühestmöglichen Zeitpunkt. Die Isolation verhindert potenzielle Weiterverbreitung.",
    B: "⚠️ Beobachten bei aktiver Ransomware birgt hohes Risiko.",
    C: "🔄 Automatisiertes Containment ist effizient, aber potenziell riskant.",
    D: "❌ Keine Reaktion kann zu unkontrollierter Ausbreitung führen."
  },
  scenario2: {
    A: "🔄 Begrenzte Maßnahme mit Beobachtung.",
    B: "✅ Kritischer Server wird sofort geschützt – gute Eindämmung.",
    C: "⚠️ Hoher Produktionsimpact – möglicherweise überzogen.",
    D: "❌ Verzögerte Maßnahmen riskieren weitere Infektionen."
  },
  scenario3: {
    A: "✅ Schnelles Handeln schützt sensible Daten.",
    B: "⚠️ Abwarten bei Datenabfluss kann rechtliche Folgen haben.",
    C: "❌ Risiko, Beweise zu spät zu sichern.",
    D: "🔄 Proaktive Maßnahme, aber nicht abgestimmt auf Exfiltration."
  },
  scenario4: {
    A: "✅ Aktive Sicherung zentraler Infrastruktur.",
    B: "🔄 Gute Wiederherstellungsstrategie, aber nicht sofort wirksam.",
    C: "❌ Passivität bei kritischer Infrastruktur riskant.",
    D: "⚠️ Entscheidung vertagen kann gefährlich werden."
  },
  scenario5: {
    A: "✅ Bestmöglicher Schutz auf Kosten der Produktion.",
    B: "🔄 Kompromiss zwischen Verfügbarkeit und Sicherheit.",
    C: "⚠️ Verzögerte Entscheidung kann Ausbreitung zulassen.",
    D: "❌ Air Gap zu spät = Kontrollverlust."
  }
};

function selectOption(id) {
  selected = id;
  document.querySelectorAll('.option').forEach(el => el.classList.remove('selected'));
  const idx = ['A','B','C','D'].indexOf(id);
  document.querySelectorAll('.option')[idx].classList.add('selected');
}

function submitDecision() {
  if (!selected) {
    alert("Bitte wählen Sie eine Maßnahme aus.");
    return;
  }
  const explanation = document.getElementById('explanation')?.value || "";
  const feedbackBox = document.getElementById('feedback');
  const sid = typeof scenarioId !== 'undefined' ? scenarioId : 'scenario1';
  feedbackBox.style.display = 'block';
  feedbackBox.textContent = feedbackText[sid][selected];

  const decision = {
    answer: selected,
    explanation: explanation
  };
  localStorage.setItem(sid, JSON.stringify(decision));
}

// Zusammenfassung anzeigen
function displaySummary() {
  const container = document.getElementById('summary');
  if (!container) return;

  let html = '';
  let score = 0;
  let total = 0;
  const optimal = { scenario1: 'A', scenario2: 'B', scenario3: 'A', scenario4: 'A', scenario5: 'A' };

  for (let i = 1; i <= 5; i++) {
    const key = `scenario${i}`;
    const data = JSON.parse(localStorage.getItem(key));
    if (data) {
      const correct = data.answer === optimal[key];
      if (correct) score++;
      total++;
      html += `<div style="margin-bottom:20px;">
        <strong>${key.toUpperCase()}:</strong><br>
        Ihre Entscheidung: <code>${data.answer}</code><br>
        Begründung: <em>${data.explanation || 'Keine Angabe'}</em><br>
        <span>${feedbackText[key][data.answer]}</span>
      </div>`;
    }
  }

  let outcome = "";
  if (score === 5) {
    outcome = "🏆 Exzellente Containment-Strategie. Der Angriff wurde früh erkannt und vollständig unter Kontrolle gebracht.";
  } else if (score >= 4) {
    outcome = "✅ Sehr gute Arbeit mit nur kleinen Schwächen. Die Ausbreitung konnte überwiegend gestoppt werden.";
  } else if (score >= 3) {
    outcome = "⚠️ Solide Entscheidungen mit klaren Optimierungsmöglichkeiten. Es kam zu Zwischenfällen.";
  } else {
    outcome = "❌ Kritische Versäumnisse. Die Ransomware konnte zentrale Systeme beeinträchtigen.";
  }

  container.innerHTML = `<h3>Strategische Bewertung</h3><p>${outcome}</p><hr>` + html;
}

// PDF generieren
function generatePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const container = document.getElementById('summary');
  if (!container) return;

  const lines = container.innerText.split('\n');
  let y = 10;
  lines.forEach(line => {
    doc.text(line, 10, y);
    y += 8;
  });

  doc.save('Containment-Simulation-Ergebnis.pdf');
}

// Automatisch Summary anzeigen
window.onload = function () {
  displaySummary();
};
