export const sendResponse = (res, r) => res.status(r.httpStatusCode).json({ success: r.success, message: r.message, data: r.data, meta: r.meta });
