void automation.createCustomerContactInEconomic(String contactId)
{
    /*
     * Creates a customer contact in E-conomic based on the contact details from Zoho CRM.
     *
     * @param contactId The ID of the contact record in Zoho CRM.
     */
    try {
        // Retrieve API tokens and set up HTTP headers
        headersMap = standalone.setUpApiHeaders();
        if (headersMap == "") {
            // Tokens not found - exit the function to prevent further errors
            info "Failed to find tokens.";
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

        // Fetch existing customer contacts from E-conomic and check HTTP status code
        apiUrlCustomerContacts = "https://restapi.e-conomic.com/customers/" + customerNumber + "/contacts?pagesize=1000";
        customerContactsResponse = standalone.makeApiRequest(apiUrlCustomerContacts, "GET", headersMap, "");
        info customerContactsResponse;
        // Check the HTTP status code
        httpStatusCodeContacts = customerContactsResponse.get("httpStatusCode");
        if (standalone.handleHttpStatusCode(httpStatusCodeContacts, "Fetching existing customer contacts", customerContactsResponse) == "false") {
            // If handling the status code returns false, exit the function
            info "Handle HTTP status code returned false.";
            return;
        }

        // Check if contact already exists in E-conomic
        contactExists = standalone.checkIfContactExists(contactDetails, customerContactsResponse, customerNumber);
        if (contactExists == "true") {
            // Exit to prevent duplicate creation
            info "Contact already exists.";
            return;
        }

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
        info "Prepared Contact Data: " + contactData.toString();

        // Create the contact in E-conomic
        apiUrlCreateContact = "https://restapi.e-conomic.com/customers/" + customerNumber + "/contacts";
        createContactResponse = standalone.makeApiRequest(apiUrlCreateContact, "POST", headersMap, contactData);
        // Check the HTTP status code
        httpStatusCodeCreate = createContactResponse.get("httpStatusCode");
        if (standalone.handleHttpStatusCode(httpStatusCodeCreate, "Creating contact in E-conomic", createContactResponse) == "false") {
            // If handling the status code returns false, exit the function
            info "Handle HTTP status code returned false.";
            return;
        }

        // Update "Customer Contact Number" in Zoho CRM if it's empty
        // Extract the customerContactNumber from the E-conomic response
        customerContactNumber = createContactResponse.get("customerContactNumber");
        // Check if customerContactNumber is present
        if (customerContactNumber == null || customerContactNumber.toString().trim() == "") {
            info "Customer Contact Number not found in E-conomic. Cannot update the field in Zoho CRM.";
            return;
        }
        else {
            // Update the "Customer Contact Number" in Zoho CRM
            update = standalone.updateCustomerContactNumberIfEmpty(contactId, contactDetails, createContactResponse);
        }
    }
    catch (e) {
        info "Error in createCustomerContactInEconomic: " + e.toString();
    }
}
