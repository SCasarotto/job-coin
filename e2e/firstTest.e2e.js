const { expect } = require('detox');

describe('Example', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
    });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should be able to login in, see balance transfer bob some jobcoin, see balance decrease approprately and sign out ', async () => {
    await expect(element(by.id('login-screen'))).toExist();
    await element(by.id('address-input')).tap();
    await expect(element(by.id('error-text'))).not.toBeVisible();

    // Test no address is provided
    await element(by.id('login-button')).tap();
    await expect(element(by.id('error-text'))).toBeVisible();

    // Test invalid address case
    await element(by.id('address-input')).typeText('test');
    await element(by.id('login-button')).tap();
    await expect(element(by.id('error-text'))).toBeVisible();

    // Test valid address case
    await element(by.id('address-input')).clearText();
    await element(by.id('address-input')).typeText('Stuart');
    await element(by.id('login-button')).tap();
    await expect(element(by.id('home-screen'))).toExist();

    // Test balance transfer
    const balanceAttributes = await element(
      by.id('balance-text'),
    ).getAttributes();
    const initialBalance = parseFloat(balanceAttributes.text);
    const transferAmount = 1;

    await element(by.id('send-button')).tap();
    await expect(element(by.id('send-modal'))).toBeVisible();

    // Test no address is provided
    await element(by.id('send-confirm-button')).tap();
    await expect(element(by.id('send-address-error'))).toBeVisible();

    // Test invalid address case
    await element(by.id('send-address-input')).clearText();
    await element(by.id('send-address-input')).typeText('test');
    await element(by.id('send-amount-input')).typeText('1');
    await element(by.id('send-confirm-button')).tap();
    await expect(element(by.id('send-address-error'))).toBeVisible();

    // Test trying to send to yourself
    await element(by.id('send-address-input')).clearText();
    await element(by.id('send-address-input')).typeText('Stuart');
    await element(by.id('send-amount-input')).clearText();
    await element(by.id('send-amount-input')).typeText('1');
    await element(by.id('send-confirm-button')).tap();
    await expect(element(by.id('send-address-error'))).toBeVisible();

    // Test invalid amount case
    await element(by.id('send-address-input')).clearText();
    await element(by.id('send-address-input')).typeText('Bob');
    await element(by.id('send-amount-input')).clearText();
    await element(by.id('send-amount-input')).typeText('-1');
    await element(by.id('send-confirm-button')).tap();
    await expect(element(by.id('send-amount-error'))).toBeVisible();

    // Test amount larger than balance
    await element(by.id('send-amount-input')).clearText();
    await element(by.id('send-amount-input')).typeText(
      (initialBalance + 1).toString(),
    );
    await element(by.id('send-confirm-button')).tap();
    await expect(element(by.id('send-amount-error'))).toBeVisible();

    // Test valid amount case
    await element(by.id('send-address-input')).clearText();
    await element(by.id('send-address-input')).typeText('Bob');
    await element(by.id('send-amount-input')).clearText();
    await element(by.id('send-amount-input')).typeText(
      transferAmount.toString(),
    );
    await element(by.id('send-confirm-button')).tap();
    await expect(element(by.id('send-modal'))).not.toBeVisible();
    await expect(element(by.id('balance-text'))).toHaveText(
      (initialBalance - transferAmount).toString(),
    );

    // Sign Out
    await element(by.id('sign-out-button')).tap();
    await expect(element(by.id('login-screen'))).toExist();

    // The following is just going into Bob's account and sending the same amount back to Stuart
    await element(by.id('address-input')).tap();
    await element(by.id('address-input')).typeText('Bob');
    await element(by.id('login-button')).tap();
    await expect(element(by.id('home-screen'))).toExist();
    await element(by.id('send-button')).tap();
    await expect(element(by.id('send-modal'))).toBeVisible();

    await element(by.id('send-address-input')).tap();
    await element(by.id('send-address-input')).typeText('Stuart');
    await element(by.id('send-amount-input')).tap();
    await element(by.id('send-amount-input')).typeText(
      transferAmount.toString(),
    );
    await element(by.id('send-confirm-button')).tap();
    await expect(element(by.id('send-modal'))).not.toBeVisible();

    await element(by.id('sign-out-button')).tap();
    await expect(element(by.id('login-screen'))).toExist();
  });
});
