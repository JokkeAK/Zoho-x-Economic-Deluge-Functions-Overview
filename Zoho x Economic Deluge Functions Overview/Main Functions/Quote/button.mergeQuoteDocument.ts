string button.mergeQuoteDocument(String quoteZohoWriterTemplateId, String quoteId, String licenseId, String accountId)
{
    /*
     * Merges quote details into a PDF document using Zoho Writer and attaches it to the Visiana Quotes record.
     *
     * @param quoteZohoWriterTemplateId The ID of the quote template from Zoho Writer.
     * @param quoteId The ID of the quote record in Zoho CRM.
     * @param licenseId The ID of the license record in Zoho CRM.
     * @param accountId The ID of the account record in Zoho CRM.
     * @return A string indicating the success or failure of the PDF creation process.
    */
    try {
        // Call the helper function to merge the document
        response = standalone.mergeDocument(quoteZohoWriterTemplateId, quoteId, licenseId, accountId, "Visiana_Quotes", "Extra_Quoted_Items_Quo", "Quote");
        info response;
        if (response.contains("Error")) {
            return response;
        }
        else {
            return "PDF created successfully.";
        }
    }
    catch (e) {
        info "Error in mergeQuoteDocument: " + e.toString();
        return "Error: An unexpected error occurred while merging the PDF.";
    }
}
