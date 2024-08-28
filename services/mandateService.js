// mandateService.js
import { createMollieClient } from '@mollie/api-client';

const mollieClient = createMollieClient({ apiKey: 'test_HwFHQ4HSvhTAF7PMp2FpyJKfjwsJpH' });

export const createMandate = async (customerId) => {
  try {
    const mandate = await mollieClient.customerMandates.create({
      customerId: customerId,
      method: 'directdebit', // Use 'paypal' for PayPal mandates
      consumerName: 'Ritesh', // Replace with the actual consumer name
      consumerAccount: 'NL55INGB0000000000', // Replace with the actual IBAN for SEPA Direct Debit
      consumerBic: 'INGBNL2A', // Replace with the actual BIC
      signatureDate: '2024-08-27', // Use an appropriate date in YYYY-MM-DD format
      mandateReference: 'UNIQUE-REFERENCE' // Replace with a unique reference for the mandate
    });

    return mandate;
  } catch (error) {
    console.error('Error creating mandate:', error);
    throw error;
  }
};



export const enablePaymentMethod = async (methodId, profileId) => {
  try {
    const method = await mollieClient.methods.enable({
      id: methodId,
      profileId: profileId
    });

    return method;
  } catch (error) {
    console.log(error)
  }
};
