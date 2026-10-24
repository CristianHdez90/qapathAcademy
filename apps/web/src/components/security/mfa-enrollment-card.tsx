"use client";

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

type MfaEnrollment = {
  /** URI otpauth:// emitida por el backend de QAPath Academy. */
  uri: string;
  /** Clave secreta Base32. Solo debe mostrarse durante la vinculación. */
  secret: string;
};

/**
 * Adaptador visual de la configuración MFA.
 * El QR se renderiza localmente como SVG; no se envía el secreto a un generador externo.
 * Esta pantalla NO genera ni almacena credenciales; utiliza el contrato del backend.
 */
export function MfaEnrollmentCard({ uri, secret }: MfaEnrollment) {
  const [showSecret, setShowSecret] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');
  const valid = uri.startsWith('otpauth://totp/') && /^[A-Z2-7]+=*$/.test(secret);

  if (!valid) {
    return <p role="alert" className="feedback bad">No se pudo mostrar la configuración MFA. Solicita una clave nueva.</p>;
  }

  async function copySecret() {
    try {
      await navigator.clipboard.writeText(secret);
      setCopyState('copied');
    } catch {
      setCopyState('error');
    }
  }

  return (
    <section className="mfa-enrollment" aria-labelledby="mfa-enrollment-title">
      <h2 id="mfa-enrollment-title">Vincula tu aplicación autenticadora</h2>
      <p>Abre Google Authenticator, Microsoft Authenticator u otra app TOTP. Pulsa <strong>Agregar cuenta</strong> y escanea este código QR.</p>
      <div className="mfa-qr-frame">
        <QRCodeSVG
          value={uri}
          size={224}
          marginSize={3}
          level="M"
          bgColor="#ffffff"
          fgColor="#102033"
          title="Código QR para configurar MFA en QAPath Academy"
          role="img"
          aria-label="Código QR de configuración MFA; usa tu aplicación autenticadora para escanearlo"
          style={{ display: 'block', width: '100%', height: 'auto' }}
        />
      </div>
      <p className="hint">Si estás abriendo QAPath Academy desde el mismo celular, elige ingresar la clave manualmente.</p>
      <div className="mfa-manual-key">
        <div className="mfa-manual-heading">
          <strong>Clave secreta (alternativa manual)</strong>
          <button
            type="button"
            className="button button-outline"
            onClick={() => setShowSecret(current => !current)}
            aria-expanded={showSecret}
            aria-controls="mfa-secret-value"
          >
            {showSecret ? 'Ocultar clave' : 'Mostrar clave'}
          </button>
        </div>
        <div id="mfa-secret-value">
          {showSecret ? <code className="mfa-secret-value">{secret}</code> : <span className="mfa-secret-mask">•••• •••• •••• ••••</span>}
        </div>
        <button type="button" className="button button-outline" onClick={() => void copySecret()}>Copiar clave</button>
        <span aria-live="polite" role="status" className="mfa-copy-status">
          {copyState === 'copied' ? 'Clave copiada.' : copyState === 'error' ? 'No se pudo copiar; muestra y copia la clave manualmente.' : ''}
        </span>
      </div>
      <p className="hint">Tipo: basado en tiempo (TOTP) · 6 dígitos · periodo de 30 segundos.</p>
      <p className="mfa-security-note">El QR y la clave dan acceso a tus códigos MFA. No los compartas, publiques ni captures en pantalla.</p>
    </section>
  );
}
