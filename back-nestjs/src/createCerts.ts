import * as forge from 'node-forge';
import * as fs from 'fs';

export function checkTLSfiles(path: string) {

  return (fs.existsSync(`${path}/cert.key`) && fs.existsSync(`${path}/cert.`))
}

export function makeCertTLS(certFilesPath: string): void {

  const certFilesPrefix: string = 'cert';
  
  // Genera una nuova chiave RSA (4096 bit)
  const keypair = forge.pki.rsa.generateKeyPair(4096);
  const privateKeyPem = forge.pki.privateKeyToPem(keypair.privateKey);

  // Crea un certificato autofirmato
  const cert = forge.pki.createCertificate();
  cert.publicKey = keypair.publicKey;
  cert.serialNumber = '01';
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setDate(cert.validity.notBefore.getDate() + 365);

  // Imposta i dati del certificato
  const subject = [
    { name: 'commonName', value: certFilesPrefix }
  ];
  cert.setSubject(subject);
  cert.setIssuer(subject);

  // Firma il certificato con la chiave privata
  cert.sign(keypair.privateKey, forge.md.sha256.create());

  // Converte la chiave e il certificato in formato PEM
  const certPem = forge.pki.certificateToPem(cert);

  // Scrive i file sul disco
  fs.writeFileSync(`${certFilesPath}/${certFilesPrefix}.key`, privateKeyPem); // File della chiave
  fs.writeFileSync(`${certFilesPath}/${certFilesPrefix}.crt`, certPem);
  console.log('current dir:', process.cwd())
  // fs.chmodSync()

  console.log('Certificato e chiave privata generati con successo!');
};
