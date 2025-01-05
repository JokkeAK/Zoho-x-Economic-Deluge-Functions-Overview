string standalone.sendEmailAndUpdateRecords(String moduleName, String recordId, String emailTemplateId, Map attachmentsMap, String stageField, String stageValue, String licenseId, String licenseStatus, String economicFunctionName)
{
    /*
     * Sends an email with attachments and updates related records accordingly.
     *
     * @param moduleName The CRM module name ("Visiana_Quotes" or "Visiana_Invoices").
     * @param recordId The ID of the record (Quote or Invoice).
     * @param emailTemplateId The ID of the email template to use.
     * @param attachmentsMap A Map containing attachment file IDs with key "attachments".
     * @param stageField The field name to update (e.g., "Quote_Stage" or "Invoice_Stage").
     * @param stageValue The value to set for the stage field (e.g., "Sent" or "Booked").
     * @param licenseId The ID of the related license record.
     * @param licenseStatus The status to set for the license (e.g., "Quote Sent" or "Invoice Sent").
     * @param economicFunctionName The name of the function to call for E-conomic registration (e.g., "registerQuoteAsSentInEconomicStandalone").
     * @return A string indicating the success or failure of the email sending process.
     */
    try {
        // Fetch record details
        recordDetails = zoho.crm.getRecordById(moduleName, recordId);
        if (recordDetails == null) {
            return "Error: Record not found in " + moduleName + ".";
        }

        // Fetch owner details
        ownerDetails = recordDetails.get("Owner");
        if (ownerDetails == null) {
            return "Error: Owner information is missing.";
        }
        ownerEmail = ownerDetails.get("email");
        if (ownerEmail == null || ownerEmail == "") {
            return "Error: Owner email is missing.";
        }

        // Prepare email settings
        dataMap = Map();
        dataList = List();
        // Sender Email
        dataMap.put("from", { "email": ownerEmail });
        // Receiver Email
        toList = List();
        toList.add({ "email": ownerEmail });
        dataMap.put("to", toList);
        // Email Template
        dataMap.put("template", { "id": emailTemplateId });
        // Attachments
        attachmentList = List();
        attachmentsList = attachmentsMap.get("attachments");
        if (attachmentsList != null && attachmentsList.size() > 0) {
            for each fileId in attachmentsList
            {
                    attachmentList.add({ "id": fileId });
                }
            dataMap.put("attachments", attachmentList);
        }
        else {
            info "No attachments to include in the email.";
        }
        // Use SMTP server instead of Zoho's CRM server
        dataMap.put("org_email", false);
        dataList.add(dataMap);
        paramMap = Map();
        paramMap.put("data", dataList);

        // Update the stage field
        updateMap = Map();
        updateMap.put(stageField, stageValue);
        updateResponse = zoho.crm.updateRecord(moduleName, recordId, updateMap);
        if (updateResponse.get("id") == null) {
            return "Error: Email not sent. Couldn't update the " + stageField + ": " + updateResponse.toString();
        }

        // Update the license status
        updateLicenseMap = Map();
        updateLicenseMap.put("Status", licenseStatus);
        updateResponseLicense = zoho.crm.updateRecord("Licenses", licenseId, updateLicenseMap);
        if (updateResponseLicense.get("id") == null) {
            return "Error: Email not sent. Couldn't update the license status: " + updateResponseLicense.toString();
        }

        // Register with E-conomic
        if (moduleName == "Visiana_Quotes" && economicFunctionName == "registerQuoteAsSentInEconomicStandalone") {
            economicResponse = standalone.registerQuoteAsSentInEconomicStandalone(recordId);
            if (economicResponse.contains("Error")) {
                return "Error: Email not sent. An error occurred while registering with E-conomic: " + economicResponse;
            }
        }

        // Send the email via API
        sendEmailResponse = invokeurl
        [
            url : "https://www.zohoapis.eu/crm/v3/" + moduleName + "/" + recordId + "/actions/send_mail"
        type: POST
        parameters: paramMap.toString()
        connection: "email_connection"
        ];
        info sendEmailResponse;

        if (sendEmailResponse.get("status") == "error") {
            return "Error: Email not sent; error during the API POST request: " + sendEmailResponse.get("message");
        }
        else {
            if (moduleName == "Visiana_Quotes") {
                return "The quote and business conditions have been sent to the quote owner's email: " + ownerEmail + ".";
            }
            else if (moduleName == "Visiana_Invoices") {
                return "The invoice and business conditions have been sent to the invoice owner's email: " + ownerEmail + ".";
            }
        }
    }
    catch (e) {
        info "Error occurred: " + e.toString();
        return "Error: An error occurred while creating the PDF and sending the email.";
    }
    return "Error: An unexpected error occurred.";
}
