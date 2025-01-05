string standalone.makeApiRequest(String url, String method, Map headers, String payload)
{
    /*
     * Makes an API request to the specified URL using the given HTTP method, headers, and payload.
     *
     * @param url The endpoint URL for the API request.
     * @param method The HTTP method to use for the request ("GET", "POST", "PUT").
     * @param headers A map containing the necessary HTTP headers for the request.
     * @param payload The payload to send with the request (for "POST" and "PUT" methods).
     * @return A map containing the response from the API, including the HTTP status code and any returned data.
     */
    response = Map();
    try {
        if (method == "GET") {
            response = invokeurl
            [
                url : url
            type: GET
            headers: headers
            ];
        }
        else if (method == "POST") {
            response = invokeurl
            [
                url : url
            type: POST
            parameters: payload.toString()
            headers: headers
            ];
        }
        else if (method == "PUT") {
            response = invokeurl
            [
                url : url
            type: PUT
            parameters: payload.toString()
            headers: headers
            ];
        }
        else {
            info "Unsupported HTTP method: " + method;
            response.put("httpStatusCode", "0");
            response.put("message", "Unsupported HTTP method: " + method);
        }
    }
    catch (e) {
        // Handle network or unexpected errors
        response.put("httpStatusCode", "0");
        response.put("message", e.toString());
    }
    return response;
}
