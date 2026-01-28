import type { Request, Response, NextFunction } from "express";

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) {
    return res
      .status(500)
      .json({ error: "ADMIN_TOKEN is not configured" });
  }

  const provided = req.header("x-admin-token");
  if (!provided || provided !== adminToken) {
    return res.status(401).json({ error: "Invalid admin token" });
  }

  return next();
};
