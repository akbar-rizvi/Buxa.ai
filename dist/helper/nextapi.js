"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyManager = void 0;
// KeyManager.ts
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class KeyManager {
    constructor(keysFilePath) {
        const absolutePath = path.isAbsolute(keysFilePath)
            ? keysFilePath
            : path.resolve(__dirname, keysFilePath);
        console.log(absolutePath);
        if (!fs.existsSync(absolutePath)) {
            throw new Error(`API keys file not found at ${absolutePath}`);
        }
        const data = fs.readFileSync(absolutePath, 'utf-8');
        this.keys = JSON.parse(data);
        if (!Array.isArray(this.keys) || this.keys.length === 0) {
            throw new Error('API keys file must contain a non-empty array of keys.');
        }
        this.currentIndex = 0;
    }
    getNextKey() {
        const key = this.keys[this.currentIndex];
        this.currentIndex = (this.currentIndex + 1) % this.keys.length;
        return key;
    }
}
exports.KeyManager = KeyManager;
