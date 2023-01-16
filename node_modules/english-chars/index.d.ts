/**
 * Characters in the english language.
 * @example
 * ```
 * const englishChars = require("english-chars");
 *
 * englishChars.uppercase
 * //=> 'ABCDE...'
 *
 * englishChars.lowercase
 * //=> 'abcdef...'
 * ```
*/
declare const englishChars: {
    /**
     * Uppercase alphabet letters.
    */
    uppercase: string,

    /**
    * Lowercase alphabet letters.
    */
    lowercase: string,

    /**
    * Uppercase and lowercase alphabet letters.
    */
    letters: string,

    /**
     * Digits from 0 to 9.
    */
    digits: string

    /**
     * All the characters.
    */
    all: string
}

export = englishChars;
