string standalone.registerInvoiceAsBookedInEconomic(String invoiceId)
{
    /*
     * Registers an invoice as "Booked" in E-conomic if it's not already booked.
     *
     * @param invoiceId The ID of the invoice record in Zoho CRM.
     * @return A string indicating the success or failure of the booking process.
     */
    try {
        // Retrieve E-conomic API tokens and set up HTTP headers
        headersMap = standalone.setUpApiHeaders();
        if (headersMap == "") {
            // Tokens not found; exit the function to prevent further errors
            info "Exit at step 1: Failed to retrieve API tokens.";
            return "Error: Failed to retrieve API tokens.";
        }

        // Fetch invoice details from Zoho CRM
        invoiceDetails = zoho.crm.getRecordById("Visiana_Invoices", invoiceId);
        if (invoiceDetails == null) {
            info "Exit at step 2: Invoice record not found.";
            return "Error: Invoice record not found";
        }

        // Retrieve the invoice stage and invoice number 
        invoiceStage = invoiceDetails.get("Invoice_Stage");
        info "Invoice stage: " + invoiceStage;
        if (invoiceStage == null || invoiceStage == "") {
            info "Exit at step 2.1: Invoice stage not found in the invoice.";
            return "Error: Invoice stage not found in the invoice";
        }

        invoiceNumber = invoiceDetails.get("Invoice_Number");
        info "Invoice number: " + invoiceNumber;
        if (invoiceNumber == null || invoiceNumber == "") {
            info "Exit at step 2.1: Invoice number not found in the invoice.";
            return "Error: Invoice number not found in the invoice";
        }

        // If the invoice stage is not "Booked" in Zoho, make the POST request 
        if (invoiceStage != "Booked") {
            // Prepare invoice data
            invoiceData = { "draftInvoice": { "draftInvoiceNumber": invoiceNumber } };

            // Register the invoice in E-conomic as "Booked"
            apiUrlInvoice = "https://restapi.e-conomic.com/invoices/booked/";
            bookedResponse = standalone.makeApiRequest(apiUrlInvoice, "POST", headersMap, invoiceData);

            // Check the HTTP status code
            httpStatusCode = bookedResponse.get("httpStatusCode");
            info bookedResponse.get("bookedInvoiceNumber");
            info httpStatusCode;

            if (standalone.handleHttpStatusCode(httpStatusCode, "Registering invoice as 'Booked' in E-conomic", bookedResponse) == "false") {
                // If handling the status code returns false, exit the function
                info "Exit at step 5: POST request failed.";
                return "Error: POST request failed. " + bookedResponse;
            }
            else {
                // Update the booking number for the invoice
                bookedNumber = bookedResponse.get("bookedInvoiceNumber");
                updateMap = Map();
                updateMap.put("Booked_Invoice_Number", bookedNumber);
                updateResponseLicense = zoho.crm.updateRecord("Visiana_Invoices", invoiceId, updateMap);
                return "Successfully registered the invoice in E-conomic as 'Booked'.";
            }
        }
        else {
            info "The invoice stage is already 'Booked'.";
            return "Error: The invoice stage is already 'Booked'. Cannot book an invoice twice.";
        }
    }
    catch (e) {
        info "Error in registerInvoiceAsBookedInEconomic: " + e.toString();
        return "Error in registerInvoiceAsBookedInEconomic";
    }
}
