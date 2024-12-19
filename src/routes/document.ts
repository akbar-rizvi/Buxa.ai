import { Router  } from "express";
import controller from "../controllers";
import { authenticateUser } from "../middleware"; 
import { validateRequest } from "../middleware";
import validators from "../validators";
import multer from "multer";


const storage = multer.memoryStorage(); 
const upload = multer({ storage });

const router = Router();

router.post("/uploadImage",authenticateUser,upload.single("image"),controller.document.uploadImage)


router.post("/",authenticateUser,validateRequest(validators.auth.createDocument) ,controller.document.createDocument);
router.post("/research",authenticateUser,validateRequest(validators.auth.createResearch),controller.document.createResearch)
router.put("/research/:documentId",authenticateUser,validateRequest(validators.auth.updateResearch),controller.document.updateResearch)
router.post("/research/:documentId",authenticateUser,validateRequest(validators.auth.deleteResearchDocument),controller.document.deleteResearch)
router.get("/",authenticateUser,validateRequest(validators.auth.getDocumentsById),controller.document.getDocumentsByUserId);
router.post("/blog",authenticateUser,controller.document.postToBlogSite)
router.post("/blog-api",authenticateUser,controller.document.createBlogaPI)
router.get("/blog",authenticateUser,validateRequest(validators.auth.getAllBlogData),controller.document.getAllBlogData)
router.get("/research",authenticateUser,validateRequest(validators.auth.getResearchbyUserId),controller.document.getResearchbyUserId)
router.put("/:documentId",authenticateUser,validateRequest(validators.auth.updateDocumentIsFavourite), controller.document. toggleIsFavoriteByDocumentId);
router.delete("/:documentId",authenticateUser,validateRequest(validators.auth.deleteDocumentById),controller.document.deleteDocumentByUserId);
router.get("/:documentId",authenticateUser,validateRequest(validators.auth.getDocumentsById),controller.document.getDocumentById)
router.post("/:documentId",authenticateUser,validateRequest(validators.auth.updateDocument),controller.document.updateDocument)


export default router;
