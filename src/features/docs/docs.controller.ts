import { Request, Response } from "express";
import { getAllDocs } from "./docs.service.js";
import { sendSuccess } from "../../lib/api-response.js";

export async function getDocsController(
  _req: Request,
  res: Response
): Promise<void> {
  const docs = await getAllDocs();
  sendSuccess(res, docs, "Documents retrieved successfully");
}
