import { Component, useEffect, useState } from "react";
import { IdValidation } from "idmission-web-sdk";

const LOGO_URL =
  "https://storage.googleapis.com/production-bluehost-v1-0-0/330/1265330/7nEHp4pB/b770a5ab3c874bf9b76c46d97839d620";
const PORTAL_URL = "https://kyc.idmission.com/idportal/index.action";

async function getSessionId() {
  const response = await fetch("/api/get-session", { method: "POST", headers: { "Content-Type": "application/json" } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.id) throw new Error(data.error || "A document session could not be started.");
  return data.id;
}

class PortalErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) return (
      <div className="notice notice-error" role="alert">
        <h2>We couldn’t open the upload portal</h2>
        <p>{this.state.error.message || "Please refresh the page and try again."}</p>
        <button type="button" onClick={() => window.location.reload()}>Try again</button>
      </div>
    );
    return this.props.children;
  }
}

function PinGate({ onUnlock }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setChecking(true);
    setError("");
    try {
      const response = await fetch("/api/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "The PIN could not be checked.");
      onUnlock();
    } catch (requestError) {
      setError(requestError.message);
      setPin("");
    } finally {
      setChecking(false);
    }
  }
  return (
    <main className="pin-page">
      <form className="pin-card" onSubmit={submit}>
        <img src={LOGO_URL} alt="Al-Birr Credit Union" />
        <p className="eyebrow">Staff document upload</p>
        <h1>Enter your access PIN</h1>
        <p>This upload portal is intended for Al-Birr Credit Union staff.</p>
        <label htmlFor="portal-pin">Access PIN</label>
        <input id="portal-pin" type="password" inputMode="numeric" autoComplete="off" value={pin}
          onChange={(event) => { setPin(event.target.value); setError(""); }}
          aria-invalid={Boolean(error)} aria-describedby={error ? "pin-error" : undefined} autoFocus />
        {error && <p id="pin-error" className="pin-error" role="alert">{error}</p>}
        <button type="submit" disabled={checking || !pin.trim()}>{checking ? "Checking…" : "Continue"}</button>
      </form>
    </main>
  );
}

const sdkTheme = {
  base: "light", isFullscreen: false, fontFamily: '"Lato", Arial, sans-serif', background: "#ffffff", textColor: "#212121",
  buttons: {
    primary: { backgroundColor: "#1fa44e", textColor: "#ffffff" },
    secondary: { backgroundColor: "#212121", textColor: "#ffffff" },
    positive: { backgroundColor: "#1fa44e", textColor: "#ffffff" },
  },
};

const sdkClassNames = {
  idCapture: {
    uploadOrCaptureScreen: {
      container: "upload-choice",
      captureWithCameraPanel: "upload-choice-camera",
      separator: "upload-choice-separator",
      uploadFromStoragePanel: "upload-choice-panel",
      uploadFromStorageButton: "sdk-upload-button",
      modal: "sdk-type-modal",
      dialog: "sdk-type-dialog",
      dialogHeading: "sdk-type-heading",
      dialogCloseButton: "sdk-type-close",
      passportButton: "sdk-type-button",
      idCardButton: "sdk-type-button",
    },
  },
};

export default function App() {
  const [unlocked, setUnlocked] = useState(null);
  useEffect(() => {
    fetch("/api/access-status", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => setUnlocked(Boolean(data.authorized)))
      .catch(() => setUnlocked(false));
  }, []);
  if (unlocked === null) return <main className="pin-page"><p>Opening secure upload portal…</p></main>;
  if (!unlocked) return <PinGate onUnlock={() => setUnlocked(true)} />;
  return (
    <div className="app-shell">
      <header className="site-header">
        <a href="https://albirrcreditunion.co.uk/" aria-label="Al-Birr Credit Union home"><img src={LOGO_URL} alt="Al-Birr Credit Union" /></a>
        <span>Staff document upload</span>
      </header>
      <main className="portal-main">
        <aside className="instructions" aria-labelledby="page-title">
          <p className="eyebrow">Document verification</p>
          <h1 id="page-title">Upload a customer document</h1>
          <p className="intro-copy">Use this page when a customer has supplied an image of their identity document by email.</p>
          <ol className="steps">
            <li><span>1</span><div><strong>Check the image</strong><p>Make sure the whole document is visible, in focus and free from glare.</p></div></li>
            <li><span>2</span><div><strong>Select and upload</strong><p>Choose Passport or ID Card, then upload the customer’s image from your device.</p></div></li>
            <li><span>3</span><div><strong>Review the result</strong><p>When processing has finished, open the IDMission Identity Portal and sign in to review it.</p></div></li>
          </ol>
          <a className="portal-link" href={PORTAL_URL} target="_blank" rel="noreferrer">Open IDMission Identity Portal <span aria-hidden="true">↗</span></a>
          <div className="powered">
            <span>Powered by TransUnion &amp; IDMission</span>
            <div className="powered-logos"><img src="/brands/transunion.png" alt="TransUnion" /><span aria-hidden="true">+</span><img src="/brands/idmission.png" alt="IDMission" /></div>
          </div>
        </aside>
        <section className="sdk-card" aria-label="Document upload journey">
          <PortalErrorBoundary>
            <IdValidation sessionId={getSessionId} allowUploadingDocumentsFromStorage={true}
              geolocationEnabled={false} geolocationRequired={false} debugMode={false}
              theme={sdkTheme} classNames={sdkClassNames} />
          </PortalErrorBoundary>
        </section>
      </main>
      <footer>
        <span>Al-Birr Credit Union</span>
        <span>Authorised by the Prudential Regulation Authority and regulated by the Financial Conduct Authority and the Prudential Regulation Authority. FRN 978201.</span>
      </footer>
    </div>
  );
}
