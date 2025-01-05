void automation.updateCustomerContactInEconomic(String contactId)
{
    /*
     * Updates a customer contact in E-conomic based on the contact details from Zoho CRM.
     *
     * @param contactId The ID of the contact record in Zoho CRM.
     */
    try {
        // Retrieve API tokens and set up HTTP headers
        headersMap = standalone.setUpApiHeaders();
        if (headersMap == "") {
            // Tokens not found; exit the function to prevent further errors
            info "API headers not set up.";
            return;
        }

        // Fetch contact and account details
        detailsMap = standalone.getContactAndAccountDetails(contactId);
        if (detailsMap == null) {
            // Required details not found; exit the function
            info "Contact and account details not found.";
            return;
        }
        contactDetails = detailsMap.get("contactDetails");
        accountDetails = detailsMap.get("accountDetails");
        customerNumber = detailsMap.get("customerNumber");

        // Validate account type
        accountType = accountDetails.get("Account_Type");
        if (accountType != "Customer") {
            info "Account is not of type 'Customer'.";
            return;
        }

        // Check if "Customer Contact Number" exists
        // Retrieve the current "Customer Contact Number" from Zoho CRM
        zohoCustomerContactNumber = standalone.getFieldValueWithDefault(contactDetails, "Customer_Contact_Number", "").trim();
        if (zohoCustomerContactNumber != "") {
            info "'Customer contact number' exists. Proceeding to update contact in E-conomic.";
            // Define field mappings
            // "sourceField" is from Zoho CRM, "targetField" is for E-conomic
            fieldMappings = List();
            fieldMappings.add({ "sourceField": "Full_Name", "targetField": "name" });
            fieldMappings.add({ "sourceField": "Phone", "targetField": "phone" });
            fieldMappings.add({ "sourceField": "Email", "targetField": "email" });
            fieldMappings.add({ "sourceField": "Description", "targetField": "notes" });

            // Initialize and populate contact data
            contactData = Map();
            for each mapping in fieldMappings
            {
                    sourceValue = standalone.getFieldValueWithDefault(contactDetails, mapping.get("sourceField"), "");
                    contactData.put(mapping.get("targetField"), sourceValue);
                }
            contactData.put("customer", { "customerNumber": customerNumber.toNumber() });
            contactData.put("customerContactNumber", zohoCustomerContactNumber.toNumber());
            info "Prepared Contact Data for Update: " + contactData.toString();

            // Update the contact in E-conomic
            apiUrlUpdateContact = "https://restapi.e-conomic.com/customers/" + customerNumber + "/contacts/" + zohoCustomerContactNumber;
            updateContactResponse = standalone.makeApiRequest(apiUrlUpdateContact, "PUT", headersMap, contactData);
            // Check the HTTP status code for the update 
            httpStatusCodeUpdate = updateContactResponse.get("httpStatusCode");
            if (standalone.handleHttpStatusCode(httpStatusCodeUpdate, "Updating contact in E-conomic", updateContactResponse) == "false") {
                // If handling the status code returns false, exit the function
                info "Failed to update contact in E-conomic.";
                return;
            }
            info "Successfully updated customer contact in E-conomic for customer number: " + customerNumber;
        }
        else {
            // "Customer Contact Number" is empty. Perform duplication check
            info "'Customer Contact Number' is empty. Performing duplication check.";
            // Fetch existing customer contacts from E-conomic and check HTTP status code
            apiUrlCustomerContacts = "https://restapi.e-conomic.com/customers/" + customerNumber + "/contacts?pagesize=1000";
            customerContactsResponse = standalone.makeApiRequest(apiUrlCustomerContacts, "GET", headersMap, "");
            info "Customer Contacts Response: " + customerContactsResponse.toString();
            // Check the HTTP status code
            httpStatusCodeContacts = customerContactsResponse.get("httpStatusCode");
            if (standalone.handleHttpStatusCode(httpStatusCodeContacts, "Fetching existing customer contacts", customerContactsResponse) == "false") {
                // If handling the status code returns false, exit the function
                info "Failed to fetch existing customer contacts.";
                return;
            }
            // Check if contact already exists in E-conomic
            contactExists = standalone.checkIfContactExists(contactDetails, customerContactsResponse, customerNumber);
            if (contactExists == "true") {
                // Contact exists; retrieve the Customer Contact Number
                economicCustomerContactNumber = standalone.getExistingCustomerContactNumber(contactDetails, customerContactsResponse, customerNumber);
                if (economicCustomerContactNumber != "") {
                    info "Found existing contact in E-conomic with Customer Contact Number: " + economicCustomerContactNumber;
                    // Define field mappings
                    fieldMappings = List();
                    fieldMappings.add({ "sourceField": "Full_Name", "targetField": "name" });
                    fieldMappings.add({ "sourceField": "Phone", "targetField": "phone" });
                    fieldMappings.add({ "sourceField": "Email", "targetField": "email" });
                    fieldMappings.add({ "sourceField": "Description", "targetField": "notes" });

                    // Initialize and populate contact data
                    contactData = Map();
                    for each mapping in fieldMappings
                    {
                            sourceValue = standalone.getFieldValueWithDefault(contactDetails, mapping.get("sourceField"), "");
                            contactData.put(mapping.get("targetField"), sourceValue);
                        }
                    contactData.put("customer", { "customerNumber": customerNumber.toNumber() });
                    contactData.put("customerContactNumber", economicCustomerContactNumber.toNumber());
                    info "Prepared Contact Data for Update: " + contactData.toString();

                    // Update the contact in E-conomic
                    apiUrlUpdateContact = "https://restapi.e-conomic.com/customers/" + customerNumber + "/contacts/" + economicCustomerContactNumber;
                    updateContactResponse = standalone.makeApiRequest(apiUrlUpdateContact, "PUT", headersMap, contactData);
                    // Check the HTTP status code for the update
                    httpStatusCodeUpdate = updateContactResponse.get("httpStatusCode");
                    if (standalone.handleHttpStatusCode(httpStatusCodeUpdate, "Updating contact in E-conomic", updateContactResponse) == "false") {
                        // If handling the status code returns false, exit the function
                        info "Failed to update contact in E-conomic.";
                        return;
                    }
                    info "Successfully updated existing customer contact in E-conomic for customer number: " + customerNumber;

                    // Update "Customer Contact Number" in Zoho CRM if it's empty
                    // Check if customerContactNumber is present
                    if (economicCustomerContactNumber == null || economicCustomerContactNumber.toString().trim() == "") {
                        info "Customer Contact Number not found in E-conomic.";
                        return;
                    }
                    else {
                        // Update the "Customer Contact Number" in Zoho CRM
                        update = standalone.updateCustomerContactNumberIfEmpty(contactId, contactDetails, updateContactResponse);
                    }
                }
                else {
                    info "Customer Contact Number could not be retrieved. Cannot update.";
                    return;
                }
            }
            else {
                info "No existing contact found in E-conomic. Proceeding to create the contact.";
                // Create the contact in E-conomic since it does not exist already in E-conomic
                automation.createCustomerContactInEconomic(contactId);
                info "Customer contact created in E-conomic for the account with customer number: " + customerNumber;
                return;
            }
        }
    }
    catch (e) {
        info "Error in updateCustomerContactInEconomic: " + e.toString();
    }
}
