/*global describe, it, expect*/
'use strict';

import Formatic from '@/src/formatic';

describe('types and value changes', function() {
  const config = Formatic.createConfig();

  it('should validate a form with no required value', function() {
    const fields = [
      {
        type: 'string',
        key: 'greeting',
      },
    ];

    const isValid = config.isValidRootValue({
      fields,
    });

    expect(isValid).toEqual(true);
  });

  it('should invalidate a form with required value', function() {
    const fields = [
      {
        type: 'string',
        key: 'greeting',
        required: true,
      },
    ];

    const isValid = config.isValidRootValue({
      fields,
    });

    expect(isValid).toEqual(false);
  });

  it('should validate a form with a required/default value', function() {
    const fields = [
      {
        type: 'string',
        key: 'greeting',
        default: 'hello',
        required: true,
      },
    ];

    const isValid = config.isValidRootValue({
      fields,
    });

    expect(isValid).toEqual(true);
  });
});
