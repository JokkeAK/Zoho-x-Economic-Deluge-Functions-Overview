string standalone.fetchVatZoneNumber(String vatZoneName, Map headersMap)
{
    /*
     * Retrieves the VAT zone number from E-conomic based on the provided VAT zone name.
     *
     * @param vatZoneName The name of the VAT zone to search for in E-conomic.
     * @param headersMap A map containing the necessary HTTP headers for the API request.
     * @return A string representing the VAT zone number if found; otherwise, an empty string.
     */
    try {
        // Define the API endpoint for fetching VAT zones with a page size of 1000
        apiUrlVatZones = "https://restapi.e-conomic.com/vat-zones?pagesize=1000";

        // Make the API request to fetch VAT zones
        vatZonesResponse = standalone.makeApiRequest(apiUrlVatZones, "GET", headersMap, "");

        // Check the HTTP status code to ensure the request was successful
        httpStatusCodeCreate = vatZonesResponse.get("httpStatusCode");
        if (standalone.handleHttpStatusCode(httpStatusCodeCreate, "Fetching VAT Zone Number from E-conomic", vatZonesResponse) == "false") {
            return "";
        }

        // Iterate through the VAT zones to find a matching name
        if (vatZonesResponse.get("collection") != null && !vatZonesResponse.get("collection").isEmpty()) {
            vatZonesList = vatZonesResponse.get("collection");
            for each vatZone in vatZonesList
            {
                    if(vatZone.get("name") != null && vatZone.get("name").toLowerCase() == vatZoneName.toLowerCase())
                {
                return vatZone.get("vatZoneNumber").toNumber();
            }
        }
    }

        // If no matching VAT zone is found
        info "VAT Zone not found for name: " + vatZoneName;
}
    catch (e) {
        info "Error fetching VAT Zones from E-conomic: " + e.toString();
}
return "";
}
