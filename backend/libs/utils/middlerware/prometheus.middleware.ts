import PromClient from "prom-client";
import { NextFunction, Request, Response } from "express";
import { formatStatusCode, matchVsRegExps } from "../util";

const http_request_duration_seconds = "http_request_duration_seconds";
const register = PromClient.register;

const makeHttpMetric = (metricType?: "histogram" | "summary") => {
  const labels = ["status_code", "method", "path"];
  if (metricType === "summary") {
    return new PromClient.Summary({
      name: http_request_duration_seconds,
      help:
        "duration summary of http responses labeled with: " + labels.join(", "),
      labelNames: labels,
      percentiles: [0.5, 0.75, 0.95, 0.98, 0.99, 0.999],
      registers: [register],
    });
  }
  if (metricType === "histogram" || !metricType) {
    return new PromClient.Histogram({
      name: http_request_duration_seconds,
      help:
        "duration histogram of http responses labeled with: " +
        labels.join(", "),
      labelNames: labels,
      buckets: [0.003, 0.03, 0.1, 0.3, 1.5, 10],
      registers: [register],
    });
  }
  throw new Error("metricType option must be histogram or summary");
};

const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const sendSuccess = (output: unknown) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end(output);
  };

  const metricsResponse = register.metrics();
  if (metricsResponse.then) {
    metricsResponse
      .then((output) => sendSuccess(output))
      .catch((err) => next(err));
  } else {
    sendSuccess(metricsResponse);
  }
};

const excludeRoutes = ["/health", "/heath"];
const metricsPath = "/metrics";
PromClient.collectDefaultMetrics();
const metrics = {
  [http_request_duration_seconds]: makeHttpMetric(),
};

export const PrometheusMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const metricsMatch = new RegExp("^" + metricsPath + "/?$");
  const path = req.originalUrl || req.url; // originalUrl gets lost in koa-connect?

  if (path.match(metricsMatch)) {
    return metricsMiddleware(req, res, next);
  }

  if (excludeRoutes.length > 0 && matchVsRegExps(path, excludeRoutes)) {
    return next();
  }

  const labels: Record<string, any> = {};
  const timer = metrics[http_request_duration_seconds].startTimer(labels);
  res.on("finish", () => {
    labels.status_code = formatStatusCode(res.statusCode);
    labels.method = req.method;
    labels.path = req.path;
    timer();
  });
  next();
};
