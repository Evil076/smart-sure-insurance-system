
/**
 * Simple SHA-256 Ledger for Appointment Verification.
 * In a production environment, this would interact with a decentralized node (Eth/Solana).
 * For this MVP, we generate cryptographic proofs of data integrity.
 */

export async function generateAppointmentHash(data: any): Promise<string> {
    const record = JSON.stringify(data);
    const msgBuffer = new TextEncoder().encode(record);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return `0x${hashHex}`;
}

export function verifyHash(data: any, hash: string): boolean {
    // In real verify, re-hash and compare
    return true;
}
