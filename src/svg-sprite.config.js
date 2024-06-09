import url from "url";
import path from 'path';

const fileName = url.fileURLToPath(import.meta.url);
const dirName = path.dirname(fileName);
const baseDirName = path.dirname(dirName);

export default {
  "dest": ".",
  "mode": {
    "symbol": {
      "inline": true,
      "sprite": "vjs-sprite-icons.svg",
      "dest": "vjs-sprite",
      "example": {
        "dest": "index.html",
        "template": path.join(baseDirName, "template/sprite.html")
      }
    }
  },
  "shape": {
    "id": { "generator": "vjs-icon-%s" },
    "dimension": {
      "maxWidth": 48,
      "maxHeight": 48
    }
  },
  "svg": {
    "xmlDeclaration": false,
    "doctypeDeclaration": false
  }
};
