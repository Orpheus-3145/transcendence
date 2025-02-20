import * as forge from 'node-forge';
import * as fs from 'fs';

export const SSL_FOLDER: string = process.env.SSL_FOLDER;
export const SSL_PREFIX: string = process.env.SSL_PREFIX;

export function checkTLSfiles(TLSpath: string = SSL_FOLDER, TLSprefix: string = SSL_PREFIX) {
	const TLSfileKey: string = `${TLSpath}/${TLSprefix}.key`;
	const TLSfileCrt: string = `${TLSpath}/${TLSprefix}.crt`;

	return fs.existsSync(TLSfileKey) && fs.existsSync(TLSfileCrt);
}

export function makeTLSfiles(TLSpath: string = SSL_FOLDER, TLSprefix: string = SSL_PREFIX): void {
	const TLSfileKey: string = `${TLSpath}/${TLSprefix}.key`;
	const TLSfileCrt: string = `${TLSpath}/${TLSprefix}.crt`;

	// generate new RSA key (4096 bit)
	const keypair = forge.pki.rsa.generateKeyPair(4096);
	const privateKeyPem = forge.pki.privateKeyToPem(keypair.privateKey);

	// create auot-signed certificate
	const cert = forge.pki.createCertificate();
	cert.publicKey = keypair.publicKey;
	cert.serialNumber = '01';
	cert.validity.notBefore = new Date();
	cert.validity.notAfter = new Date();
	cert.validity.notAfter.setDate(cert.validity.notBefore.getDate() + 365);

	// set cert data
	const subject = [{ name: 'commonName', value: TLSprefix }];
	cert.setSubject(subject);
	cert.setIssuer(subject);

	// sign certificate with private key
	cert.sign(keypair.privateKey, forge.md.sha256.create());

	// convert into PEM key and certificate
	const certPem = forge.pki.certificateToPem(cert);

	// create TLS folder (if does not exist) and saves files
	if (fs.existsSync(TLSpath) == false) fs.mkdirSync(TLSpath, { recursive: true });

	fs.writeFileSync(TLSfileKey, privateKeyPem); // by defaut it overrides any existing file
	fs.writeFileSync(TLSfileCrt, certPem);
}
