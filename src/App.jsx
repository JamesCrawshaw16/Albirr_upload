import { Component } from "react";
import { IdValidation } from "idmission-web-sdk";

const LOGO_URL =
  "https://storage.googleapis.com/production-bluehost-v1-0-0/330/1265330/7nEHp4pB/b770a5ab3c874bf9b76c46d97839d620";

async function getSessionId() {
  const response = await fetch("/api/get-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.id) {
    throw new Error(data.error || "A document session could not be started.");
  }

  return data.id;
}

class PortalErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="notice notice-error" role="alert">
          <h2>We couldn’t open the upload portal</h2>
          <p>{this.state.error.message || "Please refresh the page and try again."}</p>
          <button type="button" onClick={() => window.location.reload()}>
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const sdkTheme = {
  base: "light",
  isFullscreen: false,
  fontFamily: '"Lato", Arial, sans-serif',
  background: "#ffffff",
  textColor: "#212121",
  buttons: {
    primary: {
      backgroundColor: "#1fa44e",
      textColor: "#ffffff",
    },
    secondary: {
      backgroundColor: "#212121",
      textColor: "#ffffff",
    },
  },
};

export default function App() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <a href="https://albirrcreditunion.co.uk/" aria-label="Al-Birr Credit Union home">
          <img src={LOGO_URL} alt="Al-Birr Credit Union" />
        </a>
        <span>Staff document upload</span>
      </header>

      <main>
        <section className="intro" aria-labelledby="page-title">
          <p className="eyebrow">Document verification</p>
          <h1 id="page-title">Upload a customer document</h1>
          <p>
            Choose the document image supplied by the customer and follow the steps below. Make
            sure the whole document is visible, in focus and free from glare.
          </p>
        </section>

        <section className="sdk-card" aria-label="Document upload journey">
          <PortalErrorBoundary>
            <IdValidation
              sessionId={getSessionId}
              allowUploadingDocumentsFromStorage={true}
              geolocationEnabled={false}
              geolocationRequired={false}
              debugMode={false}
              theme={sdkTheme}
            />
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
