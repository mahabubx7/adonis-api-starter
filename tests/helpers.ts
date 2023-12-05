/*
|-------------------------------------------------------
| @helpers for the tests
|-------------------------------------------------------
*/

import { FakeMailManagerContract } from '@ioc:Adonis/Addons/Mail'
import Api from '@japa/runner'

/**
 * Extract the OTP from the (fake) mailer
 * @param mailer FakeMailManagerContract
 * @returns otp string
 */
export const extractOtp = function (mailer: FakeMailManagerContract) {
  let otp: any = null

  mailer.find((mail) => {
    otp = mail.html?.match(/\d{6}/)![0] // <--- this is the OTP 6 digits (as default)
    return true
  })

  return otp
}

/**
 * Extract the token from the given payload
 * @param payload any
 * @returns token string
 */
export const extractToken = function (payload: any) {
  // payload should be the response from the login
  const t = payload.token.token
  return String(t)
}
