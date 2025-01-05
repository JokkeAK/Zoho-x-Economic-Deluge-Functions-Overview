string button.processInvoice(String invoiceId, String invoiceEmailTemplateId, String invoiceZohoWriterTemplateId, String licenseId, String accountId)
{
    /*
     * Books the invoice in E-conomic, creates the PDF in Zoho CRM, and sends the invoice along with business conditions to the invoice owner's email.
     *
     * @param invoiceId The ID of the invoice record.
     * @param invoiceEmailTemplateId The ID of the email template used for sending the invoice.
     * @param invoiceZohoWriterTemplateId The ID of the Zoho Writer template used for PDF creation.
     * @param licenseId The ID of the associated license record.
     * @param accountId The ID of the associated account record.
     * @return A string indicating the success or failure of the PDF creation and email sending process.
    */

    // Fetch invoice details 
    invoiceDetails = zoho.crm.getRecordById("Visiana_Invoices", invoiceId);
    // Verify that the invoice has not already been booked
    invoiceStage = invoiceDetails.get("Invoice_Stage");
    if (invoiceStage == "Booked") {
        return "Error: The invoice has already been booked. It cannot be booked again.";
    }
    // Register the invoice in E-conomic as "Booked"
    economicResponse = standalone.registerInvoiceAsBookedInEconomic(invoiceId);
    // Ensure that the response from E-conomic for sending a invoice does not contain an error
    if (economicResponse.contains("Error")) {
        return "Email not sent. An error occurred while trying to register the invoice in E-conomic as 'Booked'. " + economicResponse;
    }
    // Create the PDF document
    mergeResponse = standalone.mergeDocument(invoiceZohoWriterTemplateId, invoiceId, licenseId, accountId, "Visiana_Invoices", "Extra_Quoted_Items_Inv", "Invoice");
    // Ensure that the PDF has been created without error
    if (mergeResponse.contains("Error")) {
        return mergeResponse;
    }
    // Fetch the latest attachment file ID using the helper function
    latestAttachmentId = standalone.getLatestAttachmentFileId("Visiana_Invoices", invoiceId);
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
    sendEmailResponse = standalone.sendEmailAndUpdateRecords("Visiana_Invoices", invoiceId, invoiceEmailTemplateId, attachmentsMap, "Invoice_Stage", "Booked", licenseId, "Invoice Sent", "");
    if (sendEmailResponse.contains("Error")) {
        return "Error in sending email: " + sendEmailResponse;
    }
    else {
        return "The invoice has been booked in E-conomic. A PDF has been created for the invoice. " + sendEmailResponse;
    }
}
