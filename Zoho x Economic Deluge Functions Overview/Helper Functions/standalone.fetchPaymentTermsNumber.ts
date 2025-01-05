string standalone.fetchPaymentTermsNumber(String paymentTermsName, Map headersMap)
{
    /*
     * Retrieves the payment terms number from E-conomic based on the provided payment terms name.
     *
     * @param paymentTermsName The name of the payment terms to search for in E-conomic.
     * @param headersMap A map containing the necessary HTTP headers for the API request.
     * @return A string representing the payment terms number if found; otherwise, an empty string.
     */
    try {
        // Define the API endpoint for fetching payment terms with a page size of 1000
        apiUrlPaymentTerms = "https://restapi.e-conomic.com/payment-terms?pagesize=1000";

        // Make the API request to fetch payment terms
        paymentTermsResponse = standalone.makeApiRequest(apiUrlPaymentTerms, "GET", headersMap, "");

        // Check the HTTP status code to ensure the request was successful
        httpStatusCodeCreate = paymentTermsResponse.get("httpStatusCode");
        if (standalone.handleHttpStatusCode(httpStatusCodeCreate, "Fetching Payment Term Number from E-conomic", paymentTermsResponse) == "false") {
            return "";
        }

        // Iterate through the payment terms to find a matching name
        if (paymentTermsResponse.get("collection") != null && !paymentTermsResponse.get("collection").isEmpty()) {
            paymentTermsList = paymentTermsResponse.get("collection");
            for each paymentTerms in paymentTermsList
            {
                    if(paymentTerms.get("name") != null && paymentTerms.get("name").toLowerCase() == paymentTermsName.toLowerCase())
                {
                return paymentTerms.get("paymentTermsNumber");
            }
        }
    }

        // If no matching payment term is found
        info "Payment Terms not found for name: " + paymentTermsName;
}
    catch (e) {
        info "Error fetching payment terms: " + e.toString();
}
return "";
}
