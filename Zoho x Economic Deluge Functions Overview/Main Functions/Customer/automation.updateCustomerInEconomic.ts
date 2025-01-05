void automation.updateCustomerInEconomic(String accountId)
{
    /*
     * Updates a customer in E-conomic based on the account details from Zoho CRM.
     *
     * @param accountId The ID of the account record in Zoho CRM.
     */
    try {
        // Retrieve E-conomic API tokens and set up HTTP headers
        headersMap = standalone.setUpApiHeaders();
        if (headersMap == "") {
            // Tokens not found; exit the function to prevent further errors
            info "Failed to retrieve API tokens.";
            return;
        }

        // Fetch account information
        accountDetails = zoho.crm.getRecordById("Accounts", accountId);
        if (accountDetails == null) {
            info "Account record not found.";
            return;
        }

        // Validate account type
        accountType = accountDetails.get("Account_Type");
        if (accountType != "Customer") {
            info "Account is not of type 'Customer'.";
            return;
        }

        // Check if the account has a Customer_Number
        customerNumber = standalone.getFieldValueWithDefault(accountDetails, "Customer_Number", "").toString();
        if (customerNumber != "") {
            info "Existing Customer Number found: " + customerNumber;
            // Verify if the customer number exists in E-conomic
            customerExists = standalone.verifyCustomerExists(customerNumber, headersMap);
            if (customerExists == "true") {
                info "Customer with customer number " + customerNumber + " exists in E-conomic. Proceeding to update.";
                // Define field mappings
                fieldMappings = List();
                fieldMappings.add({ "sourceField": "Company_Registration_Number", "targetField": "corporateIdentificationNumber" });
                fieldMappings.add({ "sourceField": "Account_Name", "targetField": "name" });
                fieldMappings.add({ "sourceField": "Billing_Street", "targetField": "address" });
                fieldMappings.add({ "sourceField": "Billing_Code", "targetField": "zip" });
                fieldMappings.add({ "sourceField": "Billing_City", "targetField": "city" });
                fieldMappings.add({ "sourceField": "Billing_Country", "targetField": "country" });
                fieldMappings.add({ "sourceField": "Phone", "targetField": "telephoneAndFaxNumber" });
                fieldMappings.add({ "sourceField": "Email", "targetField": "email" });
                fieldMappings.add({ "sourceField": "Website", "targetField": "website" });
                fieldMappings.add({ "sourceField": "Currency_Type", "targetField": "currency" });

                // Initialize customerData and populate fields
                customerData = Map();
                for each mapping in fieldMappings
                {
                        sourceValue = standalone.getFieldValueWithDefault(accountDetails, mapping.get("sourceField"), "");
                        customerData.put(mapping.get("targetField"), sourceValue);
                    }
                info "Customer data map before adding the complex fields: " + customerData.toString();

                // Fetch customer group number from E-conomic
                customerGroupName = standalone.getFieldValueWithDefault(accountDetails, "Customer_Group", "");
                economicCustomerGroupNumber = 0;
                if (customerGroupName != "") {
                    economicCustomerGroupNumber = standalone.fetchCustomerGroupNumber(customerGroupName, headersMap).toNumber();
                    info "Found customer group number: " + economicCustomerGroupNumber;
                }

                // Fetch paymentTermsNumber
                paymentTermsName = standalone.getFieldValueWithDefault(accountDetails, "Payment_Terms", "");
                paymentTermsNumber = 0;
                if (paymentTermsName != "") {
                    paymentTermsNumber = standalone.fetchPaymentTermsNumber(paymentTermsName, headersMap).toNumber();
                    info "Found payment term number: " + paymentTermsNumber;
                }

                // Fetch vatZoneNumber
                vatZoneName = standalone.getFieldValueWithDefault(accountDetails, "VAT_Zone", "");
                vatZoneNumber = 0;
                if (vatZoneName != "") {
                    vatZoneNumber = standalone.fetchVatZoneNumber(vatZoneName, headersMap).toNumber();
                    info "Found VAT zone number: " + vatZoneNumber;
                }

                // Assign Complex Fields
                customerData.put("customerGroup", { "customerGroupNumber": economicCustomerGroupNumber });
                customerData.put("paymentTerms", { "paymentTermsNumber": paymentTermsNumber });
                customerData.put("vatZone", { "vatZoneNumber": vatZoneNumber });

                // Update the Customer in E-conomic
                apiUrlCustomer = "https://restapi.e-conomic.com/customers/" + customerNumber;
                updateCustomerResponse = standalone.makeApiRequest(apiUrlCustomer, "PUT", headersMap, customerData);
                info updateCustomerResponse;
                // Check the HTTP status code
                httpStatusCodeUpdate = updateCustomerResponse.get("httpStatusCode");
                if (standalone.handleHttpStatusCode(httpStatusCodeUpdate, "Updating customer in E-conomic", updateCustomerResponse) == "false") {
                    // If handling the status code returns false, exit the function
                    info "PUT request failed.";
                    return;
                }
                info "Successfully updated customer in E-conomic for customer number: " + customerNumber;

                // Synchronize existing contacts
                automation.createCustomerContactsFromRelatedList(accountId);
            }
            else {
                // Customer does not exist in E-conomic
                info "Customer number " + customerNumber + " does not exist in E-conomic. Creating customer in E-conomic.";
                // Invoke the createCustomerInEconomic function
                automation.createCustomerInEconomic(accountId);
                info "Customer created in E-conomic.";
                return;
            }
        }
        else {
            // No customer number found in Zoho CRM
            info "No existing Customer Number found in Zoho CRM for Account ID: " + accountId + ". Creating customer in E-conomic.";
            // Invoke the createCustomerInEconomic function
            automation.createCustomerInEconomic(accountId);
            info "Customer created in E-conomic.";
            return;
        }
    }
    catch (e) {
        info "Error in updateCustomerInEconomic: " + e.toString();
    }
}
