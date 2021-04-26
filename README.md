# SialiaJS

Sialia is an embeddable C-CDA rendering library. It breaks down CDA documents into sections, allowing clinical users to order and select sections that are relevant to their job.

### Installation

**npm**
```bash
npm add github:Royal-Jay/sialia
```

**npm**
```bash
npm install --save github:Royal-Jay/sialia
```

### Usage

```javascript
import { Sialia } from 'sialia';

ctrl.sialia = new Sialia({
    docs: [{
        name: 'Document Name',
        url: '/path/to/cda.xml'
    }]
});
```

The `docs` property is an array of document objects containing a `name` and `url`.  Each URL would return an XML CDA document with a mime type of `text/html; charset=utf-8`.  Here is an example docs array object:

```javascript
[{
  name: "CCD_1",
  url: "http://sialia.ria.ms:80/file/CCD_1"
},
{
  name: "Doc2",
  url: "http://sialia.ria.ms:80/file/Doc2"
}]
```

### Building

```bash
npm
npm build
```

### Development

To use a development server and watch for file changes, run the following command:

```bash
npm start
```

### BlueButton Updates

Sialia relies on a forked version of bluebutton.js:

https://github.com/Royal-Jay/bluebutton.js

## License


