"use strict"

const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
const lowercase = uppercase.toLowerCase()
const letters = uppercase + lowercase
const digits = "0123456789"

module.exports = {
    uppercase,
    lowercase,
    letters,
    digits,
    all: letters + digits,
}
