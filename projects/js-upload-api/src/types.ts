import { Client } from "./Client.js";
import { ClientPkey } from "./ClientPkey.js";

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
export type ClientType = Client | ClientPkey;