import { Response } from "express";
interface IRes<T> { httpStatusCode: number; success: boolean; message: string; data?: T; meta?: { page: number; limit: number; total: number; totalPages: number; } }
export const sendResponse = <T>(res: Response, r: IRes<T>) =>
  res.status(r.httpStatusCode).json({ success: r.success, message: r.message, data: r.data, meta: r.meta });
