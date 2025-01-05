string standalone.getExistingCustomerContactNumber(Map contactDetails, Map customerContactsResponse, String customerNumber)
{
    /*
         * Retrieves the existing customer contact number from E-conomic based on contact details.
         *
         * @param contactDetails A map containing the contact's details from Zoho CRM (e.g., Full_Name, Email).
         * @param customerContactsResponse A map containing the response from E-conomic's customer contacts API.
         * @param customerNumber The customer number in E-conomic.
         * @return A string representing the customer contact number if found; otherwise, an empty string.
         */
    try {
        // Extract Full_Name and Email from Zoho CRM
        zohoContactName = standalone.getFieldValueWithDefault(contactDetails, "Full_Name", "").trim();
        zohoContactEmail = standalone.getFieldValueWithDefault(contactDetails, "Email", "").trim();

        if (zohoContactName == "" || zohoContactEmail == "") {
        info "Contact name or email is missing. Cannot retrieve Customer Contact Number.";
            return "";
        }

        if (customerContactsResponse.get("collection") != null && !customerContactsResponse.get("collection").isEmpty()) {
            customerContactsList = customerContactsResponse.get("collection");
            for each economicContact in customerContactsList
        {
                    eEconomicContactName = economicContact.get("name");
                    eEconomicContactEmail = economicContact.get("email");
                    eEconomicContactNumber = economicContact.get("customerContactNumber");
                    if(eEconomicContactName != null && eEconomicContactEmail != null && eEconomicContactNumber != null) {
                if (zohoContactName.toLowerCase() == eEconomicContactName.toLowerCase() && zohoContactEmail.toLowerCase() == eEconomicContactEmail.toLowerCase()) {
                    return eEconomicContactNumber.toString();
                }
            }
        }
    }
}
catch (e) {
	info "Error in getExistingCustomerContactNumber: " + e.toString();
    return "";
}
return "";
}