import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Datenschutzerklärung | Massage Studio',
  description: 'Datenschutz und Datenschutzerklärung unseres Massage Studios nach GDPR und deutschem Datenschutzrecht.',
  robots: 'index, follow',
}

export default function DatenschutzPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-stone-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Datenschutzerklärung</h1>
          <p className="text-stone-300">Gültig ab: März 2024</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="prose prose-stone max-w-none">
          <h2 className="text-2xl font-bold text-stone-900 mt-8 mb-4">1. Verantwortlicher</h2>
          <p className="text-stone-700 mb-6">
            Verantwortlicher für die Datenverarbeitung im Sinne der DSGVO:
          </p>
          <div className="bg-stone-50 p-6 rounded-lg mb-6">
            <p className="text-stone-900 font-semibold mb-2">[Ihr Studio Name]</p>
            <p className="text-stone-700">[Straße und Hausnummer]</p>
            <p className="text-stone-700">[PLZ und Stadt]</p>
            <p className="text-stone-700">Deutschland</p>
            <p className="text-stone-700 mt-4">Tel: [Telefonnummer]</p>
            <p className="text-stone-700">E-Mail: [E-Mail Adresse]</p>
          </div>

          <h2 className="text-2xl font-bold text-stone-900 mt-8 mb-4">2. Erhobene Daten</h2>
          <p className="text-stone-700 mb-4">
            Wir erheben und verarbeiten die folgenden Kategorien von personenbezogenen Daten:
          </p>
          <ul className="list-disc list-inside space-y-2 mb-6 text-stone-700">
            <li><strong>Kontaktdaten:</strong> Name, E-Mail-Adresse, Telefonnummer</li>
            <li><strong>Termindaten:</strong> Datum, Uhrzeit, Art der gebuchten Leistung</li>
            <li><strong>Präferenzen:</strong> Spracheinstellung, Benachrichtigungsoptionen</li>
            <li><strong>Technische Daten:</strong> IP-Adresse, Browser-Informationen (nur zu Sicherheitszwecken)</li>
          </ul>

          <h2 className="text-2xl font-bold text-stone-900 mt-8 mb-4">3. Zweck der Datenverarbeitung</h2>
          <p className="text-stone-700 mb-4">
            Ihre Daten werden verarbeitet für:
          </p>
          <ul className="list-disc list-inside space-y-2 mb-6 text-stone-700">
            <li>Verwaltung und Abwicklung Ihrer Terminbuchungen</li>
            <li>Versand von Terminbestätigungen und Änderungsmitteilungen</li>
            <li>Erinnerungen und Benachrichtigungen</li>
            <li>Verbesserung unserer Services</li>
            <li>Gewährleistung der Cybersicherheit und Betrugsprävention</li>
          </ul>

          <h2 className="text-2xl font-bold text-stone-900 mt-8 mb-4">4. Rechtsgrundlage</h2>
          <p className="text-stone-700 mb-6">
            Die Verarbeitung erfolgt auf Basis Ihrer Einwilligung (Art. 6 Abs. 1 a DSGVO) oder zur Erfüllung eines Vertrags (Art. 6 Abs. 1 b DSGVO). Bei Sicherheitsmaßnahmen handelt es sich um berechtigte Interessen (Art. 6 Abs. 1 f DSGVO).
          </p>

          <h2 className="text-2xl font-bold text-stone-900 mt-8 mb-4">5. Speicherdauer</h2>
          <p className="text-stone-700 mb-6">
            Ihre Daten werden maximal 6 Monate nach Abschluss Ihres Termins gespeichert. Danach werden sie automatisch gelöscht, sofern keine anderen gesetzlichen Aufbewahrungspflichten bestehen. Sie können jederzeit die Löschung Ihrer Daten beantragen (siehe Punkt 9).
          </p>

          <h2 className="text-2xl font-bold text-stone-900 mt-8 mb-4">6. Weitergabe an Dritte</h2>
          <p className="text-stone-700 mb-6">
            Wir geben Ihre personenbezogenen Daten nicht an Dritte weiter, sofern dies nicht zur Erfüllung Ihres Vertrags notwendig ist oder Sie ausdrücklich zugestimmt haben. Dies kann E-Mail-Service-Provider oder Zahlungsanbieter einschließen.
          </p>

          <h2 className="text-2xl font-bold text-stone-900 mt-8 mb-4">7. Ihre Rechte</h2>
          <p className="text-stone-700 mb-4">
            Sie haben das Recht:
          </p>
          <ul className="list-disc list-inside space-y-2 mb-6 text-stone-700">
            <li><strong>Auskunft:</strong> Erhalten Sie jederzeit Auskunft über Ihre gespeicherten Daten</li>
            <li><strong>Berichtigung:</strong> Unrichtige Daten können Sie berichtigen lassen</li>
            <li><strong>Löschung:</strong> Sie können die Löschung Ihrer Daten beantragen ("Recht auf Vergessenwerden")</li>
            <li><strong>Datenübertragbarkeit:</strong> Erhalten Sie Ihre Daten in strukturierter Form</li>
            <li><strong>Widerspruch:</strong> Sie können der Verarbeitung widersprechen</li>
            <li><strong>Beschwerde:</strong> Sie können sich an die zuständige Datenschutzbehörde wenden</li>
          </ul>

          <h2 className="text-2xl font-bold text-stone-900 mt-8 mb-4">8. Sicherheit</h2>
          <p className="text-stone-700 mb-6">
            Wir setzen technische und organisatorische Maßnahmen ein, um Ihre Daten vor Missbrauch und unbefugtem Zugriff zu schützen. Dies umfasst:
          </p>
          <ul className="list-disc list-inside space-y-2 mb-6 text-stone-700">
            <li>Verschlüsselte Datenübertragung (HTTPS)</li>
            <li>Sichere Passwortrichtlinien</li>
            <li>Audit-Logs zur Überwachung von Zugriffen</li>
            <li>Regelmäßige Sicherheitschecks</li>
          </ul>

          <h2 className="text-2xl font-bold text-stone-900 mt-8 mb-4">9. Datenlöschung beantragen</h2>
          <p className="text-stone-700 mb-4">
            Sie können die Löschung Ihrer Daten jederzeit beantragen. Bitte kontaktieren Sie uns unter:
          </p>
          <div className="bg-stone-50 p-6 rounded-lg mb-6">
            <p className="text-stone-700">E-Mail: <strong>[E-Mail Adresse]</strong></p>
            <p className="text-stone-700 mt-2">Bitte geben Sie Ihre Buchungsnummer oder E-Mail-Adresse an.</p>
            <p className="text-stone-700 mt-2">Nach Erhalt Ihres Antrags werden wir Ihre Daten innerhalb von 30 Tagen löschen (GDPR Anforderung).</p>
          </div>

          <h2 className="text-2xl font-bold text-stone-900 mt-8 mb-4">10. Cookies & Tracking</h2>
          <p className="text-stone-700 mb-6">
            Diese Website verwendet keine Tracking-Cookies oder externen Analysedienste, die personenbezogene Daten sammeln. Wir nutzen nur funktionsnotwendige Cookies zur Session-Verwaltung.
          </p>

          <h2 className="text-2xl font-bold text-stone-900 mt-8 mb-4">11. Kontakt & Datenschutzbeauftragter</h2>
          <p className="text-stone-700 mb-6">
            Bei Fragen zur Datenschutzerklärung oder zur Ausübung Ihrer Rechte kontaktieren Sie uns unter:
          </p>
          <div className="bg-stone-50 p-6 rounded-lg">
            <p className="text-stone-700">E-Mail: <strong>[E-Mail Adresse]</strong></p>
            <p className="text-stone-700 mt-2">Telefon: <strong>[Telefonnummer]</strong></p>
          </div>

          <p className="text-stone-500 text-sm mt-12">
            Diese Datenschutzerklärung wurde zuletzt aktualisiert am März 2024. Wir behalten uns vor, diese Datenschutzerklärung jederzeit anzupassen.
          </p>
        </div>
      </div>
    </div>
  )
}
