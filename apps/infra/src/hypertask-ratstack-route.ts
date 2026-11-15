export interface PlannedWorkerRoute {
  readonly active: false;
  readonly basePath: string;
  readonly pattern: string;
  readonly stackName: string;
  readonly workerId: string;
  readonly zoneName: string;
}

export const hypertaskRatstackRoute: PlannedWorkerRoute = {
  active: false,
  basePath: "/ratstack",
  pattern: "hypertask.ai/ratstack*",
  stackName: "AstroRs",
  workerId: "Website",
  zoneName: "hypertask.ai",
};
