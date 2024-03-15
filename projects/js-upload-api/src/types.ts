import { Client } from "./Client.js";
import { ClientPKey } from "./ClientPKey.js";

/**
 * @internal
 * 
 * <br>
 * 
 * ## ClientType
 * 
 * A type including clients with all available authentication methods
 * 
 */
export type ClientType = Client | ClientPKey;