import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Massage Studio',
  description: 'Privacy policy and data protection of our massage studio according to GDPR.',
  robots: 'index, follow',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-stone-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-stone-300">Effective from: March 2024</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="prose prose-stone max-w-none">
          <h2 className="text-2xl font-bold text-stone-900 mt-8 mb-4">1. Data Controller</h2>
          <p className="text-stone-700 mb-6">
            The data controller responsible for processing your personal data according to GDPR:
          </p>
          <div className="bg-stone-50 p-6 rounded-lg mb-6">
            <p className="text-stone-900 font-semibold mb-2">[Your Studio Name]</p>
            <p className="text-stone-700">[Street and House Number]</p>
            <p className="text-stone-700">[Postal Code and City]</p>
            <p className="text-stone-700">Germany</p>
            <p className="text-stone-700 mt-4">Phone: [Phone Number]</p>
            <p className="text-stone-700">Email: [Email Address]</p>
          </div>

          <h2 className="text-2xl font-bold text-stone-900 mt-8 mb-4">2. Data We Collect</h2>
          <p className="text-stone-700 mb-4">
            We collect and process the following categories of personal data:
          </p>
          <ul className="list-disc list-inside space-y-2 mb-6 text-stone-700">
            <li><strong>Contact Information:</strong> Name, email address, phone number</li>
            <li><strong>Appointment Data:</strong> Date, time, type of service booked</li>
            <li><strong>Preferences:</strong> Language setting, notification options</li>
            <li><strong>Technical Data:</strong> IP address, browser information (for security purposes only)</li>
          </ul>

          <h2 className="text-2xl font-bold text-stone-900 mt-8 mb-4">3. Purpose of Data Processing</h2>
          <p className="text-stone-700 mb-4">
            Your data is processed for the following purposes:
          </p>
          <ul className="list-disc list-inside space-y-2 mb-6 text-stone-700">
            <li>Management and processing of your appointment bookings</li>
            <li>Sending appointment confirmations and change notifications</li>
            <li>Reminders and notifications</li>
            <li>Improvement of our services</li>
            <li>Ensuring cybersecurity and fraud prevention</li>
          </ul>

          <h2 className="text-2xl font-bold text-stone-900 mt-8 mb-4">4. Legal Basis</h2>
          <p className="text-stone-700 mb-6">
            Processing is based on your consent (Art. 6 para. 1 a GDPR) or for contract performance (Art. 6 para. 1 b GDPR). For security measures, we rely on legitimate interests (Art. 6 para. 1 f GDPR).
          </p>

          <h2 className="text-2xl font-bold text-stone-900 mt-8 mb-4">5. Data Retention</h2>
          <p className="text-stone-700 mb-6">
            Your data will be retained for a maximum of 6 months after completion of your appointment. After that, your data will be automatically deleted unless other legal retention requirements apply. You can request deletion of your data at any time (see section 9).
          </p>

          <h2 className="text-2xl font-bold text-stone-900 mt-8 mb-4">6. Data Sharing</h2>
          <p className="text-stone-700 mb-6">
            We do not share your personal data with third parties unless necessary to fulfill your appointment or you have explicitly consented. This may include email service providers or payment processors.
          </p>

          <h2 className="text-2xl font-bold text-stone-900 mt-8 mb-4">7. Your Rights</h2>
          <p className="text-stone-700 mb-4">
            You have the following rights:
          </p>
          <ul className="list-disc list-inside space-y-2 mb-6 text-stone-700">
            <li><strong>Right of Access:</strong> You can access your stored data at any time</li>
            <li><strong>Right to Rectification:</strong> You can have incorrect data corrected</li>
            <li><strong>Right to Erasure:</strong> You can request deletion of your data ("right to be forgotten")</li>
            <li><strong>Data Portability:</strong> You can receive your data in structured form</li>
            <li><strong>Right to Object:</strong> You can object to data processing</li>
            <li><strong>Complaint Rights:</strong> You can file a complaint with the relevant data protection authority</li>
          </ul>

          <h2 className="text-2xl font-bold text-stone-900 mt-8 mb-4">8. Security</h2>
          <p className="text-stone-700 mb-6">
            We implement technical and organizational measures to protect your data from misuse and unauthorized access. This includes:
          </p>
          <ul className="list-disc list-inside space-y-2 mb-6 text-stone-700">
            <li>Encrypted data transmission (HTTPS)</li>
            <li>Secure password policies</li>
            <li>Audit logs for monitoring access</li>
            <li>Regular security checks</li>
          </ul>

          <h2 className="text-2xl font-bold text-stone-900 mt-8 mb-4">9. Request Data Deletion</h2>
          <p className="text-stone-700 mb-4">
            You can request deletion of your data at any time. Please contact us at:
          </p>
          <div className="bg-stone-50 p-6 rounded-lg mb-6">
            <p className="text-stone-700">Email: <strong>[Email Address]</strong></p>
            <p className="text-stone-700 mt-2">Please provide your booking number or email address.</p>
            <p className="text-stone-700 mt-2">After receiving your request, we will delete your data within 30 days (GDPR requirement).</p>
          </div>

          <h2 className="text-2xl font-bold text-stone-900 mt-8 mb-4">10. Cookies & Tracking</h2>
          <p className="text-stone-700 mb-6">
            This website does not use tracking cookies or external analytics services that collect personal data. We only use functionally necessary cookies for session management.
          </p>

          <h2 className="text-2xl font-bold text-stone-900 mt-8 mb-4">11. Contact & Data Protection Officer</h2>
          <p className="text-stone-700 mb-6">
            If you have questions about this privacy policy or wish to exercise your rights, please contact us at:
          </p>
          <div className="bg-stone-50 p-6 rounded-lg">
            <p className="text-stone-700">Email: <strong>[Email Address]</strong></p>
            <p className="text-stone-700 mt-2">Phone: <strong>[Phone Number]</strong></p>
          </div>

          <p className="text-stone-500 text-sm mt-12">
            This privacy policy was last updated in March 2024. We reserve the right to update this privacy policy at any time.
          </p>
        </div>
      </div>
    </div>
  )
}
