import express from "express";
const router = express.Router();

const termsOfService = `
<!DOCTYPE html>
<html>
<head><title>Terms of Service</title></head>
<body style="font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto;">
    <h1>Terms of Service</h1>
    <p>Effective Date: October 25, 2025</p>
    <h2>Introduction</h2>
    <p>These Terms of Service (“Terms”) govern your use of Quiz Verse, developed by Lotu Studio (“we”, “our”, or “us”). By using Quiz Verse, you agree to these Terms.</p>
    
    <h2>Use of the App</h2>
    <ul>
        <li>Use Quiz Verse for personal, non-commercial purposes.</li>
        <li>Do not misuse the app, interfere with other users, or attempt unauthorized access.</li>
    </ul>

    <h2>Accounts</h2>
    <ul>
        <li>Users sign in via Google OAuth. Maintain the confidentiality of your account.</li>
        <li>Provide accurate information and do not impersonate others.</li>
    </ul>

    <h2>In-App Currency and Purchases (Future Feature)</h2>
    <ul>
        <li>Quiz Verse may offer virtual in-app currency.</li>
        <li>Purchases of in-app currency are non-refundable.</li>
        <li>Virtual currency has no real-world cash value.</li>
    </ul>

    <h2>Advertisements (Future Feature)</h2>
    <ul>
        <li>The app may display ads from third-party partners.</li>
        <li>Lotu Studio is not responsible for the content or accuracy of third-party ads.</li>
    </ul>

    <h2>Intellectual Property & Disclaimer</h2>
    <ul>
        <li>Quiz Verse is fan-made and not affiliated, endorsed, or sponsored by any game developer, publisher, or trademark owner.</li>
        <li>All logos and images were created by Lotu Studio or AI-generated.</li>
        <li>Quiz Verse is for entertainment and educational purposes only.</li>
        <li>Users may not reproduce or distribute content from Quiz Verse for commercial purposes.</li>
    </ul>

    <h2>Termination</h2>
    <p>Access may be suspended or terminated for violations of these Terms or unlawful behavior.</p>

    <h2>Limitation of Liability</h2>
    <p>Quiz Verse is provided “as is.” Lotu Studio is not liable for indirect, incidental, or consequential damages arising from use.</p>

    <h2>Changes to Terms</h2>
    <p>We may update these Terms over time. Continued use constitutes acceptance of updated Terms.</p>

    <h2>Governing Law</h2>
    <p>These Terms are governed by the laws of your jurisdiction (Germany) without regard to conflict-of-law principles.</p>

    <h2>Contact</h2>
    <p>For questions regarding these Terms, contact us at: <a href="mailto:lotustudio.app@gmail.com">lotustudio.app@gmail.com</a></p>
</body>
</html>
`;

const privacyPolicy = `
<!DOCTYPE html>
<html>
<head><title>Privacy Policy</title></head>
<body style="font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto;">
    <h1>Privacy Policy</h1>
    <p>Effective Date: October 25, 2025</p>
    
    <h2>Introduction</h2>
    <p>Quiz Verse (“we”, “our”, or “Lotu Studio”) values your privacy. This Privacy Policy explains how we collect, use, and protect personal information while using the Quiz Verse app. By using Quiz Verse, you agree to this Privacy Policy.</p>

    <h2>Information We Collect</h2>
    <ul>
        <li><strong>Account Information:</strong> Information provided when signing in with Google OAuth (name, email).</li>
        <li><strong>App Data:</strong> Quiz progress, in-app settings, and interactions with app features.</li>
        <li><strong>Optional Future Data:</strong> Quiz Verse may display ads or offer in-app currency/purchases in future updates. Data collected through these features is also covered by this policy.</li>
    </ul>

    <h2>How We Use Your Data</h2>
    <ul>
        <li>Authenticate and manage your account.</li>
        <li>Save and sync quiz progress.</li>
        <li>Improve app functionality and user experience.</li>
        <li>Support future optional ads or in-app purchases while ensuring privacy.</li>
    </ul>

    <h2>Data Storage</h2>
    <p>Data is stored securely in MongoDB via our backend (Express). Reasonable measures are taken to protect data from unauthorized access.</p>

    <h2>Third-Party Services</h2>
    <p>Google OAuth handles authentication in accordance with its privacy policies. Future ads may be served by third-party providers, who may collect limited information under their own privacy policies.</p>

    <h2>Data Sharing</h2>
    <p>We do not sell or rent your personal data. Information is shared only if required by law or to protect our rights.</p>

    <h2>Children’s Privacy</h2>
    <p>Quiz Verse is intended for users aged 13 and above. We do not knowingly collect information from children under 13.</p>

    <h2>Disclaimer / Intellectual Property</h2>
    <p>All quizzes in Quiz Verse are fan-made and unofficial. They are not endorsed, sponsored, or affiliated with any game developer, publisher, or trademark owner. All logos or images were created by Lotu Studio or AI-generated for illustrative purposes. Quiz Verse is intended for entertainment and educational purposes only. Users may contact us if they believe content infringes any copyright.</p>

    <h2>Changes to this Policy</h2>
    <p>Updates may occur as the app evolves. Changes will be published at the same hosted link.</p>

    <h2>Contact Us</h2>
    <p>For questions about this Privacy Policy or your data, contact us at: <a href="mailto:lotustudio.app@gmail.com">lotustudio.app@gmail.com</a></p>
</body>
</html>
`;

router.get("/privacy", (req, res) => res.send(privacyPolicy));
router.get("/terms", (req, res) => res.send(termsOfService));

export default router;
