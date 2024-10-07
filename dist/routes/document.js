"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = __importDefault(require("../controllers"));
const jwt_1 = require("../config/jwt");
const middleware_1 = require("../middleware");
const validators_1 = __importDefault(require("../validators"));
const router = (0, express_1.Router)();
// Route for creating a new document
router.post("/create", jwt_1.verifyAccessToken, (0, middleware_1.validateRequest)(validators_1.default.auth.createDocument), controllers_1.default.document.createDocumentController);
router.put("/content/:documentId", jwt_1.verifyAccessToken, controllers_1.default.document.updateDocument);
// Route for fetching documents by user ID
router.get("/", jwt_1.verifyAccessToken, (0, middleware_1.validateRequest)(validators_1.default.auth.getDocumentsById), controllers_1.default.document.getDocumentsByUserIdController);
//route to delete documents by user ID
router.delete("/:documentId", jwt_1.verifyAccessToken, (0, middleware_1.validateRequest)(validators_1.default.auth.deleteDocumentById), controllers_1.default.document.deleteDocumentByUserId);
//route to toggle isFavorite
router.put("/:documentId", jwt_1.verifyAccessToken, (0, middleware_1.validateRequest)(validators_1.default.auth.updateDocumentIsFavourite), controllers_1.default.document.toggleIsFavoriteByDocumentId);
exports.default = router;
