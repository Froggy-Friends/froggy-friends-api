import { ArgumentsHost, Catch, ExceptionFilter, NotFoundException } from "@nestjs/common";
import path from "path";

@Catch(NotFoundException)
export class NotFoundExceptionFilter implements ExceptionFilter {
    catch(exception: NotFoundException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const request = ctx.getRequest();
        const response = ctx.getResponse();
        const status = exception.getStatus();
        response.status(status).json({
          statusCode: status,
          timestamp: new Date().toISOString(),
          path: request.url
        })
    }
}
