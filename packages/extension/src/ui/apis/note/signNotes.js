import ConnectionService from '~ui/services/ConnectionService';

export default async function signNotes({
    inputNotes,
    sender,
    assetAddress,
    proof,
    requestId,
}) {
    const noteHashes = inputNotes.map(({ noteHash }) => noteHash);
    const challenge = proof.challengeHex;

    const {
        signatures,
    } = await ConnectionService.post({
        action: 'metamask.eip712.signNotes',
        requestId,
        data: {
            noteHashes,
            assetAddress,
            challenge,
            sender,
        },
    });

    return {
        signatures: signatures.reduce((accum, sig) => accum + sig.slice(2), '0x'),
    };
}
