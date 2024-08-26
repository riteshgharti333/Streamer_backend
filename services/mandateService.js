import { mollieClient } from "../config/mollieConfig.js"; // Import the Mollie client

export const createMandate = async (customerId, paymentMethod) => {
  try {
    const mandate = await mollieClient.customers.createMandate(customerId, {
      method: paymentMethod,
      mandateReference: `Mandate for customer ${customerId}`,
    });

    return mandate;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const checkCustomerMandates = async (customerId) => {
  try {
    const mandates = await mollieClient.customers.getMandates(customerId);
    return mandates;
  } catch (error) {
    throw new Error(error.message);
  }
};
