import test from 'ava'
import { Promise, promisify } from 'bluebird'
import { mockFunction, restoreFunction } from '../helpers'
import { normalizeHandler } from '../../../helpers/normalizer'
import * as boletoHandler from '../../../../src/resources/boleto'
import * as provider from '../../../../src/providers/bradesco'

test.before(async () => {
  mockFunction(provider, 'register', () => Promise.resolve({ status: 'unknown' }))
})

test.after(() => {
  restoreFunction(provider, 'register')
})

const create = normalizeHandler(boletoHandler.create)

const register = promisify(boletoHandler.register)

test('registers a boleto (provider pending)', async (t) => {
  const payload = {
    expiration_date: new Date(),
    amount: 2000,
    issuer: 'bradesco',
    instructions: 'Please do not accept after expiration_date',
    register: false,
    queue_url: 'http://yopa/queue/test'
  }

  const { body } = await create({
    body: payload
  })

  const boleto = await register({
    body: JSON.stringify({ boleto_id: body.id, sqsMessage: { ReceiptHandle: 'abc' } })
  }, {})

  t.is(boleto.status, 'pending_registration')
})
