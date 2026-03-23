const fs = require('fs');

const apiUrl = process.env.API_URL || 'http://localhost:8083';

const content = `export const environment = {
  production: true,
  apiUrl: '${apiUrl}',
};\n`;

fs.mkdirSync('src/environments', { recursive: true });
fs.writeFileSync('src/environments/environment.ts', content);

console.log(`environment.ts generated with apiUrl: ${apiUrl}`);
