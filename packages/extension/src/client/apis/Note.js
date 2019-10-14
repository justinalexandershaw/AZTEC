import {
    fromViewingKey,
} from '~utils/note';
import Web3Service from '~client/services/Web3Service';
import query from '~client/utils/query';
import ApiError from '~client/utils/ApiError';
import proofFactory from './noteProofFactory';

const dataProperties = [
    'hash',
    'value',
    'owner',
    'status',
];

export default class Note {
    constructor({
        id,
    } = {}) {
        this.id = id;
    }

    isValid() {
        return !!this.hash;
    }

    async refresh() {
        const {
            note,
        } = await query({
            type: 'note',
            args: { id: this.id },
        }) || {};

        if (note) {
            dataProperties.forEach((key) => {
                this[key] = note[key];
            });
        }
    }

    // @dev
    // exports an aztec.js note instance for use in proofs

    async export() {
        if (!this.isValid) {
            return null;
        }
        const {
            note,
        } = await query({
            type: 'noteWithViewingKey',
            args: { id: this.id },
        }) || {};

        if (!note || !note.decryptedViewingKey) {
            return null;
        }

        const {
            decryptedViewingKey,
            owner = {},
        } = note;

        return fromViewingKey(decryptedViewingKey, owner.address);
    }

    async grantAccess(addresses) {
        const addressList = typeof addresses === 'string'
            ? [addresses]
            : addresses;


        const { permission } = await query({
            type: 'grantNoteAccess',
            args: {
                id: this.id,
                addresses,
            },
        }) || {};

        // const {
        //     response,
        // } = await query(`
        //     response: grantNoteAccessPermission(noteId: "${this.id}", address: "${addressList.join('')}") {
        //         permission {
        //             metadata
        //             prevMetadata
        //             asset {
        //                 address
        //             }
        //         }
        //         error {
        //             type
        //             key
        //             message
        //             response
        //         }
        //     }
        // `);

        // const {
        //     metadata,
        //     prevMetadata,
        //     asset,
        // } = permission || {};
        // let updated = false;
        // if (metadata
        //     && metadata !== prevMetadata
        // ) {
        //     const {
        //         address: zkAssetAddress,
        //     } = asset;
        //     try {
        //         await Web3Service
        //             .useContract('ZkAsset')
        //             .at(zkAssetAddress)
        //             .method('updateNoteMetaData')
        //             .send(
        //                 this.id,
        //                 metadata,
        //             );
        //     } catch (e) {
        //         throw new ApiError(e);
        //     }
        //     updated = true;
        // }

        // return updated;
    }

    /**
     *
     * Equal
     *
     * - note (Note! or aztec.Note!)
     * - options
     *       sender (Address):          The proof sender.
     *
     * @returns (Bool!)
     */
    async equal(note, {
        sender,
    } = {}) {
        const originalNote = await this.export();
        return proofFactory(
            'privateRange',
            {
                type: 'eq',
                originalNote,
                comparisonNote: note,
                sender,
            },
        );
    }

    /**
     *
     * GreaterThan
     *
     * - note (Note! or aztec.Note!)
     * - options
     *       sender (Address):          The proof sender.
     *
     * @returns (Bool!)
     */
    async greaterThan(note, {
        sender,
    } = {}) {
        const originalNote = await this.export();
        return proofFactory(
            'privateRange',
            {
                originalNote,
                comparisonNote: note,
                sender,
            },
        );
    }

    /**
     *
     * LessThan
     *
     * - note (Note! or aztec.Note!)
     * - options
     *       sender (Address):          The proof sender.
     *
     * @returns (Bool!)
     */
    async lessThan(note, {
        sender,
    } = {}) {
        const comparisonNote = await this.export();
        return proofFactory(
            'privateRange',
            {
                originalNote: note,
                comparisonNote,
                sender,
            },
        );
    }

    /**
     *
     * GreaterThanOrEqualTo
     *
     * - note (Note! or aztec.Note!)
     * - options
     *       sender (Address):          The proof sender.
     *
     * @returns (Bool!)
     */
    async greaterThanOrEqualTo(note, {
        sender,
    } = {}) {
        const originalNote = await this.export();
        return proofFactory(
            'privateRange',
            {
                type: 'gte',
                originalNote,
                comparisonNote: note,
                sender,
            },
        );
    }

    /**
     *
     * LessThanOrEqualTo
     *
     * - note (Note! or aztec.Note!)
     * - options
     *       sender (Address):          The proof sender.
     *
     * @returns (Bool!)
     */
    async lessThanOrEqualTo(note, {
        sender,
    } = {}) {
        const comparisonNote = await this.export();
        return proofFactory(
            'privateRange',
            {
                type: 'gte',
                originalNote: note,
                comparisonNote,
                sender,
            },
        );
    }
}
