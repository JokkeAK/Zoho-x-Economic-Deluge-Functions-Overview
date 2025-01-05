string button.sendLatestQuotePdfByEmail(String quoteId, String quoteEmailTemplateId, String licenseId)
{
    /*
     * Sends the latest quote PDF from the Visiana Quotes record via email.
     * Fetches the business conditions using a helper function.
     * Sends the quote and business conditions to the quote owner's email using an email template.
     *
     * @param quoteId The ID of the quote record in Zoho CRM.
     * @param quoteEmailTemplateId The ID of the email template to use.
     * @param licenseId The ID of the license record in Zoho CRM.
     * @return A string indicating the success or failure of the email sending process.
    */
    try {
        // Fetch quote details
        quoteDetails = zoho.crm.getRecordById("Visiana_Quotes", quoteId);
        if (quoteDetails == null) {
            return "Error: Quote record not found.";
        }
        // Check if the quote has already been sent
        quoteStage = quoteDetails.get("Quote_Stage");
        if (quoteStage == "Sent") {
            return "Error: The quote has already been sent. To send it again, mark it as 'Draft' in 'Quote Stage'.";
        }
        // Fetch the latest attachment file ID using the helper function
        latestAttachmentId = standalone.getLatestAttachmentFileId("Visiana_Quotes", quoteId);
        if (latestAttachmentId.contains("Error")) {
            return latestAttachmentId;
        }
        // Get the Business Conditions file ID using the helper function
        businessConditionsFileId = standalone.getBusinessConditionsFileId();
        // Validate the Business Conditions file ID
        if (businessConditionsFileId.contains("Error")) {
            return businessConditionsFileId;
        }
        // Prepare the attachments map
        attachmentList = List();
        attachmentList.add(latestAttachmentId);
        attachmentList.add(businessConditionsFileId);
        attachmentsMap = Map();
        attachmentsMap.put("attachments", attachmentList);
        // Call the helper function to send the email and update records
        sendEmailResponse = standalone.sendEmailAndUpdateRecords(
            "Visiana_Quotes",
            quoteId,
            quoteEmailTemplateId,
            attachmentsMap,
            "Quote_Stage",
            "Sent",
            licenseId,
            "Quote Sent",
            "registerQuoteAsSentInEconomicStandalone"
        );
        if (sendEmailResponse.contains("Error")) {
            return "Error in sending email: " + sendEmailResponse;
        }
        else {
            return "Email sent successfully.";
        }
    }
    catch (e) {
        info "Error in sendLatestQuotePdfByEmail: " + e.toString();
        return "Error: An unexpected error occurred while sending the quote email.";
    }
}
