void automation.createCustomerContactsFromRelatedList(String accountId)
{
    /**
     * Synchronizes customer contacts from Zoho CRM to E-conomic based on the related contacts of an account.
     *
     * @param accountId The ID of the account record in Zoho CRM.
     */
    try {
        // Retrieve API tokens and set up HTTP headers
        headersMap = standalone.setUpApiHeaders();
        if (headersMap == "") {
            // Tokens not found; exit the function to prevent further errors
            info "Failed to retrieve API tokens.";
            return;
        }

        // Fetch related contacts (single page, 200 records)
        page = 1;
        per_page = 200;
        relatedContacts = zoho.crm.getRelatedRecords("Contacts", "Accounts", accountId, page, per_page, { "": "" });

        // Log the number of fetched contacts
        if (relatedContacts != null) {
            info "Fetched " + relatedContacts.size() + " related contacts.";
        }
        else {
            info "Fetched 0 related contacts.";
        }

        if (relatedContacts == null || relatedContacts.size() == 0) {
            info "No related contacts found to synchronize.";
            return;
        }

        // Iterate through each contact and process
        for each contact in relatedContacts
        {
                contactId = contact.get("id").toString();
                info "Processing Contact ID: " + contactId;

                // Fetch contact and account details
                detailsMap = standalone.getContactAndAccountDetails(contactId);
                if(detailsMap == null) {
                // Required details not found; skip to next contact
                info "Contact and account details not found for Contact ID: " + contactId + ". Skipping.";
            continue;
        }
        contactDetails = detailsMap.get("contactDetails");
        accountDetails = detailsMap.get("accountDetails");
        customerNumber = detailsMap.get("customerNumber");

        // Validate Account Type
        accountType = accountDetails.get("Account_Type");
        if (accountType != "Customer") {
                info "Account is not of type 'Customer' for Contact ID: " + contactId + ". Skipping.";
            continue;
        }

        // Validate Customer Number
        if (customerNumber == null || customerNumber.toString().trim() == "") {
                info "Customer Number is missing for Contact ID: " + contactId + ". Skipping.";
            continue;
        }

        // Check if "Customer Contact Number" exists
        zohoCustomerContactNumber = standalone.getFieldValueWithDefault(contactDetails, "Customer_Contact_Number", "").trim();
        if (zohoCustomerContactNumber != "") {
                // Update Existing Contact in E-conomic
                info "Updating existing customer contact in E-conomic for Contact ID: " + contactId;

            // Define field mappings
            fieldMappings = List();
            fieldMappings.add({ "sourceField": "Full_Name", "targetField": "name" });
            fieldMappings.add({ "sourceField": "Phone", "targetField": "phone" });
            fieldMappings.add({ "sourceField": "Email", "targetField": "email" });
            fieldMappings.add({ "sourceField": "Description", "targetField": "notes" });

            // Initialize contact data
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
            if (!standalone.handleHttpStatusCode(httpStatusCodeUpdate, "Updating contact in E-conomic", updateContactResponse)) {
                    // If handling the status code returns false, skip to next contact
                    info "Failed to update contact in E-conomic for Contact ID: " + contactId + ". Skipping.";
                continue;
            }
                info "Successfully updated customer contact in E-conomic for Contact ID: " + contactId;
        }
        else {
                // "Customer Contact Number" is Empty. Perform Duplication Check
                info "'Customer Contact Number' is empty for Contact ID: " + contactId + ". Performing duplication check.";

            // Fetch existing customer contacts from E-conomic
            apiUrlCustomerContacts = "https://restapi.e-conomic.com/customers/" + customerNumber + "/contacts?pagesize=1000";
            customerContactsResponse = standalone.makeApiRequest(apiUrlCustomerContacts, "GET", headersMap, "");

            // Check the HTTP status code
            httpStatusCodeContacts = customerContactsResponse.get("httpStatusCode");
            if (!standalone.handleHttpStatusCode(httpStatusCodeContacts, "Fetching existing customer contacts", customerContactsResponse)) {
                    // If handling the status code returns false, skip to next contact
                    info "Failed to fetch existing customer contacts for Contact ID: " + contactId + ". Skipping.";
                continue;
            }

            // Check if contact already exists in E-conomic
            contactExists = standalone.checkIfContactExists(contactDetails, customerContactsResponse, customerNumber);
            if (contactExists == "true") {
                // Contact exists; retrieve the Customer Contact Number
                economicCustomerContactNumber = standalone.getExistingCustomerContactNumber(contactDetails, customerContactsResponse, customerNumber);
                if (economicCustomerContactNumber != "") {
                        info "Found existing contact in E-conomic with Customer Contact Number: " + economicCustomerContactNumber + " for Contact ID: " + contactId;

                    // Define field mappings
                    fieldMappings = List();
                    fieldMappings.add({ "sourceField": "Full_Name", "targetField": "name" });
                    fieldMappings.add({ "sourceField": "Phone", "targetField": "phone" });
                    fieldMappings.add({ "sourceField": "Email", "targetField": "email" });
                    fieldMappings.add({ "sourceField": "Description", "targetField": "notes" });

                    // Initialize contact data
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
                    if (!standalone.handleHttpStatusCode(httpStatusCodeUpdate, "Updating contact in E-conomic", updateContactResponse)) {
                            // If handling the status code returns false, skip to next contact
                            info "Failed to update contact in E-conomic for Contact ID: " + contactId + ". Skipping.";
                        continue;
                    }
                        info "Successfully updated existing customer contact in E-conomic for Contact ID: " + contactId;

                    // Update "Customer Contact Number" in Zoho CRM if it's empty
                    if (economicCustomerContactNumber == null || economicCustomerContactNumber.toString().trim() == "") {
                            info "Customer Contact Number not found in E-conomic for Contact ID: " + contactId + ". Cannot update Zoho CRM.";
                        continue;
                    }
                    else {
                        // Update the "Customer Contact Number" in Zoho CRM
                        update = standalone.updateCustomerContactNumberIfEmpty(contactId, contactDetails, updateContactResponse);
                    }
                }
                else {
                        info "Customer Contact Number could not be retrieved for Contact ID: " + contactId + ". Cannot update.";
                    continue;
                }
            }
            else {
                    info "No existing contact found in E-conomic for Contact ID: " + contactId + ". Proceeding to create the contact.";

                // Create the Contact in E-conomic
                // Define field mappings
                fieldMappings = List();
                fieldMappings.add({ "sourceField": "Full_Name", "targetField": "name" });
                fieldMappings.add({ "sourceField": "Phone", "targetField": "phone" });
                fieldMappings.add({ "sourceField": "Email", "targetField": "email" });
                fieldMappings.add({ "sourceField": "Description", "targetField": "notes" });

                // Initialize contact data
                contactData = Map();
                for each mapping in fieldMappings
                    {
                        sourceValue = standalone.getFieldValueWithDefault(contactDetails, mapping.get("sourceField"), "");
                        contactData.put(mapping.get("targetField"), sourceValue);
                    }
                    contactData.put("customer", { "customerNumber": customerNumber.toNumber() });

                    info "Prepared Contact Data for Creation: " + contactData.toString();

                // Create the contact in E-conomic
                apiUrlCreateContact = "https://restapi.e-conomic.com/customers/" + customerNumber + "/contacts";
                createContactResponse = standalone.makeApiRequest(apiUrlCreateContact, "POST", headersMap, contactData);

                // Check the HTTP status code
                httpStatusCodeCreate = createContactResponse.get("httpStatusCode");
                if (!standalone.handleHttpStatusCode(httpStatusCodeCreate, "Creating contact in E-conomic", createContactResponse)) {
                        // If handling the status code returns false, skip to next contact
                        info "Failed to create contact in E-conomic for Contact ID: " + contactId + ". Skipping.";
                    continue;
                }

                // Extract the customerContactNumber from the E-conomic response
                customerContactNumber = createContactResponse.get("customerContactNumber");
                if (customerContactNumber == null || customerContactNumber.toString().trim() == "") {
                        info "Customer Contact Number not found in E-conomic for Contact ID: " + contactId + ". Cannot update Zoho CRM.";
                    continue;
                }
                else {
                    // Update the "Customer Contact Number" in Zoho CRM
                    update = standalone.updateCustomerContactNumberIfEmpty(contactId, contactDetails, createContactResponse);
                }
                    info "Successfully created customer contact in E-conomic for Contact ID: " + contactId;
            }
                info "Completed synchronization of related contacts to E-conomic.";
        }
    }
    }
    catch (e) {
        info "Error in createCustomerContactsFromRelatedList: " + e.toString();
}
}
