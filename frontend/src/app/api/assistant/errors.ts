export class AssistantRouteError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AssistantRouteError";
    this.status = status;
  }
}
