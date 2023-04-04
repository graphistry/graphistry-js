import { Client } from './Client.js';


/**
 * # Kind
 * 
 * The kind of item to set privacy on, defaults to 'dataset'
 * 
 */
export type Kind = 'dataset';


/**
 * # Mode
 * 
 * The privacy mode, 'private', 'public', or 'organization'
 * 
 */
export type Mode = 'private' | 'public' | 'organization';


/**
 * 
 * @internal
 * 
 */
export type ModeActionRaw = '10' | '20' | '30';


/**
 * # ModeActionFriendly
 * 
 * The action to allow, 'view', 'edit', or 'share'
 * 
 */
export type ModeAction = 'view' | 'edit' | 'share';


const friendlyActionToRaw: { [key in ModeAction]: ModeActionRaw } = {
    'view': '10',
    'edit': '20',
    'share': '30'
}

/**
 * # Privacy examples
 * 
 * {@link Privacy} is used to set the privacy mode of an item. By default, items are public,
 * meaning world-readable but not listed in any public Graphistry catalogs.
 * 
 * Setting the privacy, by default, makes it private to the user. No notifications are made.
 * 
 * Various options allow sharing with the organization, sharing with specific users,
 * and sending notifications. When sharing with others, view or edit permissions may be given.
 * 
 * See all convenience method {@link Dataset.privacy}
 * 
 * <br>
 * 
 * ---
 * 
 * <br>
 * 
 * @example **Set a dataset to private**
 * ```javascript
 * import { Privacy } from '@graphistry/node-api';
 * await (new Privacy('myDatasetID')).upload(client);
 * ```
 * 
 * <br>
 * 
 * @example **Set a dataset to public**
 * ```javascript
 * import { Privacy } from '@graphistry/node-api';
 * await (new Privacy('myDatasetID', 'public')).upload(client);
 * ```
 * 
 * <br>
 * 
 * @example **Set a dataset to private, and share it with one user with a notification**
 * ```javascript
 * import { Privacy } from '@graphistry/node-api';
 * await (new Privacy(
 *      'myDatasetID', undefined, undefined, undefined,
 *      ['friend@company.com'], true, "Check out my great viz!"
 * )).upload(client);
 * ```
 * 
 */
export class Privacy {
    id: string;
    kind: Kind;
    modeAction: ModeActionRaw;
    invitedUsers: string[];
    mode: Mode;
    notify: boolean;
    message: string;

    /**
     * 
     * See examples at top of file
     * 
     * Create sharing configuration in preperation for uploading.
     * 
     * @param id The id of the item to set privacy on
     * @param kind The kind of item to set privacy on, defaults to 'dataset'
     * @param mode The privacy mode, 'private', 'public', or 'organization'
     * @param modeAction The action to allow, 'view', 'edit', or 'share'
     * @param invitedUsers The list of Graphistry user emails to share with
     * @param notify Whether to send notifications to the invited users
     * @param message The message to send to the invited users
     **/
    constructor(
        id: string,
        kind: Kind = 'dataset',
        mode: Mode = 'private',
        modeAction?: ModeAction,
        invitedUsers: string[] = [],
        notify = false,
        message = ''
    ) {
        this.id = id;
        this.kind = kind;
        this.mode = mode;
        this.modeAction =
            modeAction ? friendlyActionToRaw[modeAction]
            : this.mode === 'private' ? friendlyActionToRaw['edit']
            : friendlyActionToRaw['view']
        ;
        this.invitedUsers = invitedUsers;
        this.notify = notify;
        this.message = message;
    }

    /**
     * 
     * See examples at top of file
     * 
     * Upload the privacy configuration to the server for an item
     * 
     * @param client The client to use to upload the privacy
     * @returns The privacy object
     * @throws Error if the client is not configured
     * @throws Error if the upload fails
     * 
     */
    public async upload(client: Client): Promise<Privacy> {

        if (!client) {
            throw new Error('No client provided');
        }
        if (!client.authTokenValid() && !client.isServerConfigured()) {
            throw new Error('Client is not configured, set token or creds');
        }

        const opts = {
            obj_pk: this.id,
            obj_type: this.kind,
            mode: this.mode,
            notify: this.notify,
            invited_users: this.invitedUsers,
            mode_action: this.modeAction,
            message: this.message                    
        };

        //console.trace('Privacy.upload', opts, this);

        //TODO get error code
        const resp = await client.post('api/v2/share/link/', opts);

        if (resp.status != 'OK') {
            console.error(`Privacy.upload error: ${resp.message}`);
            throw new Error('Privacy upload failed');
        }

        //TODO return resp.data instead?

        return this;
    }
}