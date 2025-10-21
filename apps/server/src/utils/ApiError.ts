export class ApiError extends Error {
  status: number;
  metadata?: any;

  constructor(status: number, message: string, metadata?: any) {
    super(message);
    this.status = status;
    this.metadata = metadata;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
