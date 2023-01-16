# English characters [![Travis CI Build Status](https://img.shields.io/travis/com/Richienb/english-chars/master.svg?style=for-the-badge)](https://travis-ci.com/Richienb/english-chars)

Characters in the english language.

[![NPM Badge](https://nodei.co/npm/english-chars.png)](https://npmjs.com/package/english-chars)

## Install

```sh
npm install english-chars
```

## Usage

```js
const englishChars = require("english-chars");

englishChars.uppercase
//=> 'ABCDE...'

englishChars.lowercase
//=> 'abcdef...'
```

## API

### englishChars

#### uppercase

Type: `string`

Uppercase alphabet letters.

#### lowercase

Type: `string`

Lowercase alphabet letters.

#### letters

Type: `string`

Uppercase and lowercase alphabet letters.

#### digits

Type: `string`

Digits from 0 to 9.

#### all

Type: `string`

All the characters.
