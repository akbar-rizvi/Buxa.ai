import { Router } from "express";
import controller from "../controllers";
import { verifyAccessToken } from "../config/jwt"; 
import { validateRequest } from "../middleware";
import validators from "../validators";

const router = Router();



router.post("/",verifyAccessToken,validateRequest(validators.auth.createDocument) ,controller.document.createDocumentController);
router.put("/content/:documentId",verifyAccessToken ,controller.document.updateDocument);
router.get("/", verifyAccessToken,validateRequest(validators.auth.getDocumentsById) ,controller.document.getDocumentsByUserIdController);
router.get("/:documentId", verifyAccessToken,validateRequest(validators.auth.deleteDocumentById) , controller.document.getDocumentById);
router.delete("/:documentId", verifyAccessToken,validateRequest(validators.auth.deleteDocumentById) , controller.document.deleteDocumentByUserId);
router.put("/:documentId", verifyAccessToken,validateRequest(validators.auth.updateDocumentIsFavourite) , controller.document.toggleIsFavoriteByDocumentId);

export default router;
