import { Router  } from "express";
import controller from "../controllers";
import { authenticateUser } from "../middleware"; 
import { validateRequest } from "../middleware";
import validators from "../validators";

const router = Router();


router.post("/",authenticateUser,validateRequest(validators.auth.createDocument) ,controller.document.createDocument);
router.get("/", authenticateUser,validateRequest(validators.auth.getDocumentsById) ,controller.document.getDocumentsByUserId);
router.put("/:documentId",authenticateUser,validateRequest(validators.auth.updateDocumentIsFavourite), controller.document.toggleIsFavoriteByDocumentId);
router.delete("/:documentId", authenticateUser,validateRequest(validators.auth.deleteDocumentById),controller.document.deleteDocumentByUserId);
router.get("/:documentId",authenticateUser,validateRequest(validators.auth.getDocumentsById),controller.document.getDocumentById)
router.post("/:documentId",authenticateUser,validateRequest(validators.auth.updateDocument),controller.document.updateDocument)

export default router;
