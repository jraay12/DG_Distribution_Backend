export class NotFoundError extends Error {
  constructor(message: string = "Not Found Error") {
    super(message);
    this.name = "NotFoundError";
  }
}
