API documentation for the jtoh.pro backend interface.

> [!warning]
> This API is in early active development, be cautious about bugs and breaking changes.

Client usage example:
```ts
import { client } from '@client/modules/api';          // import client 
const response = await client.GET('/api/version');     // create request
if (response.data) console.log(response.data.version); // access data
```