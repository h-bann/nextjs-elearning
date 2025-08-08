import test from 'node:test';
import assert from 'node:assert/strict';

const validationModule = import('./validation.js');

test('invalid email formats', async () => {
  const { infoSubmissionSchema, formValidation } = await validationModule;
  const data = {
    email: 'invalid-email',
    username: 'user',
    verificationCode: '123456',
    termsAccepted: 'on',
  };
  const result = formValidation(data, infoSubmissionSchema);
  assert.ok(result.error);
  assert.equal(result.error.email, 'Enter a valid email');
});

test('missing username and verification code fields', async () => {
  const { infoSubmissionSchema, formValidation } = await validationModule;
  const data = {
    email: 'test@example.com',
    termsAccepted: 'on',
  };
  const result = formValidation(data, infoSubmissionSchema);
  assert.ok(result.error);
  assert.equal(result.error.username, 'username is required');
  assert.equal(result.error.verificationCode, 'verificationCode is required');
});

test('successful validation with all required fields', async () => {
  const { infoSubmissionSchema, formValidation } = await validationModule;
  const data = {
    email: 'test@example.com',
    username: 'user',
    verificationCode: '123456',
    termsAccepted: 'on',
  };
  const result = formValidation(data, infoSubmissionSchema);
  assert.deepEqual(result, { success: 'User input validation successful' });
});
