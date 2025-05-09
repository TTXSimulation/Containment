const { jsPDF } = window.jspdf;

const data = [
  {
    title: "Backup-Kompromittierung lähmt Produktionsstandort CAS",
    text: `📌 Ausgangslage:
Am CAS-Standort in Magdeburg läuft ein automatisiertes Nachtsicherungs-Backup der Produktionssysteme. Die Backups werden täglich auf einem zentralen NAS im VLAN 66 (Produktiv – Backup) abgelegt. Dieses Netz ist intern erreichbar, auch von Diagnosesystemen im Bereich Labor (VLAN 29), um eine schnelle Wiederherstellung im Fall von QA-Fehlern zu ermöglichen. Eine granulare Zugriffskontrolle existiert bislang nicht – der Zugriff erfolgt über ein gemeinsam genutztes Dienstkonto.

⚠️ Angriffssituation:
Ein mit ALPHV-Ransomware infiziertes Gerät im VLAN 29 (LAB-WS-CAS-04) nutzt legitime Credentials und offene SMB-Freigaben, um lateral auf das Backup-System im VLAN 66 zuzugreifen. Binnen weniger Minuten werden sämtliche .bak-Dateien mit einem neuen Dateinamenmuster (.locked-cas) überschrieben.`
  },
  {
    title: "Interner Synchronisierungsjob als Einfallstor",
    text: `📌 Ausgangslage:
Im Zuge der laufenden ALPHV-Aktivitäten wurden im CAS-Netzwerk weitere verdächtige Bewegungen registriert. Nachdem das Backup-System in VLAN 66 erfolgreich verschlüsselt wurde, versuchten die Angreifer, über einen internen Dienstprozess administrative Rechte auf angrenzenden Systemen zu erlangen.

Ein geplanter Job zur Synchronisierung zwischen einem QS-Testsystem (VLAN 88) und dem produktiven CAS-GUS-System (VLAN 80) wurde dabei zum Einfallstor: Das Dienstkonto svc_sync_gus verfügte über weitreichende Lese- und Schreibrechte – auch auf Produktionsverzeichnisse.


🧨 ALPHV-Taktik:
Die Ransomware nutzte PowerShell-Remoting aus VLAN 88 heraus, um per gültigem Token Zugriff auf den CAS-GUS-Produktivserver zu erhalten. In mehreren Systemverzeichnissen wurden sensible Produktionsdaten verschlüsselt. Zusätzlich wurde eine Datei INFRA-LOCK-ALERT.txt abgelegt, die auf eine vollständige Kompromittierung der Logistikapplikation hinweist.`
  },
  {
    title: "Zugriff auf zentrale Netzwerkinfrastruktur festgestellt",
    text: `📌 Ausgangslage:
Während sich das Incident-Response-Team auf die Wiederherstellung der CAS-Produktionssysteme konzentriert, registriert das zentrale Monitoring auffällige Zugriffe auf IP-Adressen im Bereich des Management-Netzwerks (VLAN 188). Dort befinden sich Interfaces zur Fernwartung der Netzwerkinfrastruktur des Standorts CAS (Switches, Firewalls, Hypervisoren).

Ein Zugriff über das Notebook eines Technikers (lokal über VLAN 2) wurde festgestellt, der laut Logfiles eine Admin-Session auf dem zentralen CAS-Core-Switch (MGMT-CAS-SW01) gestartet hat – mit einer Session-ID, die bereits 4 Stunden zuvor erzeugt wurde. Verdacht: Session-Hijacking durch ein zuvor abgegriffenes Token oder unzureichend geschützte Management-Zugänge.


🧨 ALPHV-Taktik:
Die Angreifer hatten es gezielt auf persistente Kontrolle über das Netzwerkmanagement abgesehen. Sie konfigurierten temporäre statische Routen, um Datenverkehr unbemerkt über ein internes Tool-System (VLAN 76) umzuleiten, bevor die Exfiltration erfolgte. Zusätzlich wurde ein Firmware-Dump der Backup-Firewall durchgeführt und über eine verschlüsselte Verbindung nach außen übertragen.`
  },
  {
    title: "VPN-Zugriff aus privatem Gerät führt zu Datenexfiltration",
    text: `📌 Ausgangslage:
Nach der partiellen Wiederherstellung der internen Produktionsserver (CAS-APP-01, CAS-DB-01), werden neue EDR-Warnungen gemeldet: Ein Zugriff auf ein internes Backup-Verzeichnis erfolgt aus einem IP-Adressbereich der VPN-Zone (Standort-ID 254). Der Traffic stammt laut Reverse-Proxy-Log von einer SSL-VPN-Verbindung, die sich korrekt authentifiziert hat – angeblich durch einen User der Gruppe „Support-CAS“.

Ein Mitarbeiter, der an diesem Tag eigentlich keinen VPN-Zugang benötigt hätte, meldet sich, dass sein privates Gerät ungewöhnlich langsam läuft – der Hostname passt zu dem VPN-Zugriff.


🧨 ALPHV-Taktik:
Die Angreifer hatten offenbar bereits vor der Verschlüsselung ein gültiges Userzertifikat oder VPN-Token abgegriffen. Über die offene VPN-Zone mit VLAN-Zugriff auf CAS-interne Systeme wurde ein zweiter, versteckter Angriffsvektor aufgebaut.
Sie nutzten das System als Brückenkopf für Datensynchronisation (SMB-Zugriffe auf \\CAS-DB-01\PreStaging) sowie für Reconnaissance im Bereich der Produktionslogistik (VLAN 30 – Lagernetz).`
  },
  {
    title: "Zweiter versteckter Angriffsvektor über VPN-Zone",
    text: `📌 Ausgangslage:
Die Angreifer hatten offenbar bereits vor der Verschlüsselung ein gültiges Userzertifikat oder VPN-Token abgegriffen. Über die offene VPN-Zone mit VLAN-Zugriff auf CAS-interne Systeme wurde ein zweiter, versteckter Angriffsvektor aufgebaut.
Sie nutzten das System als Brückenkopf für Datensynchronisation (SMB-Zugriffe auf \\CAS-DB-01\PreStaging) sowie für Reconnaissance im Bereich der Produktionslogistik (VLAN 30 – Lagernetz).`
  }
];

let current = 0;
const answers = [];

function startSimulation() {
  document.getElementById('intro').style.display = 'none';
  document.getElementById('scenario').style.display = 'block';
  renderScenario();
}

function renderScenario() {
  const s = data[current];
  const container = document.getElementById('scenario');
  container.innerHTML = `<h2>${s.title}</h2><p>${s.text}</p>`;

  const textarea = document.createElement('textarea');
  textarea.placeholder = 'Ihre Einschätzung oder Maßnahme...';
  container.appendChild(textarea);

  const confirm = document.createElement('button');
  confirm.textContent = 'Antwort bestätigen';
  confirm.onclick = () => {
    answers[current] = {
      answer: textarea.value
    };
    current++;
    if (current < data.length) {
      renderScenario();
    } else {
      showSummary();
    }
  };
  container.appendChild(confirm);
}

function showSummary() {
  document.getElementById('scenario').style.display = 'none';
  document.getElementById('summary').style.display = 'block';

  const summaryDiv = document.getElementById('summaryContent');
  summaryDiv.innerHTML = `<h3>Strategische Bewertung</h3><p>Ihre Antworten zu den Szenarien:</p><hr>` +
    answers.map((a, i) => `<p><strong>Szenario ${i+1}</strong><br>Antwort: ${a.answer}</p>`).join('');
}

function generatePDF() {
  const doc = new jsPDF();
  let y = 10;
  answers.forEach((a, i) => {
    doc.text(`Szenario ${i+1}:`, 10, y); y += 10;
    doc.text(`Antwort: ${a.answer}`, 10, y); y += 20;
  });
  doc.save('Containment-Ergebnis.pdf');
}
