import { LocalPresence } from "colyseus";

if (!global.presence) {
  global.presence = new LocalPresence();
}

export default global.presence;