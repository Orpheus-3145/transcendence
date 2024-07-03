// Step 1: Create HelloService (hello.service.ts)
import { Injectable } from '@nestjs/common';

@Injectable()
export class HelloService {
  async getData(): Promise<string> {
    // Fetch data here (e.g., from a database or external API)
    return 'Hello, World from Service!';
  }
}
