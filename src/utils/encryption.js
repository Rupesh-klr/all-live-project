import CryptoJS from 'crypto-js'

const KEY = import.meta.env.VITE_ENCRY_MIDDLE_KEY

const PREFIX = 'ENCRY_MIDDLE_PROTECTION:'

/**
 * Encrypts a sensitive value with AES and prepends the prefix.
 * Backend encryption.middleware.js strips the prefix and decrypts before the controller runs.
 */
export function encryptField(plaintext) {
  if (!KEY) {
    console.warn('[encryption] VITE_ENCRY_MIDDLE_KEY not set — sending raw value')
    return plaintext
  }
  return PREFIX + CryptoJS.AES.encrypt(String(plaintext), KEY).toString()
}

/** Wraps a form's password field before submitting to the API */
export function encryptPassword(password) {
  return encryptField(password)
}
